// TODO: The more I look at this I think it should be in the embed binary and
// _not_ in TS... Similar to Deno's trailer, put a u64 (or two) directly above
// the JS bundle (I'll likely need another magic trailer to ensure there is an
// embed section) then JSON parse etc...

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
