#!/usr/bin/env -S deno run --allow-net --allow-read --allow-run

// Adapted from https://deno.land/std/http/file_server.ts

import * as path from "https://deno.land/std/path/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
import { assert } from "https://deno.land/std/testing/asserts.ts";
import { open } from "https://deno.land/x/opener/mod.ts";

import { asHex, readBinaryLayout } from "./lib/binary_layout.ts";

import type {
  Response,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

import type { EmbedHeader } from "./lib/embed_header.ts";

interface ServerArgs {
  _: string[];
  host?: string;
  port?: number;
  cors?: boolean;
}

// TODO(*): Possibly use oak_server/media_types repo. It's huge at 178kb of MIME
// data, but honestly, Deno just loaded 18MB of ICU dates, languages, etc. It's
// good to have because it covers all bases...
const knownMediaTypes: Record<string, string> = {
  ".md": "text/plain",
  ".html": "text/html",
  ".json": "application/json",
  ".map": "application/json",
  ".txt": "text/plain",
  ".js": "application/javascript",
  ".gz": "application/gzip",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".mjs": "application/javascript",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Uint8Array of UTF-8 string
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// This file is never closed. The OS closes it on process exit
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

type FileItem = string; // Full path to look up in denoEmbedMetadata
type DirItem = { [k: string]: FileItem | DirItem };
const denoEmbedTree: DirItem = {};

if (denoLayout.compilePayload === false) {
  console.log("Running outside of a Deno executable");
}
if (denoLayout.embedPayload === false) {
  console.log("Running without an embedded filesystem");
} else {
  console.log("Found an embedded filesystem");
  const { metadataOffset, metadataLen } = denoLayout.embedPayload;
  const metadataBuf = await loadFromBinary(metadataOffset, metadataLen);
  const metadata = JSON.parse(decoder.decode(metadataBuf));
  console.log("Metadata:", metadata);
  Object.assign(denoEmbedMetadata, metadata);

  // Build the directory tree
  for (const filePath of Object.keys(denoEmbedMetadata.files)) {
    const dirs = path.dirname(filePath).split("/");
    const file = path.basename(filePath);
    // Walk
    let w = denoEmbedTree;
    for (const dir of dirs) {
      if (dir === "") {
        continue;
      }
      if (!w[dir]) {
        w[dir] = {};
      }
      // This better not already be a file like "cat/" and "cat" together...
      assert(typeof w[dir] !== "string");
      w = w[dir] as DirItem;
    }
    // Place file
    w[file] = filePath;
  }
  console.log("DirTree:", denoEmbedTree);
}

const serverArgs = parse(Deno.args) as ServerArgs;
// Path on the OS to serve files from
const localFilesystemRoot = path.resolve(serverArgs._[0] ?? "");
// Path on the OS to serve embeds from when `denoLayout.embedPayload === false`
const embedFilesystemRoot = localFilesystemRoot;

// Returns the content-type based on the extension of a path
function contentType(filepath: string): string {
  return knownMediaTypes[path.extname(filepath)] || "application/octet-stream";
}

async function loadFromBinary(
  offset: number,
  size: number,
): Promise<Uint8Array> {
  const fileBuf = new Uint8Array(size);
  await denoBinary.seek(offset, Deno.SeekMode.Start);
  let n = 0;
  while (n < size) {
    const nread = await denoBinary.read(fileBuf.subarray(n));
    if (nread === null) break;
    n += nread;
  }
  return fileBuf;
}

async function serveLocal(
  request: ServerRequest,
  fsPath: string,
  fsRoot: string,
): Promise<Response> {
  fsPath = path.join(fsRoot, normalizeURL(fsPath));
  // Security check in case path joining changes beyond the fsRoot
  if (fsPath.indexOf(fsRoot) !== 0) {
    fsPath = fsRoot;
  }
  const fileInfo = await Deno.stat(fsPath);
  if (fileInfo.isDirectory) {
    const entries: Array<{ name: string; size: number | "" }> = [];
    for await (const entry of Deno.readDir(fsPath)) {
      const filePath = path.join(fsPath, entry.name);
      const fileInfo = await Deno.stat(filePath);
      entries.push({
        name: `${entry.name}${entry.isDirectory ? "/" : ""}`,
        size: entry.isFile ? (fileInfo.size ?? 0) : "",
      });
    }
    return serveJSON(entries);
  }
  const file = await Deno.open(fsPath);
  const headers = new Headers();
  headers.set("content-length", fileInfo.size.toString());
  const contentTypeValue = contentType(fsPath);
  headers.set("content-type", contentTypeValue);
  request.done.then(() => {
    file.close();
  });
  return {
    status: 200,
    body: file,
    headers,
  };
}

async function serveEmbed(fsPath: string): Promise<Response> {
  const embedInfo = denoEmbedMetadata.files[fsPath];
  // Stat:
  if (!embedInfo) {
    const dirs = fsPath.split("/");
    // This is allowed to be either a directory (DirItem) or a file (FileItem)
    // but since it wasn't in the denoEmbedMetadata it'll be a directory...
    let w = denoEmbedTree;
    for (const dir of dirs) {
      if (dir == "") {
        continue;
      }
      w = w[dir] as DirItem;
      if (typeof w === "string" || typeof w === "undefined") {
        // String if asking for a file in a file like a/b/c/index.html/d/
        throw new Deno.errors.NotFound();
      }
    }
    // If it was a string, but not in denoEmbedMetadata, that'd be bad/weird
    assert(typeof w !== "string");
    if (!w) {
      throw new Deno.errors.NotFound();
    }
    // Directory listing
    const entries: Array<{ name: string; size: number | "" }> = [];
    for (const [k, v] of Object.entries(w)) {
      entries.push({
        name: `${k}${typeof v !== "string" ? "/" : ""}`,
        size: typeof v === "string" ? (denoEmbedMetadata.files[v].size) : "",
      });
    }
    return serveJSON(entries);
  }
  let file = denoEmbedCache.get(fsPath);
  if (!file) {
    // Assumes all files (collectively) can be held in memory
    console.log(`Reading ${fsPath} at ${asHex(embedInfo.offset)}`);
    file = await loadFromBinary(embedInfo.offset, embedInfo.size);
    denoEmbedCache.set(fsPath, file);
  }
  const headers = new Headers();
  headers.set("content-length", embedInfo.size.toString());
  const contentTypeValue = contentType(fsPath);
  headers.set("content-type", contentTypeValue);
  return {
    status: 200,
    body: file,
    headers,
  };
}

function serveJSON(toStringify: unknown): Response {
  const body = encoder.encode(JSON.stringify(toStringify, null, 2));
  const headers = new Headers();
  // Commented out so Firefox doesn't pretty print it
  headers.set("content-type", "text/plain"); // "application/json");
  return {
    status: 200,
    body,
    headers,
  };
}

function serveFallback(e: Error): Response {
  let status: number;
  let message: string;
  if (e instanceof URIError) {
    status = 400;
    message = "Bad Request";
  } else if (e instanceof Deno.errors.NotFound) {
    status = 404;
    message = "Not Found";
  } else {
    status = 500;
    message = "Internal server error";
  }
  const headers = new Headers();
  headers.set("content-type", "text/plain");
  const stack = e.stack?.replaceAll(/\ns+/g, "  ");
  return {
    status,
    body: encoder.encode(`${message}\n\nError: ${stack}`),
    headers,
  };
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
  normalized = path.normalize(normalized);
  const startOfParams = normalized.indexOf("?");
  return startOfParams > -1 ? normalized.slice(0, startOfParams) : normalized;
}

const host = serverArgs.host ?? "0.0.0.0";
const port = serverArgs.port ?? 4507;
const cors = serverArgs.cors;

const server = serve({
  hostname: host,
  port,
});
console.log(`Starboard on http://${host}:${port}/`);
await open(`http://${host}:${port}/`)

for await (const request of server) {
  let response: Response;
  try {
    let { url: urlPath } = request;
    if (/^\/version\/?$/.test(urlPath)) {
      response = serveJSON(denoEmbedMetadata.version);
      continue;
    }
    if (/^\/fs\/.*/.test(urlPath)) {
      response = await serveLocal(
        request,
        urlPath.slice("/fs".length),
        localFilesystemRoot,
      );
      continue;
    }

    if (urlPath === "/") {
      urlPath = "/index.html";
    }

    if (denoLayout.embedPayload === false) {
      console.log("No embed filesystem; passing through to local folder");
      response = await serveLocal(
        request,
        urlPath,
        embedFilesystemRoot,
      );
    } else {
      response = await serveEmbed(urlPath);
    }
  } catch (e) {
    console.error(e.message);
    response = serveFallback(e);
  } finally {
    try {
      if (cors) setCORS(response!);
      serverLog(request, response!);
      await request.respond(response!);
    } catch (e) {
      console.error(e.message);
    }
  }
}

console.log("Bye");
