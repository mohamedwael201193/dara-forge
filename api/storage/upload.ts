import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Indexer, Blob as ZgBlob } from "@0glabs/0g-ts-sdk/browser";
import { ethers } from "ethers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { name, base64 } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    if (!name || !base64) return res.status(400).json({ error: "Missing name/base64" });

    // Fix TS2554: Expected 1 arguments, but got 2. for Buffer.from
    // Using atob and Uint8Array.from to convert base64 string to Uint8Array
    const binaryString = atob(base64);
    const bin = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    const file = new ZgBlob(bin, name);

    const [tree, mErr] = await file.merkleTree();
    if (mErr) throw mErr;
    // Fix TS18047: 'tree' is possibly 'null'.
    if (!tree) throw new Error("Merkle tree is null after generation.");
    const root = tree.rootHash();

    const evmRpc = process.env.OG_EVM_RPC!;
    const indRpc = process.env.OG_INDEXER_RPC!;
    const provider = new ethers.JsonRpcProvider(evmRpc);
    const wallet = new ethers.Wallet(process.env.OG_PRIVATE_KEY!, provider);
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

