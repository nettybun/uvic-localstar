// Adapted from https://github.com/visionmedia/bytes.js/blob/master/index.js

import {
  assertStrictEquals as aSE,
  assertThrows as aT,
} from "https://deno.land/std/testing/asserts.ts";

const map = {
  B: 1,
  K: 1 << 10,
  M: 1 << 20,
  G: 1 << 30,
  T: Math.pow(1024, 4),
  P: Math.pow(1024, 5),
};

type Unit = keyof typeof map;

function bytesToNumber(sizeHuman: string): number {
  const match = sizeHuman.match(/^(\d+(?:\.\d+)?)\s*([KMGTP]?B?)?$/i);
  if (!match) throw new Error(`Didn't recognize ${sizeHuman} as a byte size`);
  const [, number, unit] = match;
  const multiplier = map[(unit || "B").toUpperCase()[0] as Unit];
  if (!multiplier) throw new Error(`Didn't recognize unit "${unit}"`);
  return Math.floor(parseFloat(number) * multiplier);
}

function bytesToHuman(sizeBytes: number, options: {
  unit?: string;
  decimals?: number;
} = {}) {
  let { unit, decimals } = options;
  let u: Unit;
  if (unit) {
    // If you pass in " GB" (note the leading space) it'll keep
    const match = unit.match(/([KMGTP]?B?)$/i);
    if (!match || !match[1]) throw new Error(`Didn't recognize unit ${unit}`);
    u = match[1].toUpperCase()[0] as Unit;
  } else {
    const mag = Math.abs(sizeBytes);
    if (mag >= map.P) u = "P";
    else if (mag >= map.T) u = "T";
    else if (mag >= map.G) u = "G";
    else if (mag >= map.M) u = "M";
    else if (mag >= map.K) u = "K";
    else u = "B";
    // Infer unit
    unit = `${u.toLowerCase()}${u === "B" ? "" : "b"}`;
  }
  let value = (sizeBytes / map[u]).toFixed(decimals ?? 2);
  if (!decimals || u === "B") {
    value = value.replace(/\.0+$/, "");
  }
  return `${value}${unit}`;
}

export { bytesToHuman, bytesToNumber };

Deno.test("bytesToNumber", () => {
  aSE(bytesToNumber("1.00k"), 1024);
  aSE(bytesToNumber("1.24kb"), 1269);
  aSE(bytesToNumber("1M"), 1048576);
  aSE(bytesToNumber("1.0 mb"), 1048576);
  aSE(bytesToNumber("4Gb"), 4294967296);
  aSE(bytesToNumber("0"), 0);
  aSE(bytesToNumber("0b"), 0);
  aSE(bytesToNumber("10 b"), 10);
  aT(() => bytesToNumber("11.11.11"));
});
Deno.test("bytesToHuman", () => {
  aSE(bytesToHuman(1024), "1kb");
  aSE(bytesToHuman(1024, { decimals: 2 }), "1.00kb");
  aSE(bytesToHuman(1269, { unit: "b" }), "1269b");
  aSE(bytesToHuman(1269, { decimals: 1 }), "1.2kb");
  aSE(bytesToHuman(1048576, { decimals: 1 }), "1.0mb");
  aSE(bytesToHuman(1048576, { decimals: 1, unit: "M" }), "1.0M");
  aSE(bytesToHuman(4294967296), "4gb");
  aSE(bytesToHuman(0), "0b");
  aSE(bytesToHuman(0, { decimals: 0, unit: " B" }), "0 B");
  aSE(bytesToHuman(10, { unit: " KB" }), "0.01 KB");
  aT(() => bytesToHuman(11.11, { unit: ".11" }));
  aT(() => bytesToHuman(11.11, { unit: "BYTES" }));
});
