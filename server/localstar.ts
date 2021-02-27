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

interface ServerArgs {
  _: string[];
  host?: string;
  port?: number;
  cors?: boolean;
}

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

// Posix-only path library for loading embed files within Deno itself
const posix = path.posix;

// Files that are in memory (never unloaded)
const loadedFilesCache = new Map<string, string>();

// Uint8Array of UTF-8 string
const encoder = new TextEncoder();

const serverArgs = parse(Deno.args) as ServerArgs;
const target = posix.resolve(serverArgs._[0] ?? "");

// Returns the content-type based on the extension of a path
function contentType(filepath: string): string | undefined {
  return MEDIA_TYPES[path.extname(filepath)];
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
    headers,
    body: file,
  };
}

function serveDir(): Response {
  const body = encoder.encode(JSON.stringify(EMBED_HEADER.files, null, 2));
  const headers = new Headers();
  headers.set("content-type", "application/json");
  return {
    status: 200,
    headers,
    body,
  };
}

function serveFallback(e: Error): Promise<Response> {
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

function setCORS(res: Response): void {
  if (!res.headers) {
    res.headers = new Headers();
  }
  res.headers.append("access-control-allow-origin", "*");
  res.headers.append(
    "access-control-allow-headers",
    "Origin, X-Requested-With, Content-Type, Accept, Range",
  );
}

// https://github.com/denoland/deno_std/commit/a7558b92ff774e81a8ae1cc485f7b28073e7dc94
// Important to prevent malicious path traversal. Specifically for reading from
// the OS rather than Deno embeds
function normalizeURL(url: string): string {
  let normalized = url;
  try {
    normalized = decodeURI(normalized);
  } catch (e) {
    if (!(e instanceof URIError)) {
      throw e;
    }
  }
  try {
    // Allowed per https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html
    const absoluteURI = new URL(normalized);
    normalized = absoluteURI.pathname;
  } catch (e) { // Wasn't an absoluteURI
    if (!(e instanceof TypeError)) {
      throw e;
    }
  }
  if (normalized[0] !== "/") {
    throw new URIError("The request URI is malformed.");
  }
  // TODO:Safe to drop everything after "?" in the URL?
  return normalized;
}

// const binary = Deno.openSync(Deno.execPath(), { read: true });
// binary.seekSync(EMBED_OFFSET, Deno.SeekMode.Start);
// // Print only the first 100 bytes instead of the 66000 bytes lol
// const buf = new Uint8Array(100); // EMBED_HEADER.files[0].size);
// binary.readSync(buf);
// Deno.stdout.writeSync(buf);

const host = serverArgs.host ?? "0.0.0.0";
const port = serverArgs.port ?? 4507;
const cors = serverArgs.cors;

const server = serve({
  hostname: host,
  port,
});
console.log(`Starboard on http://${host}:${port}/`);

for await (const request of server) {
  let response: Response;
  try {
    const url = normalizeURL(request.url);
    // API? (Including OS FS calls)
    // XXX: Middleware stack

    // If not an API request then assume a (posix) path for an embed
    const normalizedPathURL = posix.normalize(url);
    const startOfParams = normalizedPathURL.indexOf("?");
    let normalizedPath = startOfParams > -1
      ? normalizedPathURL.slice(0, startOfParams)
      : normalizedPathURL;

    // There are no directories (TODO: There are though, for the OS FS)
    if (normalizedPath.endsWith("/")) {
      normalizedPath = "index.html";
    }
    let fsPath = posix.join(target, normalizedPath);
    // Security against changing the root? Doesn't apply to embed though...
    if (fsPath.indexOf(target) !== 0) {
      fsPath = target;
    }
    response = await serveFile(fsPath);
  } catch (e) {
    console.error(e.message);
    response = await serveFallback(e);
  } finally {
    if (cors) {
      setCORS(response!);
    }
    serverLog(request, response!);
    try {
      await request.respond(response!);
    } catch (e) {
      console.error(e.message);
    }
  }
}
