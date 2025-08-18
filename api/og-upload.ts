import type { VercelRequest, VercelResponse } from "@vercel/node";
import os from "os";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";

const RPC_URL = process.env.NEXT_PUBLIC_OG_RPC_URL || "https://evmrpc-testnet.0g.ai/";
const INDEXER_RPC = (process.env.NEXT_PUBLIC_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai").replace(/\/$/, "");
const BACKEND_PK = process.env.OG_STORAGE_PRIVATE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        route: "og-upload (vercel fn)",
        hasPK: !!BACKEND_PK?.startsWith("0x"),
        rpc: RPC_URL,
        indexer: INDEXER_RPC
      });
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).send("Method Not Allowed");
    }

    if (!BACKEND_PK?.startsWith("0x")) {
      return res.status(500).send("Server not configured: OG_STORAGE_PRIVATE_KEY is missing or invalid");
    }

    // 1) Parse multipart using Busboy
    const { default: Busboy } = await import("busboy");
    const tmpInfo = await new Promise<{ tmpPath: string; filename: string }>((resolve, reject) => {
      const bb = Busboy({ headers: req.headers as any });
      let tmpPath = "";
      let filename = "upload.bin";
      let wrote = false;

      bb.on("file", (_name, file, info) => {
        filename = info?.filename || filename;
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "og-"));
        tmpPath = path.join(tmpDir, `${Date.now()}-${filename}`);
        const ws = fs.createWriteStream(tmpPath);
        file.pipe(ws);
        ws.on("finish", () => { wrote = true; });
        ws.on("error", reject);
      });

      bb.on("error", reject);
      bb.on("finish", () => {
        if (!wrote || !tmpPath) return reject(new Error("No file provided (expected field name 'file')"));
        resolve({ tmpPath, filename });
      });

      (req as any).pipe(bb);
    });

    // 2) Build Merkle tree and upload via 0G SDK
    const og = await import("@0glabs/0g-ts-sdk");
    const ZgFile = (og as any).ZgFile || (og as any).default?.ZgFile;
    const Indexer = (og as any).Indexer || (og as any).default?.Indexer;
    if (!ZgFile || !Indexer) {
      await fsp.unlink(tmpInfo.tmpPath).catch(() => {});
      return res.status(500).send("0G SDK server exports not found (expected ZgFile, Indexer)");
    }

    const fileObj = await ZgFile.fromFilePath(tmpInfo.tmpPath);
    const [tree, treeErr] = await fileObj.merkleTree();
    if (treeErr !== null) {
      await fileObj.close?.().catch(() => {});
      await fsp.unlink(tmpInfo.tmpPath).catch(() => {});
      return res.status(500).send(`Merkle tree error: ${treeErr}`);
    }
    const rootHash = tree.rootHash();

    const { JsonRpcProvider, Wallet } = await import("ethers");
    const provider = new JsonRpcProvider(RPC_URL);
    const signer = new Wallet(BACKEND_PK as string, provider);
    const indexer = new Indexer(INDEXER_RPC);

    const [tx, uploadErr] = await indexer.upload(fileObj, RPC_URL, signer);
    await fileObj.close?.().catch(() => {});
    await fsp.unlink(tmpInfo.tmpPath).catch(() => {});

    if (uploadErr !== null) {
      return res.status(500).send(`0G upload error: ${uploadErr}`);
    }

    const txHash = typeof tx === "string" ? tx : tx?.hash || tx?.transactionHash || String(tx);
    res.setHeader("content-type", "application/json");
    return res.status(200).send(JSON.stringify({ rootHash, txHash }));
  } catch (e: any) {
    console.error("[og-upload] Uncaught server error:", e);
    return res.status(500).send(`Server error: ${e?.message || String(e)}`);
  }
}


