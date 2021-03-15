#!/usr/bin/env -S deno run --allow-all --unstable
import * as fs from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";

const isWindows = Deno.build.os === "windows";
const OS = (fsPath: string) =>
  isWindows ? fsPath.replaceAll("/", path.SEP) : fsPath;

const sh = async (cmd: string, ...other: string[]) => {
  const cmdArr = [
    ...cmd
      .replaceAll(/(\n|\s)+/g, " ")
      .split(" "),
    ...other,
  ].map(OS);
  console.log("$", cmdArr.join(" "));
  const p = Deno.run({ cmd: cmdArr });
  await p.status();
};

const starboardDir = OS("../starboard");
// It's because I need it mounted at a lower level than --root...
const starboardMountDir = OS(`${starboardDir}/starboard-notebook`);
const binDir = OS("./bin");

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
  // TODO: Windows?
  await sh(`tar -xzvf ${tgzName}`);

  for (const dir of ["package/dist/src", "package/dist/test"]) {
    await Deno.remove(OS(dir), { recursive: true });
  }
  await fs.emptyDir(starboardDir);
  await Deno.rename(OS("package/dist"), starboardMountDir);
  await Deno.remove("package", { recursive: true });
} else {
  console.log(`Using ${starboardDir} for Starboard files`);
}

await Deno.remove(binDir, { recursive: true });

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
  // Should have only one directory called "starboard-notebook"
  // There should be no "Overwriting" warnings...
  `--root=${starboardDir}`,
);
