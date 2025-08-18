// api/og-file.ts
// Waits for the 0G Indexer to expose a file by root, then streams it.
// Also supports HEAD so you can probe readiness cheaply.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function gatewayHasFile(indexerBase: string, root: string) {
  const base = indexerBase.replace(/\/$/, "");
  const url = `${base}/file?root=${encodeURIComponent(root)}`;
  try {
    const resp = await fetch(url, { method: "HEAD" });
    return resp.ok;
  } catch {
    return false;
  }
}

async function waitForGateway(indexerBase: string, root: string, budgetMs = 20000, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < budgetMs) {
    if (await gatewayHasFile(indexerBase, root)) return true;
    await sleep(intervalMs);
  }
  return false;
}

export default async function handler(req: any, res: any) {
  try {
    const root = (req.query?.root || req.query?.r || "").toString();
    const name = (req.query?.name || req.query?.n || "").toString();
    if (!root) return res.status(400).send("root required");

    const INDEXER = "https://indexer-storage-testnet-turbo.0g.ai".replace(/\/$/, "");

    // Fast readiness probe for your UI
    if (req.method === "HEAD") {
      const ready = await gatewayHasFile(INDEXER, root);
      return res.status(ready ? 200 : 404).end();
    }

    // GET → wait for availability, then stream
    await waitForGateway(INDEXER, root, 120000, 2000);

    const upstreamUrl = `${INDEXER}/file?root=${encodeURIComponent(root)}`;
    const upstream = await fetch(upstreamUrl);
    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error(`[og-file] Upstream error: ${upstream.status} - ${text}`);
      return res.status(upstream.status || 502).json({ code: upstream.status || 502, message: text || "upstream error", data: null });
    }

    const ctHdr = upstream.headers.get("content-type");
    const ct = ctHdr || (name && name.endsWith(".json") ? "application/json" : "application/octet-stream");

    const ab = await upstream.arrayBuffer();
    const buf = Buffer.from(ab);

    res.setHeader("Content-Type", ct);
    if (name) res.setHeader("Content-Disposition", `inline; filename="${name}"`);
    res.setHeader("Content-Length", String(buf.length));
    return res.status(200).send(buf);
  } catch (e: any) {
    return res.status(500).send(`proxy error: ${e?.message || e}`);
  }
}



