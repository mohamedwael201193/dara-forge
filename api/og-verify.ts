import { ZgFile } from '@0glabs/0g-ts-sdk';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFile, unlink } from 'node:fs/promises';

const DEFAULT_INDEXER = 'https://indexer-storage-testnet-turbo.0g.ai';

function must(name: string, fallback?: string) {
  const v = process.env[name] || fallback;
  if (!v) throw new Error(`Missing env ${name}`);
  return v!;
}

function isLikelyJson101(txt: string) {
  return /"code"\s*:\s*101/.test(txt) || /file not found/i.test(txt);
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default async function handler(req: any, res: any) {
  try {
    const expected = String(req.query?.root || '').trim();
    if (!expected) return res.status(400).json({ ok: false, error: 'root required' });

    const INDEXER = (process.env.OG_INDEXER || DEFAULT_INDEXER).replace(/\/$/, '');
    const waitMs = clamp(Number(req.query?.wait_ms || 0) || 0, 0, 10000);
    const start = Date.now();

    while (true) {
      const r = await fetch(`${INDEXER}/file?root=${encodeURIComponent(expected)}`, {
        headers: { 'Cache-Control': 'no-cache', Accept: '*/*' },
      });
      if (!r.ok) return res.status(r.status).json({ ok: false, error: `indexer HTTP ${r.status}` });

      const textProbe = r.headers.get('content-type')?.includes('application/json') ? await r.clone().text() : '';
      const notReady = !!textProbe && (/"code"\s*:\s*101/.test(textProbe) || /file not found/i.test(textProbe));
      if (notReady) {
        if (Date.now() - start < waitMs) { await new Promise(r => setTimeout(r, 800)); continue; }
        res.setHeader('Retry-After', '3');
        return res.status(404).json({ ok: false, error: 'not ready' });
      }

      const buf = Buffer.from(await r.arrayBuffer());
      const tmpPath = join(tmpdir(), `og-verify-${Date.now()}-${Math.random().toString(36).slice(2)}.bin`);
      await writeFile(tmpPath, buf);

      const file = await (ZgFile as any).fromFilePath(tmpPath);
      const [tree, err] = await file.merkleTree();
      await (file.close?.() || Promise.resolve());
      await unlink(tmpPath).catch(() => {});
      if (err !== null) return res.status(500).json({ ok: false, error: String(err) });

      const computed = String(tree.rootHash());
      const ok = computed.toLowerCase() === expected.toLowerCase();
      return res.status(ok ? 200 : 422).json({ ok, computed });
    }
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}


