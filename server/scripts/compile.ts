#!/usr/bin/env -S deno run --allow-all --unstable

import * as path from "https://deno.land/std/path/mod.ts";
import * as fs from "https://deno.land/std/fs/mod.ts";
import * as color from "https://deno.land/std/fmt/colors.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";

const knownTargets = {
  x86_64_Linux: "x86_64-unknown-linux-gnu",
  x86_64_Windows: "x86_64-pc-windows-msvc",
  x86_64_Apple: "x86_64-apple-darwin",
  M1_Apple: "aarch64-apple-darwin",
} as const;

const isWindows = Deno.build.os === "windows";

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

  > ./compile.ts --target x86_64-apple-darwin --target x86_64-pc-windows-msvc --lite ../localstar.ts --port 8080
  > ./compile.ts --lite --output=../bin/[target]/compiled-[name]-$(date -Iminutes) ../localstar.ts
`);
}

if (import.meta.main) {
  // Parsing the wrapperOptions losses the order of [OPTIONS] and [FLAGS]
  // unfortunately so break it out based on the entrypoint
  const entrypointIndex = Deno.args.findIndex((arg) => !arg.startsWith("-"));
  const wrapperArgs = Deno.args.slice(
    0,
    // Don't keep the entrypoint
    entrypointIndex > -1 ? entrypointIndex : undefined,
  );
  // Edit: Ugh parsing args is really hard...
  const wrapperOptions = parse(wrapperArgs, { boolean: true }) as {
    _?: Array<string | number>;
    target?: unknown;
    output?: unknown;
    help?: unknown;
    [key: string]: unknown;
  };
  if (wrapperOptions.target === true || wrapperOptions.output === true) {
    console.log("Use `--arg=val` not `--arg val` for --target and --output");
    console.log("Args:", wrapperOptions);
    Deno.exit(1);
  }
  if (wrapperOptions.help) {
    printHelp();
    console.log("Args:", wrapperOptions);
    Deno.exit(0);
  }
  // Single --target passed
  if (typeof wrapperOptions.target === "string") {
    wrapperOptions.target = [wrapperOptions.target];
  }
  const targets = new Set(
    (wrapperOptions.target as string[]) ?? Object.values(knownTargets),
  );

  // Multiple --output passed
  if (Array.isArray(wrapperOptions.output)) {
    console.log("Can't use --output more than once");
    console.log("Args:", wrapperOptions);
    Deno.exit(1);
  }
  const output = String(wrapperOptions.output ?? "[name]-[target]");

  if (entrypointIndex < 0) {
    console.log("No entrypoint provided. Try `./compile.ts ./example.ts`");
    console.log("Args:", wrapperOptions);
    Deno.exit(1);
  }
  const entrypoint = String(Deno.args[entrypointIndex]);

  // Collect everything else to pass to `deno compile`
  delete wrapperOptions._;
  delete wrapperOptions.target;
  delete wrapperOptions.output;
  const compileOptions: string[] = [];
  for (const [k, v] of Object.entries(wrapperOptions)) {
    compileOptions.push(`--${k}`);
    // --lite will yield { lite: true }
    if (typeof v !== "boolean") {
      compileOptions.push(...(Array.isArray(v) ? v : [v]));
    }
  }

  // This is >= 0
  const runtimeFlags = Deno.args.slice(entrypointIndex + 1);
  console.log("Flags for runtime binary:", runtimeFlags);

  const name = path.basename(entrypoint, path.extname(entrypoint));
  const seenOutputValues = new Set<string>();
  for (const target of targets) {
    console.log();
    console.group(color.bgWhite(color.black(`Target: ${target}`)));
    let outputForTarget = output
      .replaceAll("[name]", name)
      .replaceAll("[target]", target);
    if (target === knownTargets.x86_64_Windows) {
      outputForTarget += ".exe";
    }
    if (seenOutputValues.has(outputForTarget)) {
      console.log(color.red(`⚠ Output path collision. Overwriting ${output}`));
    } else {
      seenOutputValues.add(outputForTarget);
    }
    const outputDir = path.dirname(path.resolve(outputForTarget));
    console.log("Output directory:", outputDir);
    await fs.ensureDir(outputDir);
    const cmd = [
      // XXX: Safe to assume it's on $PATH? Then "deno" is fine
      Deno.execPath(),
      "compile",
      "--unstable",
      `--target=${target}`,
      `--output=${outputForTarget}`,
      ...compileOptions,
      entrypoint,
      ...runtimeFlags,
    ];
    console.log(`Run: ${cmd.join(" ")}`);
    const process = Deno.run({ cmd });
    const status = await process.status();
    console.log(`Exit: ${status.code}`);
    if (status.success) {
      try {
        console.log("Size:", (await Deno.stat(outputForTarget)).size);
      } catch (err) {
        console.log("Error checking size:", err);
      }
    }
    console.groupEnd();
  }
}
