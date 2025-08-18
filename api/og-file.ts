// api/og-file.ts
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function must(name: string) { const v = process.env[name]; if (!v) throw new Error(`Missing env ${name}`); return v; }

async function gatewayHasFile(indexerBase: string, root: string) {
  const url = `${indexerBase.replace(/\/$/, '')}/file?root=${encodeURIComponent(root)}`;
  try {
    const resp = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
    return resp.ok || resp.status === 206;
  } catch { return false; }
}

async function waitForGateway(indexerBase: string, root: string, budgetMs = 20000, intervalMs = 500) {
  const t0 = Date.now();
  while (Date.now() - t0 < budgetMs) {
    if (await gatewayHasFile(indexerBase, root)) return true;
    await sleep(intervalMs);
  }
  return false;
}

export default async function handler(req: any, res: any) {
  try {
    const root = (req.query?.root || req.query?.r || '').toString();
    const name = (req.query?.name || req.query?.n || '').toString();
    if (!root) return res.status(400).send('root required');

    const INDEXER = must('OG_INDEXER').replace(/\/$/, '');

    if (req.method === 'HEAD') {
      const ready = await gatewayHasFile(INDEXER, root);
      return res.status(ready ? 200 : 404).end();
    }

    await waitForGateway(INDEXER, root, 20000, 500);

    const upstream = await fetch(`${INDEXER}/file?root=${encodeURIComponent(root)}`);
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return res.status(upstream.status || 502).send(text || 'upstream error');
    }

    const ct = upstream.headers.get('content-type') || (name.endsWith('.json') ? 'application/json' : 'application/octet-stream');
    const ab = await upstream.arrayBuffer();
    res.setHeader('Content-Type', ct);
    if (name) res.setHeader('Content-Disposition', `inline; filename="${name}"`);
    res.setHeader('Content-Length', String(ab.byteLength));
    return res.status(200).send(Buffer.from(ab));
  } catch (e: any) {
    return res.status(500).send(`proxy error: ${e?.message || e}`);
  }
}


