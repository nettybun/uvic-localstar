# Localstar Deno

This is a webserver that sends files to run Localstar and Starboard Notebook.
It's somewhat based on Deno's std/http/file_server.ts. Most of the code here is
about embedding a virtual read-only filesystem into compiled Deno executables,
since that's the hard part.

## Running

1. Install Deno. It's also a single executable like Localstar, so just drop it
   on your $PATH. https://deno.land/#installation

2. Clone/Download this repo and navigate here.

3. Run `./run.sh`

4. Done ✨ Run `./bin/localstar` for your platform

Or, alternatively do it by hand:

3. Run `./scripts/compile.ts ./localstar.ts --output=./bin/` This will
   bundle Localstar and all of its dependencies into a Deno binary for each
   platform. Read below for options.

4. Head up to _../client/_ and build their frontend.

5. Download Starboard's files. (3.3MB download; 12MB unpacked):
   https://registry.npmjs.org/starboard-notebook/-/starboard-notebook-0.7.14.tgz

6. Return here.

7. Run `scripts/embed.ts --root=../client/build/ --root=../starboard/ ./bin/*`
   to embed the files into each binary in _bin/_. Read below for options.

## Scripts

You can also run `--help` for options.

### `compile.ts`

This is a wrapper for `deno compile` which takes the same format:

```
./scripts/compile.ts [OPTIONS] <SCRIPT_ARG> [FLAGS]
```

Where `[OPTIONS]` are processed by the compiler (see `deno compile --help`) and
`[FLAGS]` are given to the runtime program.

These options are intercepted before passing to `deno compile`:

- `--target=`: Optional. Platform/target to build. Since `deno compile` only
  accepts this once passing this flag multiple times will call `deno compile`
  multiple times for each target. Default value is all targets. Values are:
  aarch64-apple-darwin, x86_64-apple-darwin, x86_64-pc-windows-msvc,
  x86_64-unknown-linux-gnu

- `--output=`: Optional. Defaults to `$PWD/[name]-[target]`. The builtin Deno
  flag `$PWD/<inferred-name>` is broken since won't include an ".exe" on Windows
  builds and will overwrite previous binaries since Linux and Mac will have the
  same filename unless `[target]` is included. Note that by overwriting this
  value you can't use Deno's special "inferred" naming logic for handling
  entrypoints like "mod.ts" and folder names - sorry. There's two values that
  are replaced in the path:

    - `[name]` is `path.basename(entrypointPath, path.extname(entrypointPath))`
    - `[target]` is the platform target

Examples:

```
./scripts/compile.ts --target=x86_64-apple-darwin --target=x86_64-pc-windows-msvc --lite ./localstar.ts --port 8080
./scripts/compile.ts --lite --output=./bin/[target]/compiled-[name]-$(date -Iminutes) ./localstar.ts
```

### `embed.ts`

Embeds a virtual filesystem into Deno binaries.

```
./scripts/embed.ts --root=../client/build/ --root=../starboard/ ./bin/*
```

Flags:

- `--root=`: Required. The folder to walk. You can pass this multiple times.

For now the entire virtual filesystem is held in memory before writing it to the
binary since it's likely written to multiple binaries. Roots can overwrite files
as they merge. TODO(Grant): You'll see a warning about this if it happens.

### `info.ts`

Prints info about the magic trailers in a Deno binary.

```
./scripts/info.ts ./bin/localstar
```
