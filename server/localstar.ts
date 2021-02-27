#!/usr/bin/env -S deno run --allow-net --allow-read

// Adapted from https://deno.land/std/http/file_server.ts which reads files from
// within the binary rather than the local filesystem. There are no directories,
// only files which may include "/".

// TODO(Michelle): std's server has onyl one export, serveFile. Could import it
// to support mounting a real FS directory available via a REST API or WS. I
// don't think Deno does tree-shaking, so it might bloat our bundle...

import { parse, path, serve } from "./deps.ts";
import type { Response, ServerRequest } from "./deps.ts";

import { EMBED_HEADER, EMBED_OFFSET } from "./embed.ts";

// TODO(*): Why aren't images here? Do browsers figure it out for us?
const MEDIA_TYPES: Record<string, string> = {
  ".md": "text/markdown",
  ".html": "text/html",
  ".htm": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".ts": "text/typescript",
  ".tsx": "text/tsx",
  ".js": "application/javascript",
  ".jsx": "text/jsx",
  ".gz": "application/gzip",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".mjs": "application/javascript",
  ".svg": "image/svg+xml",
};

// Never unloaded
const loadedFilesCache = new Map<string, string>();

// For conversion to Uint8Array of UTF-8
const encoder = new TextEncoder();

/** Returns the content-type based on the extension of a path. */
function contentType(filepath: string): string | undefined {
  return MEDIA_TYPES[path.extname(filepath)];
}

function fileLenToString(len: number): string {
  const multiplier = 1024;
  let base = 1;
  const suffix = ["B", "K", "M", "G", "T"];
  let suffixIndex = 0;

  while (base * multiplier < len) {
    if (suffixIndex >= suffix.length - 1) {
      break;
    }
    base *= multiplier;
    suffixIndex++;
  }

  return `${(len / base).toFixed(2)}${suffix[suffixIndex]}`;
}

// In file_server.ts they pass in the HTTP request to know that its safe to
// close the file (Deno.File). We're not using real files.
async function serveFile(filePath: string): Promise<Response> {
  const [file, fileInfo] = await Promise.all([
    Deno.open(filePath),
    Deno.stat(filePath),
  ]);
  const headers = new Headers();
  headers.set("content-length", fileInfo.size.toString());
  const contentTypeValue = contentType(filePath);
  if (contentTypeValue) {
    headers.set("content-type", contentTypeValue);
  }
  return {
    status: 200,
    body: file,
    headers,
  };
}

// There's no default redirect to index.html
function serveDir(): Response {
  // TODO(Dylan/Michelle): HTML? Let Preact do the human file sizing?
  const dir = EMBED_HEADER.files.map((fileListing) => {
    return { ...fileListing, sizeHuman: fileLenToString(fileListing.size) };
  });
  const body = encoder.encode(JSON.stringify(dir, null, 2));
  const headers = new Headers();
  headers.set("content-type", "application/json");
  const res = {
    status: 200,
    body,
    headers,
  };
  return res;
}

function serveFallback(req: ServerRequest, e: Error): Promise<Response> {
  if (e instanceof URIError) {
    return Promise.resolve({
      status: 400,
      body: encoder.encode("Bad Request"),
    });
  } else if (e instanceof Deno.errors.NotFound) {
    return Promise.resolve({
      status: 404,
      body: encoder.encode("Not Found"),
    });
  } else {
    return Promise.resolve({
      status: 500,
      body: encoder.encode("Internal server error"),
    });
  }
}

function serverLog(req: ServerRequest, res: Response): void {
  const d = new Date().toISOString();
  const dateFmt = `[${d.slice(0, 10)} ${d.slice(11, 19)}]`;
  const s = `${dateFmt} "${req.method} ${req.url} ${req.proto}" ${res.status}`;
  console.log(s);
}

console.log(JSON.stringify(EMBED_HEADER, null, 4));

// TODO(*): Implement this as serveFile() and store files in loadedFilesCache as
// we load them from the binary...

// const binary = Deno.openSync(Deno.execPath(), { read: true });
// binary.seekSync(EMBED_OFFSET, Deno.SeekMode.Start);
// // Print only the first 100 bytes instead of the 66000 bytes lol
// const buf = new Uint8Array(100); // EMBED_HEADER.files[0].size);
// binary.readSync(buf);
// Deno.stdout.writeSync(buf);

// Alt. `console.log(new TextDecoder().decode(buf))`
// Not sure if using TextDecoder copies the string into heap memory? Alongside
// the in-memory Uint8Array buffer. Not a huge deal.

listenAndServe({
  hostname: "0.0.0.0",
  port: 8080,
}, (req) => {
  const res = serveDir();
  req.respond(res);
  serverLog(req, res);
});

console.log(`Starboard on http://0.0.0.0:8080/`);
