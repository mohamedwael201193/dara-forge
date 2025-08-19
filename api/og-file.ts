const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

function isJsonContent(resp: Response) {
  const ct = resp.headers.get("content-type") || "";
  return ct.includes("application/json");
}

async function isIndexerNotFound(resp: Response) {
  if (!isJsonContent(resp)) return false;
  try {
    const text = await resp.clone().text();
    if (/"code"\s*:\s*101/.test(text)) return true;
    if (/file not found/i.test(text)) return true;
    const j = JSON.parse(text);
    return j?.code === 101 || /not found/i.test(String(j?.message || ""));
  } catch { return false; }
}

async function gatewayHasFile(indexerBase: string, root: string) {
  const url = `${indexerBase.replace(/\/$/, "")}/file?root=${encodeURIComponent(root)}`;
  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Accept: "*/*" },
    });
    if (!resp.ok) return false;
    if (await isIndexerNotFound(resp)) return false;
    return true;
  } catch { return false; }
}

async function waitForGateway(indexerBase: string, root: string, budgetMs = 20000, intervalMs = 800) {
  const t0 = Date.now();
  while (Date.now() - t0 < budgetMs) {
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

    const INDEXER = must("OG_INDEXER").replace(/\/$/, "");

    if (req.method === "HEAD") {
      const ready = await gatewayHasFile(INDEXER, root);
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Retry-After", "5");
      return res.status(ready ? 200 : 404).end();
    }

    const ready = await waitForGateway(INDEXER, root, 20000, 800);
    if (!ready) {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Retry-After", "5");
      return res.status(404).send("not ready");
    }

    const upstreamUrl = `${INDEXER}/file?root=${encodeURIComponent(root)}`;
    const upstream = await fetch(upstreamUrl, {
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Accept: "*/*" },
    });

    if (upstream.ok && (await isIndexerNotFound(upstream))) {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Retry-After", "5");
      return res.status(404).send("not ready");
    }

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return res.status(upstream.status || 502).send(text || "upstream error");
    }

    const ctHdr = upstream.headers.get("content-type");
    const ct = ctHdr || (name && name.endsWith(".json") ? "application/json" : "application/octet-stream");
    const ab = await upstream.arrayBuffer();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", ct);
    if (name) res.setHeader("Content-Disposition", `inline; filename="${name}"`);
    res.setHeader("Content-Length", String(ab.byteLength));
    return res.status(200).send(Buffer.from(ab));
  } catch (e: any) {
    return res.status(500).send(`proxy error: ${e?.message || e}`);
  }
}


