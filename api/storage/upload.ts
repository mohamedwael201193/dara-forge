import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Indexer, Blob as ZgBlob } from "@0glabs/0g-ts-sdk/browser";
import { ethers } from "ethers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { name, base64 } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!name || !base64) return res.status(400).json({ error: "Missing name/base64" });

    const bin = Uint8Array.from(Buffer.from(base64, "base64"));
    const file = new ZgBlob(bin, name);

    const [tree, mErr] = await file.merkleTree();
    if (mErr) throw mErr;
    const root = tree.rootHash();

    const evmRpc = process.env.OG_EVM_RPC!;
    const indRpc = process.env.OG_INDEXER_RPC!;
    const provider = new ethers.JsonRpcProvider(evmRpc);
    const signer = new ethers.Wallet(process.env.OG_PRIVATE_KEY!, provider);
    const indexer = new Indexer(indRpc);

    const [tx, uErr] = await indexer.upload(file, evmRpc, signer);
    if (uErr) throw uErr;

    res.status(200).json({ ok: true, root, tx, indexer: indRpc });
  } catch (e: any) {
    console.error("Upload error:", e);
    res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}

