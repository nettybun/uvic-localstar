#!/usr/bin/env -S deno run --allow-net --allow-read

// Adapted from https://deno.land/std/http/file_server.ts which reads files from
// within the binary rather than the local filesystem. There are no directories,
// only files which may include "/".
import * as path from "https://deno.land/std/path/mod.ts";
import * as fs from "https://deno.land/std/fs/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";

import type {
  Response,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

import { EMBED_HEADER, EMBED_OFFSET } from "./embed.ts";

interface ServerArgs {
  _: string[];
  host?: string;
  port?: number;
  cors?: boolean;
}

// TODO(*): Why aren't images here? Do browsers figure it out for us?
//Dylan: for images and fonts the browser is pretty good at figuring it out. some stuff needs to be explicit tho.
const MEDIA_TYPES: Record<string, string> = {
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

// Posix-only path library for loading embed files within Deno itself
const posix = path.posix;

const embedLookup = new Map<string, { offset: number; size: number }>();
const embedContent = new Map<string, Uint8Array>();
{
  let offset = EMBED_OFFSET - 1;
  for (const entry of EMBED_HEADER.files) {
    embedLookup.set(entry.path, { offset, size: entry.size });
    offset += entry.size;
  }
}

// This file is never closed. The OS closes it on process exit
const denoBinary = await Deno.open(Deno.execPath(), { read: true });

// Uint8Array of UTF-8 string
const encoder = new TextEncoder();

const serverArgs = parse(Deno.args) as ServerArgs;
const target = posix.resolve(serverArgs._[0] ?? "");

// Returns the content-type based on the extension of a path
// Browsers will default to "application/octet-stream" if its binary
function contentType(filepath: string): string {
  return MEDIA_TYPES[path.extname(filepath)] || "text/plain";
}

async function serveLocalFile(
  req: ServerRequest,
  filePath: string,
): Promise<Response> {
  const [file, fileInfo] = await Promise.all([
    Deno.open(filePath),
    Deno.stat(filePath),
  ]);
  const headers = new Headers();
  headers.set("content-length", fileInfo.size.toString());
  const contentTypeValue = contentType(filePath);
  headers.set("content-type", contentTypeValue);
  req.done.then(() => {
    file.close();
  });
  return {
    status: 200,
    body: file,
    headers,
  };
}

async function serveLocalDir(dirPath: string): Promise<Response> {
  const entries: Array<{ name: string; size: number | "" }> = [];
  for await (const entry of Deno.readDir(dirPath)) {
    const filePath = posix.join(dirPath, entry.name);
    const fileInfo = await Deno.stat(filePath);
    entries.push({
      name: `${entry.name}${entry.isDirectory ? "/" : ""}`,
      size: entry.isFile ? (fileInfo.size ?? 0) : "",
    });
  }
  return serveJSON(entries);
}

async function serveEmbedFile(filePath: string): Promise<Response> {
  const meta = embedLookup.get(filePath);
  if (!meta) {
    throw new Deno.errors.NotFound();
  }
  let file = embedContent.get(filePath);
  if (!file) {
    file = new Uint8Array(meta.size);
    await denoBinary.seek(meta.offset, Deno.SeekMode.Start);
    // XXX: Whattt why is it this hard to read files in Deno/Go...
    let n = 0;
    while (n < meta.size) {
      const nread = await denoBinary.read(file.subarray(n));
      if (nread === null) break;
      n += nread;
    }
    embedContent.set(filePath, file);
  }
  // Assumes all files (collectively) can be held in memory
  const headers = new Headers();
  headers.set("content-length", meta.size.toString());
  const contentTypeValue = contentType(filePath);
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
  headers.set("content-type", "application/json");
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
  normalized = posix.normalize(normalized);
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

for await (const request of server) {
  let response: Response;
  try {
    let { url } = request;
    if (/^\/version\/?$/.test(url)) {
      response = serveJSON(EMBED_HEADER.versions);
      continue;
    }
    if (/^\/list\/?$/.test(url)) {
      response = serveJSON(EMBED_HEADER.files);
      continue;
    }
    if (/^\/fs\/.*/.test(url)) {
      const urlPath = normalizeURL(url.slice("/fs".length));
      let fsPath = posix.join(target, urlPath);
      // Security check in case path joining changes beyond the "target" root
      if (fsPath.indexOf(target) !== 0) {
        fsPath = target;
      }
      const fileInfo = await Deno.stat(fsPath);
      response = await (fileInfo.isDirectory
        ? serveLocalDir(fsPath)
        : serveLocalFile(request, fsPath));
      continue;
    }
    // Else try an embed. The "/" -> "index.html" only works for embeds
    if (url === "/") {
      url = "/index.html";
    }
    // TODO(Grant): What even is a directory for an embed...
    if (url[0] === "/") {
      url = url.slice(1);
    }
    response = await serveEmbedFile(url);
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
