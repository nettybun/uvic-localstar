/**
 * Deno's compiled binary goes Deno|Compile bundle|Compile metadata|D3N0L4ND|u64|u64
 * The trailer starts at EOF-24 bytes:
 *    8 bytes each: D3N0L4ND; u64; u64
 *    Where 1st u64 is Compile/JS bundle offset
 *    Where 2nd u64 is Compile/JSON metadata offset
 *    Meaning Deno is `bundleOffset - 1`  bytes in size
 *
 * Embedding a filesystem means having:
 * Deno|Embed bundle|Embed metadata|📦🧾|u64|u64|Compile bundle|Compile metadata|D3N0L4ND|u64|u64
 * This is the same trailer structure. 📦 is the bundle. 🧾 is the metadata.
 *
 * https://github.com/denoland/deno/blob/f4980898cd4946a9e5c1d194ab7dbc32de28bf43/cli/standalone.rs#L49-L78
 */

import * as path from "https://deno.land/std/path/mod.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";

type BundleMetadataLayout = {
  bundleOffset: number;
  bundleLen: number;
  metadataOffset: number;
  metadataLen: number;
};

// The binary could be untouched aka false
type BinaryLayout = {
  embedPayload: BundleMetadataLayout | false;
  compilePayload: BundleMetadataLayout | false;
};

type EmbedHeader = {
  version: {
    deno: string;
    starboard: string;
  };
  files: {
    [path: string]: {
      offset: number;
      size: number;
    };
  };
};

type EmbedTreeFileItem = string; // Full path to look up in denoEmbedMetadata
type EmbedTreeDirItem = { [k: string]: EmbedTreeFileItem | EmbedTreeDirItem };

const MAGIC_TRAILERS = {
  COMPILE: "d3n0l4nd",
  EMBED: "📦🧾",
};

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const asHex = (offset: number) => `0x${offset.toString(16).toUpperCase()}`;

function readTrailer(options: {
  binary: Deno.File;
  offset: number;
  magicTrailer: string;
}): BundleMetadataLayout | false {
  const { binary, offset, magicTrailer } = options;
  console.group(`readTrailer for ${magicTrailer}`);
  const trailerBuffer = new Uint8Array(24);
  const trailerOffset = binary.seekSync(offset, Deno.SeekMode.Start);
  binary.readSync(trailerBuffer);
  const decodedMagic = decoder.decode(trailerBuffer.subarray(0, 8));
  console.log(asHex(trailerOffset), `Magic: "${decodedMagic}"`);
  if (decodedMagic !== magicTrailer) {
    console.log("Wrong trailer magic");
    console.groupEnd();
    return false;
  }
  const dv = new DataView(trailerBuffer.buffer, 8);
  const bundleOffset = Number(dv.getBigUint64(0));
  const metadataOffset = Number(dv.getBigUint64(8));
  const bundleLen = metadataOffset - bundleOffset;
  const metadataLen = trailerOffset - metadataOffset;
  console.log(`OK. Layout from trailer:
- Bundle:   [${asHex(bundleOffset)},${asHex(metadataOffset)})
- Metadata: [${asHex(metadataOffset)},${asHex(trailerOffset)})
- Trailer:  [${asHex(trailerOffset)},${asHex(trailerOffset + 24)})`);
  console.groupEnd();
  return {
    bundleOffset,
    bundleLen,
    metadataOffset,
    metadataLen,
  };
}

async function writeTrailer(options: {
  binary: Deno.File;
  magicTrailer: string;
  bundleOffset: number;
  metadataOffset: number;
}): Promise<void> {
  const { binary, magicTrailer, bundleOffset, metadataOffset } = options;
  console.group(`writeTrailer for ${magicTrailer}`);
  const currentOffset = await binary.seek(0, Deno.SeekMode.Current);
  console.log(asHex(currentOffset), `Magic: "${magicTrailer}"`);
  await binary.write(encoder.encode(magicTrailer));
  console.log(`2x u64 pointers:
- Pointer to start of bundle: ${asHex(bundleOffset)}
- Pointer to start of metadata: ${asHex(metadataOffset)}`);
  const pointers = new Uint8Array(16);
  const dv = new DataView(pointers.buffer);
  dv.setBigUint64(0, BigInt(bundleOffset));
  dv.setBigUint64(8, BigInt(metadataOffset));
  await binary.write(pointers);
  console.groupEnd();
}

function readBinaryLayout(binary: Deno.File): BinaryLayout {
  const EOF = binary.seekSync(0, Deno.SeekMode.End);
  const compilePayloadInfo = readTrailer({
    binary,
    offset: EOF - 24,
    magicTrailer: MAGIC_TRAILERS.COMPILE,
  });
  if (compilePayloadInfo === false) {
    return {
      compilePayload: false,
      embedPayload: false,
    };
  }
  const denoEOF = compilePayloadInfo.bundleOffset;
  const embedPayloadInfo = readTrailer({
    binary,
    offset: denoEOF - 24,
    magicTrailer: MAGIC_TRAILERS.EMBED,
  });
  return {
    compilePayload: compilePayloadInfo,
    embedPayload: embedPayloadInfo,
  };
}

function buildEmbedDirectoryTree(header: EmbedHeader): EmbedTreeDirItem {
  const tree: EmbedTreeDirItem = {};
  // Build the directory tree
  for (const filePath of Object.keys(header.files)) {
    const dirs = path.dirname(filePath).split("/");
    const file = path.basename(filePath);
    // Walk
    let w = tree;
    for (const dir of dirs) {
      if (dir === "") {
        continue;
      }
      if (!w[dir]) {
        w[dir] = {};
      }
      // This better not already be a file like "cat/" and "cat" together...
      assert(typeof w[dir] !== "string");
      w = w[dir] as EmbedTreeDirItem;
    }
    // Place file
    w[file] = filePath;
  }
  return tree;
}

// Enum
export { MAGIC_TRAILERS };
// Functions
export {
  asHex,
  buildEmbedDirectoryTree,
  readBinaryLayout,
  readTrailer,
  writeTrailer,
};
// Binary utils
export type { BinaryLayout, BundleMetadataLayout };
// Embed payload
export type { EmbedHeader, EmbedTreeDirItem, EmbedTreeFileItem };
