#!/usr/bin/env -S deno run --allow-all --unstable
import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import * as color from "https://deno.land/std/fmt/colors.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";

import { Untar } from "https://deno.land/std/archive/tar.ts";
import { gunzipSync } from "https://cdn.skypack.dev/fflate";

// Windows knows how to process "/" paths so it's easier to convert to standard
// forward slash paths instead of "\\". https://www.npmjs.com/package/slash
const slash = (fsPath: string) => fsPath.replaceAll("\\", "/");

const starboardDownloadDir = "../starboard";
const starboardUnpackDir = `${starboardDownloadDir}/starboard-notebook`;
const localstarBinDir = "./bin";

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

if (!await fs.exists(starboardUnpackDir)) {
  console.log(`No Starboard directory at "${starboardUnpackDir}"; installing`);

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

  // Ungzip
  const tarData = gunzipSync(tgzData) as Uint8Array;

  // Unpack tar to folder
  const untar = new Untar(new Deno.Buffer(tarData));
  let totalCount = 0;
  let unpackedCount = 0;
  for await (const entry of untar) {
    totalCount++;
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
    unpackedCount++;
    const file = await Deno.open(fsPath, { write: true });
    await Deno.copy(entry, file);
    file.close();
  }
  console.log(
    `Unpacked ${unpackedCount}/${totalCount} files from tgz ${tgzPath}`,
  );
} else {
  console.log(`Found Starboard files at "${starboardUnpackDir}"`);
}

console.log(`Removing Localstar binaries at "${localstarBinDir}"`);
await fs.emptyDir(localstarBinDir);

await sh(
  `deno run -A --unstable ./scripts/compile.ts --lite
    --output=${localstarBinDir}/[target]/[name]-${Deno.version.deno}
    --allow-read
    --allow-net
    ./localstar.ts`,
);
const binaries = [];
for await (const bin of fs.walk(localstarBinDir, { includeDirs: false })) {
  binaries.push(bin.path);
}
await sh(
  `deno run -A --unstable ./scripts/embed.ts`,
  ...binaries,
  `--root=../client/build/`,
  // XXX: This needs to line up with what the client expects
  // TODO: @Dylan should you keep Starboard files in client/ and install them as
  // part of an npm post-install script? That way you can dev with them locally
  `--root=${starboardDownloadDir}`,
);

async function sh(cmd: string, ...other: string[]) {
  const cmdArr = [
    ...cmd
      .replaceAll(/(\n|\s)+/g, " ")
      .split(" "),
    ...other,
  ].map(slash);
  console.log(color.brightBlue("Run"), cmdArr.join(" "));
  const p = Deno.run({ cmd: cmdArr });
  await p.status();
}
