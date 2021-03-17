#!/usr/bin/env -S deno run --allow-all --unstable

import * as path from "https://deno.land/std/path/mod.ts";
import * as fs from "https://deno.land/std/fs/mod.ts";
import * as color from "https://deno.land/std/fmt/colors.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import {
  assert,
  assertStrictEquals,
} from "https://deno.land/std/testing/asserts.ts";

import {
  asHex,
  MAGIC_TRAILERS,
  readBinaryLayout,
  writeTrailer,
} from "../utils/binary_layout.ts";
import { exit } from "../utils/exit.ts";

import type { EmbedHeader } from "../utils/embed_header.ts";

if (!import.meta.main) {
  throw new Error(`Don't import this`);
}

function printHelp() {
  console.log(`Deno binary filesystem embedder
Usage:

  > ./embed.ts [OPTIONS] <DenoBinary0> [...<DenoBinaryN>]

Embeds file trees merged from provided --root= paths. Files are loaded into a
bundle in memory and then embedded to each provided Deno binary.

Options:

  --root=     Required. The folder to walk. You can pass this multiple times to
              overwrite entries.

  --limit=    Defaults to 100MB. Prevents the system from running out of memory
              if the --root path is too large.

  --help      Prints this text and any provided arguments.

Examples:

  > ./embed.ts --root=./dir1 --root=./dir2 --limit=20MB ./bin/*
  > ./embed.ts --root=/path/to/folder --limit=20MB --dry-run ./localstar
`);
}

// Helper
const toBytes = (human: string) => {
  const match = human.match(/^(\d+)([KMG]?B?)$/i);
  if (!match) return (`Unknown limit ${human}`);
  const [, number, unit] = match;
  const multiplier = {
    B: 1,
    K: 1 << 10,
    M: 1 << 20,
    G: 1 << 30,
  }[unit.toUpperCase()[0] || "B"];
  if (!multiplier) return (`Unknown limit unit "${unit}"`);
  return Number(number) * multiplier;
};

const encoder = new TextEncoder();

const flags = parse(Deno.args, {
  boolean: ["dry-run", "help"],
  string: ["root", "limit"],
  unknown: (arg) => {
    if (arg[0] === "-") throw exit(1, `Unknown arg "${arg}"`);
  },
}) as {
  "_": string | string[];
  "root"?: string | string[];
  "limit"?: number;
  "dry-run"?: boolean;
  "help"?: boolean;
};

if (flags.help) {
  printHelp();
  throw exit(0, "Args:", Deno.args);
}
if (flags._.length === 0) {
  throw exit(1, "Must specify binaries to embed into; see --help");
}
if (
  typeof flags.root === "undefined" || flags.root === "" ||
  Array.isArray(flags.root) && flags.root.some((x) => x === "")
) {
  throw exit(1, "Must specify a non-empty --root arg");
}
if (Array.isArray(flags.limit)) {
  throw exit(1, "Must specify --limit only once");
}

const binaries = flags._;
const rootFolders = Array.isArray(flags.root) ? flags.root : [flags.root];
const limit = toBytes(String(flags.limit ?? "100MB"));

for (const root of rootFolders) {
  if (!await fs.exists(root) || !(await Deno.stat(root)).isDirectory) {
    throw exit(1, `Given --root isn't a directory: "${root}"`);
  }
}

const filesToBundle: Record<string, string> = {};
for (const root of rootFolders) {
  for await (const file of fs.walk(root, { includeDirs: false })) {
    const embedPath = path.join("/", path.relative(root, file.path));
    if (filesToBundle[embedPath]) {
      console.log(
        color.red(
          `⚠ File ${file.path} overwrites ${
            filesToBundle[embedPath]
          } for embed path ${embedPath}`,
        ),
      );
    }
    filesToBundle[embedPath] = file.path;
  }
}

const embedHeader: EmbedHeader = {
  version: {
    deno: Deno.version.deno,
    starboard: "TODO(*):",
  },
  files: {},
};
// XXX: Buffers can only be read _once_. I use readAll() after to get an proper
// ArrayBuffer/Uint8Array that can be read multiple times
const embedBundleDenoBuffer = new Deno.Buffer();
for (const [embedPath, localPath] of Object.entries(filesToBundle)) {
  const { size } = await Deno.stat(localPath);
  if (embedBundleDenoBuffer.length + size > limit) {
    console.log(
      color.red(`⚠ Size limit reached: ${embedBundleDenoBuffer.length} bytes`),
    );
    break;
  }
  embedHeader.files[embedPath] = {
    offset: embedBundleDenoBuffer.length,
    size,
  };
  const file = await Deno.open(localPath);
  await Deno.copy(file, embedBundleDenoBuffer);
  file.close();
}
console.log(
  `Embed bundle is ${
    Object.keys(embedHeader.files).length
  } files (${embedBundleDenoBuffer.length} bytes)`,
);
const embedBundleBuffer = await Deno.readAll(embedBundleDenoBuffer);
console.log(embedHeader);

for (const binaryPath of binaries) {
  console.log(`\n${color.bgWhite(color.black(`Binary: ${binaryPath}`))}`);
  const binary = await Deno.open(binaryPath, { read: true, write: true });
  const layoutStart = readBinaryLayout(binary);

  if (layoutStart.compilePayload === false) {
    console.log(`Skipping uncompiled binary`);
    binary.close();
    continue;
  }
  if (layoutStart.embedPayload !== false) {
    console.log(`Skipping binary that already has an embed filesystem`);
    binary.close();
    continue;
  }

  // Load the compile payload in memory
  const { bundleLen, bundleOffset, metadataLen, metadataOffset } =
    layoutStart.compilePayload;

  // This is where things get weird. currentEOF will return an offset to the RIGHT of
  // the last data byte. So a 21 byte file has data at 0x00...0x14 (20b) which
  // is 0x15 bytes (21b) but currentEOF=0x15 which IS NOT data.

  let currentEOF = await binary.seek(0, Deno.SeekMode.End);

  // This is it. This is the moment.
  const denoEOF = bundleOffset;

  const compilePayloadBuffer = new Uint8Array(bundleLen + metadataLen);
  await binary.seek(bundleOffset, Deno.SeekMode.Start);
  let n = 0;
  while (n < bundleLen + metadataLen) {
    const nread = await binary.read(compilePayloadBuffer.subarray(n));
    if (nread === null) break;
    n += nread;
  }
  assertStrictEquals(n, bundleLen + metadataLen);
  console.log(`Sizes:
  - Deno: [0x00,${asHex(denoEOF)})
  - Compile bundle/JS: ${bundleLen} bytes
  - Compile metadata/JSON: ${metadataLen} bytes`);

  // Truncate so the binary is only Deno. Parameter is currentEOF aka the ghost byte
  // which is not a real data offset
  await Deno.truncate(binaryPath, denoEOF);
  currentEOF = await binary.seek(0, Deno.SeekMode.End);
  assertStrictEquals(denoEOF, currentEOF);

  // To adjust the u64s from layoutStart; size includes embed trailer+u64s
  let embedPayloadSize = 0;

  // Add embed bundle
  {
    await Deno.writeAll(binary, embedBundleBuffer);
    console.log(
      `Wrote embed bundle [${asHex(currentEOF)},${
        asHex(currentEOF = await binary.seek(0, Deno.SeekMode.End))
      })`,
    );
    embedPayloadSize += embedBundleBuffer.length;
  }
  // Add embed metadataBuffer with adjusted offsets
  {
    const customEmbedHeader: EmbedHeader = {
      version: embedHeader.version,
      files: {},
    };
    for (const [embedPath, o] of Object.entries(embedHeader.files)) {
      customEmbedHeader.files[embedPath] = {
        size: o.size,
        offset: o.offset + denoEOF,
      };
    }
    const metadataBuffer = encoder.encode(JSON.stringify(customEmbedHeader));
    await Deno.writeAll(binary, metadataBuffer);
    console.log(
      `Wrote embed metadata [${asHex(currentEOF)},${
        asHex(currentEOF = await binary.seek(0, Deno.SeekMode.End))
      })`,
    );
    embedPayloadSize += metadataBuffer.length;
  }
  // Add embed trailer
  {
    await writeTrailer({
      binary,
      magicTrailer: MAGIC_TRAILERS.EMBED,
      bundleOffset: denoEOF,
      metadataOffset: denoEOF + embedBundleBuffer.length,
    });
    console.log(
      `Wrote embed trailer [${asHex(currentEOF)},${
        asHex(currentEOF = await binary.seek(0, Deno.SeekMode.End))
      })`,
    );
    embedPayloadSize += 24;
  }
  // Add compiled payload (bundle+metadata)
  {
    await Deno.writeAll(binary, compilePayloadBuffer);
    console.log(
      `Wrote compile bundle+metadata [${asHex(currentEOF)},${
        asHex(currentEOF = await binary.seek(0, Deno.SeekMode.End))
      })`,
    );
  }
  // Add compiled trailer
  {
    const prev = layoutStart.compilePayload;
    await writeTrailer({
      binary,
      magicTrailer: MAGIC_TRAILERS.COMPILE,
      bundleOffset: prev.bundleOffset + embedPayloadSize,
      metadataOffset: prev.metadataOffset + embedPayloadSize,
    });
    console.log(
      `Wrote compile trailer [${asHex(currentEOF)},${
        asHex(currentEOF = await binary.seek(0, Deno.SeekMode.End))
      })`,
    );
  }
  // Check
  console.log("Integrity check");
  let ok = true;
  const a = (
    assertion: typeof assert | typeof assertStrictEquals,
    ...args: unknown[]
  ) => {
    try {
      // @ts-ignore Shhh
      assertion(...args);
      console.log(assertion.name, "PASSED");
    } catch (e) {
      ok = false;
      console.log(assertion.name, "FAILED");
      console.log(e);
    }
  };
  const layoutFinal = readBinaryLayout(binary);
  a(assert, layoutFinal.compilePayload !== false);
  a(assert, layoutFinal.embedPayload !== false);
  a(
    assertStrictEquals,
    layoutFinal.compilePayload && layoutFinal.compilePayload.bundleOffset,
    layoutStart.compilePayload.bundleOffset + embedPayloadSize,
  );
  a(
    assertStrictEquals,
    layoutFinal.compilePayload && layoutFinal.compilePayload.metadataOffset,
    layoutStart.compilePayload.metadataOffset + embedPayloadSize,
  );
  if (ok) console.log("Binary OK 📦✅");
  binary.close();
}
