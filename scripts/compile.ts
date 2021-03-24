#!/usr/bin/env -S deno run --allow-all --unstable

import * as path from "https://deno.land/std/path/mod.ts";
import * as fs from "https://deno.land/std/fs/mod.ts";
import * as color from "https://deno.land/std/fmt/colors.ts";

import { bytesToHuman } from "../deno/lib/byte_size.ts";
import { exit } from "../deno/lib/exit.ts";

if (!import.meta.main) {
  throw new Error(`Don't import this`);
}

const knownTargets = {
  x86_64_Linux: "x86_64-unknown-linux-gnu",
  x86_64_Windows: "x86_64-pc-windows-msvc",
  x86_64_Apple: "x86_64-apple-darwin",
  M1_Apple: "aarch64-apple-darwin",
} as const;

function printHelp() {
  console.log(`Deno multi-target compilation wrapper
Usage:

  > ./compile.ts [OPTIONS] <SCRIPT_ARG> [FLAGS]

  [OPTIONS] are processed by the compiler (run \`deno compile --help\`)
  [FLAGS] are given to the runtime program

Options processed before passing to \`deno compile\`:

  --target=   Platform to build for. If not provided all targets are built. This
              option can be provided multiple times. Known targets are:
              aarch64-apple-darwin, x86_64-apple-darwin,
              x86_64-pc-windows-msvc, x86_64-unknown-linux-gnu

  --output=   Defaults to $PWD/[name]-[target]. Where [name] is inferred from
              the entrypoint in SCRIPT_ARG and [target] is the platform.

  --help      Prints this text and any provided arguments.

Examples:

  > ./compile.ts --target=x86_64-apple-darwin --target=x86_64-pc-windows-msvc --lite ../localstar.ts --port 8080
  > ./compile.ts --lite --output=../bin/[target]/compiled-[name]-$(date -Iminutes) ../localstar.ts
`);
}

// Parsing is difficult because I want to leave most args untouched for Deno's
// compile subcommand handle parsing. Look for exactly --output and --target.
// Don't even validate the target in case that list change in the future.
type Flag = "target" | "output";
const flags: { [k in Flag]: string[] } = {
  target: [],
  output: [],
};
const args = [...Deno.args]; // Deno.args is read-only
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--help") {
    printHelp();
    throw exit(0, "Args:", Deno.args);
  }
  let m: RegExpMatchArray | null;
  // deno-lint-ignore no-cond-assign Match [--target, value]
  if (m = /^--(\w+)$/.exec(arg)) {
    const [, opt] = m;
    if (!(opt in flags)) continue;
    const value = args[i + 1];
    if (!value || value.startsWith("-")) {
      throw exit(1, `${arg} needs a value; see --help`);
    }
    flags[opt as Flag].push(value);
    console.log("Removing", args.splice(i, 2));
    i--; // Undo the upcoming loop i++
    continue;
  }
  // deno-lint-ignore no-cond-assign Match [--target=value]
  if (m = /^--(\w+)=(.*)/.exec(arg)) {
    const [, opt, value = ""] = m;
    if (!(opt in flags)) continue;
    flags[opt as Flag].push(value);
    console.log("Removing", args.splice(i, 1));
    continue;
  }
  // Not an option; stop early
  if (arg[0] !== "-") break;
}
console.log("Found:", flags);
console.log("Arguments for `deno compile`:", args);

const targets = new Set(
  flags.target.length ? flags.target : Object.values(knownTargets),
);

// Multiple --output passed
if (flags.output.length > 1) {
  throw exit(1, `Need only one --output. Given ${flags.output}`);
}
const output = String(flags.output[0] ?? "[name]-[target]");

const entrypoint = args.find((x) => x[0] !== "-");
if (!entrypoint) {
  throw exit(1, "No entrypoint provided. Try `./compile.ts ./example.ts`");
}
const name = path.basename(entrypoint, path.extname(entrypoint));
const seenOutput = new Set<string>();
for (const target of targets) {
  console.log();
  console.group(color.bgWhite(color.black(`Target: ${target}`)));
  let outputForTarget = output
    .replaceAll("[name]", name)
    .replaceAll("[target]", target);

  if (seenOutput.has(outputForTarget)) {
    console.log(color.red(`⚠ Output path collision. Overwriting ${output}`));
  } else {
    seenOutput.add(outputForTarget);
  }
  const outputDir = path.dirname(path.resolve(outputForTarget));
  console.log("Directory:", outputDir);
  await fs.ensureDir(outputDir);
  const cmd = [
    "deno",
    "compile",
    "--unstable",
    "--allow-all",
    `--target=${target}`,
    `--output=${outputForTarget}`,
    ...args,
  ];
  console.log(`Run: ${cmd.join(" ")}`);

  const process = Deno.run({ cmd });
 
  const status = await process.status();
  console.log(`Exit: ${status.code}`);
  if (target === knownTargets.x86_64_Windows) {
    outputForTarget += ".exe";
  }
  if (status.success) {
    try {
      console.log(
        "Size:",
        bytesToHuman((await Deno.stat(outputForTarget)).size),
      );
    } catch (err) {
      console.log("Error when checking size:", err);
    }
  }
  console.groupEnd();
}
