import stringify from "json-stable-stringify";
import { keccak_256 } from "js-sha3";

export type DaraManifest = {
  version: string;
  timestamp: number;
  creator: string;
  dataset: {
    root: string;
    description: string;
  };
  meta: Record<string, any>;
};

export function buildManifest(
  datasetRoot: string,
  description: string,
  creator: string,
  meta: Record<string, any> = {}
): DaraManifest {
  return {
    version: "1.0",
    timestamp: Math.floor(Date.now() / 1000),
    creator,
    dataset: {
      root: datasetRoot,
      description
    },
    meta
  };
}

export function manifestHashHex(m: DaraManifest): `0x${string}` {
  const canonical = stringify(m);
  return `0x${keccak_256(canonical)}`;
}


