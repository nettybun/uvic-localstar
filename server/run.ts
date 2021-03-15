#!/usr/bin/env -S deno run --allow-all --unstable
import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";

const isWindows = Deno.build.os === "windows";
const osPath = (fsPath: string) =>
  isWindows ? fsPath.replaceAll("/", path.SEP) : fsPath;

const sh = async (cmd: string, ...other: string[]) => {
  const cmdArr = [
    ...cmd
      .replaceAll(/(\n|\s)+/g, " ")
      .split(" "),
    ...other,
  ].map(osPath);
  console.log("$", cmdArr.join(" "));
  const p = Deno.run({ cmd: cmdArr });
  await p.status();
};

const starboardDir = osPath("../starboard");
const binDir = osPath("./bin");

if (Deno.args.includes("update") || !await fs.exists(starboardDir)) {
  console.log("Fetching latest Starboard files");
  const meta = await fetch("https://registry.npmjs.org/starboard-notebook")
    .then((res) => res.json());
  const version = meta["dist-tags"]["latest"];
  const tgzName = `starboard-notebook-${version}.tgz`;
  if (!await fs.exists(tgzName)) {
    const res = await fetch(
      `https://registry.npmjs.org/starboard-notebook/-/starboard-notebook-${version}.tgz`,
    );
    assert(res.body);
    const tgz = await Deno.open(tgzName, { write: true, create: true });
    const expected = Number(res.headers.get("content-length"));
    console.log(`Downloading ${tgzName} (${expected} bytes)`);
    for await (const chunk of res.body) await tgz.write(chunk);
    tgz.close();
  }
  await sh(`tgz -xzvf ${tgzName}`);
  await sh(`rm -r package/dist/src package/dist/test`);
  await sh(`mv package/dist ${starboardDir}`);
} else {
  console.log(`Using ${starboardDir} for Starboard files`);
}

Deno.removeSync(binDir, { recursive: true });

await sh(
  `deno run -A --unstable ./scripts/compile.ts --lite
    --output=${binDir}/[target]/[name]-${Deno.version.deno}
    --allow-read
    --allow-net
    ./localstar.ts`,
);
const binaries = [];
for await (const tgz of fs.walk(binDir, { includeDirs: false })) {
  binaries.push(tgz.path);
}
await sh(
  `deno run -A --unstable ./scripts/embed.ts`,
  ...binaries,
  `--root=../client/build/`,
  `--root=${starboardDir}`,
);
