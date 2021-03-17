#!/usr/bin/env -S deno run --allow-all --unstable

import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";

import { Untar } from "https://deno.land/std/archive/tar.ts";
import { gunzipSync } from "https://cdn.skypack.dev/fflate";

import { bytesToHuman } from "../deno/lib/byte_size.ts";

if (!import.meta.main) {
  throw new Error(`Don't import this`);
}

const starboardDownloadDir = "./starboard-dist";
const starboardUnpackDir = `${starboardDownloadDir}/starboard-notebook`;

// XXX: Maybe Deno.parse() and have --help etc etc
const argStarboardVersion = Deno.args[0] ?? "latest";

async function fetchStarboardLatestVersion(): Promise<string> {
  const res = await fetch(
    "https://registry.npmjs.org/starboard-notebook",
  );
  const data = await res.json();
  return data["dist-tags"]["latest"];
}

async function fetchStarboardTgz(version: string): Promise<Uint8Array> {
  const res = await fetch(
    `https://registry.npmjs.org/starboard-notebook/-/starboard-notebook-${version}.tgz`,
  );
  return new Uint8Array(await res.arrayBuffer());
}

if (argStarboardVersion === "latest") {
  if (await fs.exists(starboardUnpackDir)) {
    console.log(`Found Starboard files at ${starboardUnpackDir}`);
    Deno.exit(0);
  }
  console.log(`No Starboard directory at ${starboardUnpackDir}; installing`);
}

// Get version
let version;
if (argStarboardVersion === "latest") {
  version = await fetchStarboardLatestVersion();
  console.log(`Fetched latest version of Starboard: ${version}`);
} else {
  version = argStarboardVersion;
}

// Get tgz
const tgzPath = `${starboardDownloadDir}/starboard-notebook-${version}.tgz`;
let tgzData: Uint8Array;
if (await fs.exists(tgzPath)) {
  console.log(`Reading local ${version} tgz`);
  const tgzFile = await Deno.open(tgzPath, { read: true });
  tgzData = await Deno.readAll(tgzFile);
  tgzFile.close();
} else {
  console.log(`Downloading ${version} tgz`);
  tgzData = await fetchStarboardTgz(version);
  await fs.ensureFile(tgzPath);
  const tgzFile = await Deno.open(tgzPath, { write: true });
  await Deno.writeAll(tgzFile, tgzData);
  tgzFile.close();
}

// Empty
console.log(`Emptying ${starboardUnpackDir}`);
await fs.emptyDir(starboardUnpackDir);

// Ungzip
const tarData = gunzipSync(tgzData) as Uint8Array;

// Unpack tar to folder
const untar = new Untar(new Deno.Buffer(tarData));
let totalN = 0;
let unpackedN = 0;
let bytesWritten = 0;
for await (const entry of untar) {
  totalN++;
  const name = entry.fileName;
  assert(name.startsWith("package"));
  const isDir = entry.type === "directory";
  const isSkip = name.startsWith("package/dist") === false ||
    name.startsWith("package/dist/src") ||
    name.startsWith("package/dist/test");

  if (isSkip) continue;

  const fsPath = path.join(
    starboardUnpackDir,
    name.replace(/^package\/dist/, ""),
  );
  if (isDir) {
    await fs.ensureDir(fsPath);
    continue;
  }
  await fs.ensureFile(fsPath);
  console.log("Unpack:", fsPath);
  unpackedN++;
  const file = await Deno.open(fsPath, { write: true });
  bytesWritten += await Deno.copy(entry, file);
  file.close();
}
console.log(`Unpacked ${unpackedN}/${totalN} files from tgz ${tgzPath}`);
console.log(`Sizes for Starboard ${version}:
  - TGZ: ${bytesToHuman(tgzData.length)}
  - TAR: ${bytesToHuman(tarData.length)}
  - Unpacked: ${bytesToHuman(bytesWritten)}
`);
