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

const filesToBundle: Record<string, string> = {};
for (const root of rootFolders) {
  for await (const file of fs.walk(root, { includeDirs: false })) {
    const embedPath = path.relative(root, file.path);
    console.log(file.path, "=>", embedPath);
    if (filesToBundle[embedPath]) {
      console.log(color.red(`⚠ Overwriting ${embedPath}`));
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
let embedBundleSize = 0;
const embedBundleBuffer = new Deno.Buffer();
for (const [embedPath, localPath] of Object.entries(filesToBundle)) {
  const { size } = await Deno.stat(localPath);
  if (embedBundleSize + size > limit) {
    console.log(
      color.red(`⚠ Size limit reached. Stopped at ${embedBundleSize}`),
    );
    break;
  }
  const file = await Deno.open(localPath);
  await Deno.copy(file, embedBundleBuffer);
  embedHeader.files[embedPath] = { size, offset: embedBundleSize };
  embedBundleSize += size;
  file.close();
}
console.log(embedHeader);
console.log(`Embed bundle is ${embedBundleSize} bytes`);

const encoder = new TextEncoder();

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

  const EOF = await binary.seek(0, Deno.SeekMode.End);

  console.table({
    bundleOffset: asHex(bundleOffset),
    metadataOffset: asHex(metadataOffset),
    trailerOffset: asHex(EOF - 24),
    EOF: asHex(EOF),
  });

  const compilePayloadBuffer = new Uint8Array(bundleLen + metadataLen);
  await binary.seek(
    bundleOffset,
    Deno.SeekMode.Start,
  );
  // TODO: Is this really the best way to read N bytes from a file? Feels like a
  // lot of code. Using `file.read(uintarray)` will stop at 16384 bytes.
  let n = 0;
  while (n < bundleLen + metadataLen) {
    const nread = await binary.read(compilePayloadBuffer.subarray(n));
    if (nread === null) break;
    n += nread;
  }
  assertStrictEquals(n, bundleLen + metadataLen);
  const denoSize = bundleOffset - 1;
  console.log(`Deno binary layout:
  - Deno size: ${denoSize}
  - Bundle/JS size: ${bundleLen} from ${asHex(bundleOffset)} to ${
    asHex(bundleOffset + bundleLen)
  }
  - Metadata/JSON size: ${metadataLen} from ${asHex(metadataOffset)} to ${
    asHex(metadataOffset + metadataLen)
  }`);

  // Truncate so the binary is only Deno
  await Deno.truncate(binaryPath, denoSize);

  // To adjust the u64s from layoutStart; size includes embed trailer+u64s
  let embedPayloadWritten = 0;

  // Add embed bundle
  await binary.seek(0, Deno.SeekMode.End);
  {
    await Deno.copy(embedBundleBuffer, binary);
    embedPayloadWritten += embedBundleSize;
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
        offset: o.offset + denoSize,
      };
    }
    const metadataBuffer = encoder.encode(JSON.stringify(customEmbedHeader));
    await Deno.writeAll(binary, metadataBuffer);
    embedPayloadWritten += metadataBuffer.byteLength;
  }
  // Add embed trailer
  {
    console.log("Adding embed payload trailer");
    await writeTrailer({
      binary,
      magicTrailer: MAGIC_TRAILERS.EMBED,
      bundleOffset: denoSize + 1,
      metadataOffset: denoSize + 1 + embedBundleSize,
    });
    embedPayloadWritten += 24;
  }
  // Add compiled payload (bundle+metadata)
  {
    console.log("Adding back the original compile payload");
    await Deno.writeAll(binary, compilePayloadBuffer);
  }
  // Add compiled trailer
  {
    console.log("Adding compile payload trailer");
    const prev = layoutStart.compilePayload;
    await writeTrailer({
      binary,
      magicTrailer: MAGIC_TRAILERS.COMPILE,
      bundleOffset: prev.bundleOffset + embedPayloadWritten,
      metadataOffset: prev.metadataOffset + embedPayloadWritten,
    });
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
    } catch (e) {
      ok = false;
      console.log(JSON.stringify(e));
      console.log(JSON.stringify(e.message));
    }
  };
  const layoutFinal = readBinaryLayout(binary);
  a(assert, layoutFinal.compilePayload !== false);
  a(assert, layoutFinal.embedPayload !== false);
  a(
    assertStrictEquals,
    layoutFinal.compilePayload && layoutFinal.compilePayload.bundleOffset,
    layoutStart.compilePayload.bundleOffset + embedPayloadWritten,
  );
  a(
    assertStrictEquals,
    layoutFinal.compilePayload && layoutFinal.compilePayload.metadataOffset,
    layoutStart.compilePayload.metadataOffset + embedPayloadWritten,
  );
  if (ok) console.log("Binary OK 📦✅");
  binary.close();
}
