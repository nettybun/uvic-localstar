// I'll throw this because it keeps TS happy as I reduce possible types
export const exit = (code: number, ...msg: unknown[]) => {
  console.log(...msg);
  Deno.exit(code);
};
