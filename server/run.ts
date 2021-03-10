#!/usr/bin/env -S deno run --allow-all --unstable
import * as fs from "https://deno.land/std/fs/mod.ts";
import { SEP } from "https://deno.land/std/path/mod.ts";

const isWindows = Deno.build.os === "windows";
const osPath = (path: string) => isWindows ? path.replaceAll("/", SEP) : path;

const sh = async (cmd: string, ...other: string[]) => {
  const cmdArr = [...cmd.split(" "), ...other].map(osPath);
  console.log("$", cmdArr.join(" "));
  const p = Deno.run({ cmd: cmdArr });
  await p.status();
};

await sh(
  `deno run -A --unstable ./scripts/compile.ts --lite --output=bin/[name]-[target]-${Deno.version.deno} ./localstar.ts`,
);
const bins = [];
for await (const file of fs.walk(osPath("./bin/"), { includeDirs: false })) {
  bins.push(file.path);
}
await sh(
  `deno run -A --unstable ./scripts/embed.ts`,
  // TODO: I think the binary can have spaces in it?...
  ...bins,
  `--root=../client/build/`,
  `--root=../starboard/`,
);
