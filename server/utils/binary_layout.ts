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

const decoder = new TextDecoder();

function searchBundleMetadataLayout(options: {
  binary: Deno.File;
  offset: number;
  magicTrailer: string;
}): BundleMetadataLayout | false {
  const { binary, offset, magicTrailer } = options;
  const trailerBuffer = new Uint8Array(24);
  const trailerOffset = binary.seekSync(offset, Deno.SeekMode.Start);
  binary.readSync(trailerBuffer);
  const decodedString = decoder.decode(trailerBuffer);
  const decodedMagic = decodedString.slice(0, magicTrailer.length);
  if (decodedMagic !== magicTrailer) {
    console.log(
      `Trailer is wrong. Found: "${decodedMagic}" not "${magicTrailer}"`,
    );
    return false;
  }
  console.log(`Trailer OK: "${decodedMagic}"`);

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

function searchBinaryLayout(binary: Deno.File): BinaryLayout {
  const endOffset = binary.seekSync(0, Deno.SeekMode.End);
  const compilePayloadInfo = searchBundleMetadataLayout({
    binary,
    offset: endOffset - 24,
    magicTrailer: "d3n0l4nd",
  });
  if (compilePayloadInfo === false) {
    console.log("No compile payload");
  }
  // It's 100% unlikely that there's an embed payload and no compile payload,
  // but check anyway...
  const embedPayloadInfo = searchBundleMetadataLayout({
    binary,
    offset: compilePayloadInfo
      ? compilePayloadInfo.bundleOffset - 1 - 24
      : endOffset - 24,
    magicTrailer: "📦🧾",
  });
  if (embedPayloadInfo === false) {
    console.log("No embed payload");
  }
  return {
    compilePayload: compilePayloadInfo,
    embedPayload: embedPayloadInfo,
  };
}

export type { BinaryLayout, BundleMetadataLayout };
export { searchBinaryLayout, searchBundleMetadataLayout };
