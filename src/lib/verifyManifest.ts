import { Blob as OgBlob } from '@0glabs/0g-ts-sdk/browser';

export async function merkleRootFromBytes(bytes: Uint8Array): Promise<{ root: string; error?: string }> {
  try {
    const file = new OgBlob([bytes]);                 // SDK Blob with merkleTree()
    const [tree, err] = await (file as any).merkleTree();
    if (err !== null) return { root: '', error: String(err) };
    const root = tree.rootHash();                     // "0x..." hex
    return { root: String(root) };
  } catch (e: any) {
    return { root: '', error: e?.message || String(e) };
  }
}

export async function verifyManifestUrl(expectedRoot: string, url: string): Promise<{ ok: boolean; computed?: string; error?: string }> {
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) return { ok: false, error: `HTTP ${resp.status}` };
    const ab = await resp.arrayBuffer();
    const { root, error } = await merkleRootFromBytes(new Uint8Array(ab));
    if (error) return { ok: false, error };
    return { ok: root.toLowerCase() === expectedRoot.toLowerCase(), computed: root };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

