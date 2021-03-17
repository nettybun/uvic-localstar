export type EmbedHeader = {
  version: {
    deno: string;
    starboard: string;
  };
  files: {
    [path: string]: {
      offset: number;
      size: number;
    };
  };
};
