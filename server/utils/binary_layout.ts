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

const MAGIC_TRAILERS = {
  COMPILE: "D3N0L4ND".toLowerCase(),
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
  const trailerBuffer = new Uint8Array(24);
  const trailerOffset = binary.seekSync(offset, Deno.SeekMode.Start);
  binary.readSync(trailerBuffer);
  console.log(
    `Reading 24 byte trailer for "${magicTrailer}" at ${asHex(trailerOffset)}`,
  );
  const decodedMagic = decoder.decode(trailerBuffer.subarray(0, 8));
  if (decodedMagic !== magicTrailer) {
    console.log(`Magic was "${decodedMagic}"; bailing`);
    return false;
  }
  const dv = new DataView(trailerBuffer.buffer, 8);
  const bundleOffset = Number(dv.getBigUint64(0));
  const metadataOffset = Number(dv.getBigUint64(8));
  console.log(
    `Read 2x u64 pointers ${asHex(bundleOffset)}${asHex(metadataOffset)}`,
  );

  const bundleLen = metadataOffset - bundleOffset;
  const metadataLen = trailerOffset - metadataOffset;

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
  const currentOffset = await binary.seek(0, Deno.SeekMode.Current);
  console.log(
    `Writing magic "${magicTrailer}" at ${asHex(currentOffset)}`,
  );
  await binary.write(encoder.encode(magicTrailer));
  console.log(
    `Writing 2x u64 pointers ${asHex(bundleOffset)}${asHex(metadataOffset)}`,
  );
  const pointers = new Uint8Array(16);
  const dv = new DataView(pointers.buffer);
  dv.setBigUint64(0, BigInt(bundleOffset));
  dv.setBigUint64(8, BigInt(metadataOffset));
  await binary.write(pointers);
}

function readBinaryLayout(binary: Deno.File): BinaryLayout {
  const EOF = binary.seekSync(0, Deno.SeekMode.End);
  const compilePayloadInfo = readTrailer({
    binary,
    offset: EOF - 24,
    magicTrailer: MAGIC_TRAILERS.COMPILE,
  });
  // It's 100% unlikely that there's an embed payload and no compile payload,
  // but check anyway...
  const embedOffset = compilePayloadInfo
    ? compilePayloadInfo.bundleOffset - 24
    : EOF - 24;
  const embedPayloadInfo = readTrailer({
    binary,
    offset: embedOffset,
    magicTrailer: MAGIC_TRAILERS.EMBED,
  });
  return {
    compilePayload: compilePayloadInfo,
    embedPayload: embedPayloadInfo,
  };
}

export type { BinaryLayout, BundleMetadataLayout };
export { asHex, MAGIC_TRAILERS, readBinaryLayout, readTrailer, writeTrailer };
