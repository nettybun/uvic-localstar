#!/usr/bin/env -S deno run --allow-all --unstable

// Two step build process since we don't officially know the size of the Deno
// executable since `--lite` and `--target` executables are downloaded from
// their server and could change size at any time.

// TODO(*): Build multiple Windows/Mac/Linux via --target and --output

import * as path from "https://deno.land/std/path/mod.ts";
import {
  assert,
  assertStrictEquals,
} from "https://deno.land/std/testing/asserts.ts";

import type { EmbedHeader } from "./embed.ts";

const [EMBED_DIR] = Deno.args;
if (!EMBED_DIR) {
  console.log("Provide a directory like `./build.ts ./path/to/files`");
  Deno.exit(1);
}
const EMBED_TS_MARKER = `// XXX: Everything below is replaced by build.ts`;
const TEST_COMPILE_PAYLOAD = 'console.log("📦");\n';

const decoder = new TextDecoder();

async function compileDeno(file: string, ...args: string[]) {
  const cmd = ["deno", "compile", "--unstable", "--lite", ...args, file];
  console.log(`$ ${cmd.join(" ")}`);
  const process = Deno.run({ cmd });
  const status = await process.status();
  console.log(`$ Exit ${status.code}`);
  assert(status.success);
}

function calculateBinaryLayout(binary: Deno.File) {
  // From: https://github.com/denoland/deno/blob/f4980898cd4946a9e5c1d194ab7dbc32de28bf43/cli/standalone.rs#L49-L78
  const TRAILER_MAGIC_TEXT = "d3n0l4nd";

  const trailerBuffer = new Uint8Array(24);
  const trailerOffset = binary.seekSync(-24, Deno.SeekMode.End);
  binary.readSync(trailerBuffer);
  const trailerString = decoder.decode(trailerBuffer);
  const trailerMagic = trailerString.slice(0, TRAILER_MAGIC_TEXT.length);
  assertStrictEquals(trailerMagic, TRAILER_MAGIC_TEXT);
  console.log(`Trailer OK: "${trailerMagic}"`);

  const dv = new DataView(trailerBuffer.buffer, 8);
  const bundleOffset = Number(dv.getBigUint64(0));
  const metadataOffset = Number(dv.getBigUint64(8));

  const bundleLen = metadataOffset - bundleOffset;
  const metadataLen = trailerOffset - metadataOffset;

  return {
    bundleOffset,
    bundleLen,
    metadataOffset,
    metadataLen,
  };
}

function writeToEmbedTs(content: string) {
  let embedTs = Deno.readTextFileSync("embed.ts");
  const replaceMarkerIndex = embedTs.lastIndexOf(EMBED_TS_MARKER);
  assert(
    replaceMarkerIndex !== -1,
    `Couldn't find "${EMBED_TS_MARKER}" in embed.ts`,
  );
  embedTs = embedTs.slice(0, replaceMarkerIndex + EMBED_TS_MARKER.length);

  console.log(
    "Writing to embed.ts",
    content.length > 300
      ? content.slice(0, Math.min(content.length, 300)) + "..."
      : content,
  );
  embedTs = embedTs + content;
  Deno.writeTextFileSync("embed.ts", embedTs);
}

function getSystemFileName(initName: string) {
  if (Deno.build.os === "windows") return `${initName}.exe`;
  else return initName;
}

Deno.writeTextFileSync("compileTest.ts", TEST_COMPILE_PAYLOAD);
await compileDeno("compileTest.ts");
Deno.removeSync("compileTest.ts");

let denoSize: number;
let embedOffset: number;
let embedHeader: EmbedHeader;

// Use a test binary to find the size of Deno itself
{
  const compileTestFileName = getSystemFileName("compileTest"); //cant find this file on windows as it is emitted as compileTest on unix and compileTest.exe on windows
  const testBinary = Deno.openSync(compileTestFileName, {
    read: true,
    write: true,
  });
  const testLayout = calculateBinaryLayout(testBinary);
  console.log("Layout for compileTest:", testLayout);

  // TODO(Grant): new Deno.Buffer() ?
  const bundleBuffer = new Uint8Array(testLayout.bundleLen);
  testBinary.seekSync(testLayout.bundleOffset, Deno.SeekMode.Start);
  testBinary.readSync(bundleBuffer);
  const payload = decoder.decode(bundleBuffer);
  assertStrictEquals(payload, TEST_COMPILE_PAYLOAD);
  // Trim incase it happens to end in \n
  console.log(`Payload OK: "${payload.trim()}"`);
  testBinary.close();
  denoSize = testLayout.bundleOffset - 1;
}

// Generate the embed header and write it to embed.ts for localstar.ts to import
{
  embedOffset = denoSize + 1;
  embedHeader = {
    versions: {
      deno: Deno.version.deno,
      starboard: "",
    },
    files: [],
  };
  // TODO(*): fs.expandGlob or walk? For nested directories, likely Dylan's.
  for (const dirEntry of Deno.readDirSync(EMBED_DIR)) {
    if (!dirEntry.isFile) continue;
    embedHeader.files.push(
      {
        path: dirEntry.name,
        size: Deno.statSync(path.join(EMBED_DIR, dirEntry.name)).size,
      },
    );
  }

  // March 2nd 1.8.0 https://github.com/denoland/deno/issues/1968#issuecomment-780503687
  // new Intl.Collator({ numeric: true, caseFirst: false });
  // Until then this sorts "1" < "10" < "2" :/
  embedHeader.files.sort((a, b) => {
    const x = path.extname(a.path).localeCompare(path.extname(b.path));
    return x === 0 ? a.path.localeCompare(b.path) : x;
  });

  const embedHeaderJSON = JSON.stringify(embedHeader, null, 2);
  writeToEmbedTs(`
export const EMBED_OFFSET = ${embedOffset};
export const EMBED_HEADER = ${embedHeaderJSON} as EmbedHeader;
`);
}

// Write the new Deno binary, load the files, nudge the offsets
{
  const initName = "localstar-init";
  await compileDeno(
    "localstar.ts",
    "--allow-read",
    "--allow-net",
    "--output",
    initName,
  );
  // Immediately replace it so we don't commit the changes by accident
  writeToEmbedTs(`
export const EMBED_OFFSET = 0;
export const EMBED_HEADER = {} as EmbedHeader;
`);
  const emittedInitFileName = getSystemFileName(initName);
  const lsInitBinary = Deno.openSync(emittedInitFileName, {
    read: true,
    write: true,
  });
  const lsInitLayout = calculateBinaryLayout(lsInitBinary);

  console.log(`Layout for ${emittedInitFileName}:`, lsInitLayout);
  // TODO(Grant): Is it "better" to Deno.copy rather than have Rust copyFile?
  const buildFileName = getSystemFileName("localstar");
  Deno.copyFileSync(emittedInitFileName, buildFileName);
  Deno.truncateSync(buildFileName, denoSize);
  const lsBinary = Deno.openSync(buildFileName, { read: true, write: true });
  lsBinary.seekSync(0, Deno.SeekMode.End);

  let embedPayloadSize = 0;
  for (const fileListing of embedHeader.files) {
    const file = Deno.openSync(path.join(EMBED_DIR, fileListing.path));
    embedPayloadSize += await Deno.copy(file, lsBinary);
    file.close();
  }
  console.log(`Wrote ${embedPayloadSize} bytes of embed files`);
  const calculatedBundleOffset = denoSize + embedPayloadSize;

  // Copy until EOF: aka bundle and trailer (magic/pointers)
  lsInitBinary.seekSync(lsInitLayout.bundleOffset, Deno.SeekMode.Start);
  {
    const bytes = await Deno.copy(lsInitBinary, lsBinary);
    const expected = lsInitLayout.bundleLen + lsInitLayout.metadataLen + 24;
    assertStrictEquals(bytes, expected);
  }

  // Check that the payload is in the right place
  const bufFrom = new Uint8Array(100);
  const bufTo = new Uint8Array(100);
  // TODO(Grant): Can I use Deno.copy() to write? Would it stop at 100 bytes?
  // Dylan: Deno copy def coms with a third options param where u could add something like {bufSize: 100}
  lsInitBinary.seekSync(lsInitLayout.bundleOffset, Deno.SeekMode.Start);
  lsInitBinary.readSync(bufFrom);
  console.log("End:", lsBinary.seekSync(0, Deno.SeekMode.End));
  console.log("BundleOffset:", calculatedBundleOffset);
  lsBinary.seekSync(calculatedBundleOffset, Deno.SeekMode.Start);
  lsBinary.readSync(bufTo);
  const payloadFrom = decoder.decode(bufFrom);
  const payloadTo = decoder.decode(bufTo);
  assertStrictEquals(payloadTo, payloadFrom);
  console.log("Payload copy check OK");

  // Update the pointers
  const diff = calculatedBundleOffset - lsInitLayout.bundleOffset;
  const bundleOffset = lsInitLayout.bundleOffset + diff;
  const metadataOffset = lsInitLayout.metadataOffset + diff;
  lsBinary.seekSync(-16, Deno.SeekMode.End);
  const pointers = new Uint8Array(16);
  const dv = new DataView(pointers.buffer);
  dv.setBigUint64(0, BigInt(bundleOffset));
  dv.setBigUint64(8, BigInt(metadataOffset));
  lsBinary.writeSync(pointers);

  // Check
  const lsBinaryLayout = calculateBinaryLayout(lsBinary);
  assert(lsBinaryLayout.bundleOffset === bundleOffset);
  assert(lsBinaryLayout.metadataOffset === metadataOffset);
  console.log("Pointers updated");
  console.log("OK 📦");

  // Done
  lsBinary.close();
  lsInitBinary.close();
  Deno.removeSync(emittedInitFileName);
}
