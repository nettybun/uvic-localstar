import { Application } from "https://deno.land/x/oak/mod.ts";

import * as path from "https://deno.land/std/path/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";

import slash from "https://deno.land/x/slash/mod.ts";
import { open } from "https://deno.land/x/opener/mod.ts";

import { asHex, readBinaryLayout } from "./lib/binary_layout.ts";

import type { EmbedHeader } from "./lib/embed_header.ts";

interface ServerArgs {
  _: string[];
  host?: string;
  port?: number;
  cors?: boolean;
}

// Uint8Array of UTF-8 string
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const denoBinary = Deno.openSync(Deno.execPath(), { read: true });
const denoLayout = readBinaryLayout(denoBinary);
const denoEmbedMetadata: EmbedHeader = {
  version: {
    deno: "No embed",
    starboard: "No embed",
  },
  files: {},
};
const denoEmbedCache = new Map<string, Uint8Array>();

const serverArgs = parse(Deno.args) as ServerArgs;
// Path on the OS to serve files from
const localFilesystemRoot = path.resolve(serverArgs._[0] ?? "");
// Path on the OS to serve embeds from when `denoLayout.embedPayload === false`
const embedFilesystemRoot = localFilesystemRoot;

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello world!";
});

const controller = new AbortController();
const server = app.listen({ port: PORT, signal: controller.signal });

// Listen for SigTerm (Docker shutdown) SigInt (CTRL-C) and SIGABRT.
await Promise.any(
  [
    Deno.signal(Deno.Signal.SIGTERM),
    Deno.signal(Deno.Signal.SIGINT),
    Deno.signal(Deno.Signal.SIGABRT),
  ],
);

// Signal Oak to shutdown
controller.abort();
// Wait for Oak to shutdown
await server;
console.log("Bye ✨");
Deno.exit();
