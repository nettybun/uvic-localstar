export type EmbedHeader = {
  // TODO(*): Version ourselves
  versions: {
    deno: typeof Deno.version["deno"];
    starboard: string;
  };
  // TODO(*): Could support virtual directories by showing a restricted view
  // of all files that have the same dirname prefix. Would involve walking each
  // path and creating directories.
  files: Array<
    { path: string; size: number }
  >;
}; // Not `| undefined;` since we should throw if its ever not defined.

// Comment below is super special don't delete it. Ctrl+F it in build.ts...
// TODO(*): Better way to do this? Restore previous/clean file it in build.ts?

// XXX: Everything below is replaced by build.ts
export const EMBED_OFFSET = 0;
export const EMBED_HEADER = {} as EmbedHeader;
