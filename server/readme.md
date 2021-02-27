## Features:

- Webserver

Serve the internal files and have a way to mount a directory.
Argument passing via compiled binaries?
Port.
Directory.

- Update check
  - Starboard check?
    - via npm ungz+untar
    - via github unzip
  - Deno check?
  - Self check? From our repo somehow...

Notification is fine.

## Packing/Building

Two step build process since we don't officially know the size of the Deno
executable since `--lite` and `--target` executables are downloaded from their
server and could change size at any time.

Step 1:

```
deno compile --unstable --allow-all starboard-deno.ts
```

- Deno itself
- Starboard-Deno with EMBED_LOC=0
- Deno
- U64 A
- U64 B

Next I have an embedWriter.ts script that:
1) Reads the U64 A
2) Copies Deno from 0-A to a new binary
4) Generates the JSON of
  {
    version: {
      self: commit/1.3.2
      deno: commit/1.3.2
      starboard: commit/1.3.2
    }
    embeds: [
      { filePath, hash?, size }
      { filePath, hash?, size }
      { filePath, hash?, size }
      ...
    ]
  }
5) Save this seek position: EO_DENO_SEEK
6) Get size of JSON.stringify() JSON_SIZE
7) Write JSON_SIZE immediately after Deno (TODO: U64? U32? Any? Probably.)
8) Write the JSON immediately after JSON_SIZE
9) For each file in the embed payload, in order, write it
10) Save this seek position: EO_STARBOARD_SEEK
11) Copy everything up to EOF-12 over
    1)  no no no no no. EMBED_LOC update
12) Assert the last 8 characters are DENOLAND
13) New pointer = Old pointer + String(JSON_SIZE).length + JSON_SIZE + EMBEDS.reduce(...)
    Hmm. Or. Or. Um. Pointer += (Current seek - EO_DENO_SEEK)
    Or.
    Read old JS pointer. (OLD_JS)
    JS pointer = EO_STARBOARD_SEEK
    DIFF = JS - OLD_JS
    JSON = JSON + DIFF
