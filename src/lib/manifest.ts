type Hex = `0x${string}`;

export type DaraManifest = {
  // Keep this flexible; components only need “some object” they can hash.
  title?: string;
  description?: string;
  tags?: string[];
  sourceUrl?: string;
  [k: string]: any;
};

// Minimal builder used by demo components
export function buildManifest(partial: Partial<DaraManifest>): DaraManifest {
  return { ...partial };
}

// Tiny deterministic hex “hash” for demo purposes (not cryptographic)
export function manifestHashHex(m: DaraManifest): Hex {
  const json = JSON.stringify(m, Object.keys(m).sort());
  let h = 0x811c9dc5; // fnv1a-32 seed
  for (let i = 0; i < json.length; i++) {
    h ^= json.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // expand to 32 bytes by repeating the 32-bit state
  let hex = "";
  for (let i = 0; i < 32; i += 4) {
    const part = (h >>> 0).toString(16).padStart(8, "0");
    hex += part;
    // scramble a bit
    h = Math.imul(h ^ 0x9e3779b1, 16777619);
  }
  hex = hex.slice(0, 64);
  return (`0x${hex}`) as Hex;
}


