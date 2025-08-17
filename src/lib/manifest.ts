import stringify from "json-stable-stringify";
import { keccak_256 } from "js-sha3";

export type DaraManifest = {
  datasetRoot: string;       // Merkle root from 0G Storage
  purpose: string;           // "Wave‑1 sample dataset import"
  uploader: string;          // wallet address
  timestamp: string;         // ISO timestamp
  meta?: Record<string, unknown>;
};

export function buildManifest(datasetRoot: string, purpose: string, uploader: string, meta?: Record<string, unknown>): DaraManifest {
  return { datasetRoot, purpose, uploader, timestamp: new Date().toISOString(), meta };
}

export function manifestHashHex(m: DaraManifest): `0x${string}` {
  const canonical = stringify(m);
  return `0x${keccak_256(canonical)}`;
}


