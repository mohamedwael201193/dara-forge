// api/og-file.ts
// Waits for the 0G Indexer to expose a file by root, then streams it.

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
    // Clone so the caller can still read the body later if needed
    const text = await resp.clone().text();
    // Fast checks without full JSON parse first
    if (/"code"\s*:\s*101/.test(text)) return true;
    if (/file not found/i.test(text)) return true;
    // Fallback parse
    const j = JSON.parse(text);
    return j?.code === 101 || /not found/i.test(String(j?.message || ""));
  } catch {
    return false;
  }
}

async function gatewayHasFile(indexerBase: string, root: string) {
  const base = indexerBase.replace(/\/$/, "");
  const url = `${base}/file?root=${encodeURIComponent(root)}`;
  try {
    // Use GET and no-cache; Range may be ignored by some gateways
    const resp = await fetch(url, {
      method: "GET",
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Accept: "*/*" },
    });
    if (!resp.ok) return false;
    // If gateway returns JSON error shape (code 101), it's NOT ready yet
    if (await isIndexerNotFound(resp)) return false;
    return true; // Some non-JSON (bytes) came back → ready
  } catch {
    return false;
  }
}

async function waitForGateway(indexerBase: string, root: string, budgetMs = 45000, intervalMs = 800) {
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

    const INDEXER = must("OG_INDEXER").replace(/\/$/, "");

    // Fast readiness probe for your UI
    if (req.method === "HEAD") {
      const ready = await gatewayHasFile(INDEXER, root);
      res.setHeader("Cache-Control", "no-store");
      return res.status(ready ? 200 : 404).end();
    }

    // GET → wait for availability, then stream
    const ready = await waitForGateway(INDEXER, root, 45000, 800);
    if (!ready) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(404).send("not ready");
    }

    const upstreamUrl = `${INDEXER}/file?root=${encodeURIComponent(root)}`;
    const upstream = await fetch(upstreamUrl, {
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache", Accept: "*/*" },
    });

    // If upstream still answers with the JSON 101 body, surface 404 instead of streaming it
    if (upstream.ok && (await isIndexerNotFound(upstream))) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(404).send("not ready");
    }

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return res.status(upstream.status || 502).send(text || "upstream error");
    }

    const ctHdr = upstream.headers.get("content-type");
    const ct =
      ctHdr || (name && name.endsWith(".json") ? "application/json" : "application/octet-stream");

    const ab = await upstream.arrayBuffer();
    const buf = Buffer.from(ab);

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", ct);
    if (name) res.setHeader("Content-Disposition", `inline; filename="${name}"`);
    res.setHeader("Content-Length", String(buf.length));
    return res.status(200).send(buf);
  } catch (e: any) {
    return res.status(500).send(`proxy error: ${e?.message || e}`);
  }
}

