import type { VercelRequest, VercelResponse } from "@vercel/node";

// Use require for better CommonJS compatibility
const os = require("os");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");

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

    // Use formidable with require for better compatibility
    const formidable = require("formidable").default;
    const { tmpPath, filename } = await new Promise<{ tmpPath: string; filename: string }>((resolve, reject) => {
      const form = formidable({
        multiples: false,
        uploadDir: os.tmpdir(),
        keepExtensions: true
      });

      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
          const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file || !file.filepath) return reject(new Error("No file provided or file path missing"));
        
        const filename = (fields.filename as string) || file.originalFilename || "upload.bin";
        resolve({ tmpPath: file.filepath, filename });;
      });
    });

    // Dynamic import for 0G SDK
    const og = await import("@0glabs/0g-ts-sdk");
    const ZgFile = (og as any).ZgFile || (og as any).default?.ZgFile;
    const Indexer = (og as any).Indexer || (og as any).default?.Indexer;
    
    if (!ZgFile || !Indexer) {
      await fsp.unlink(tmpPath).catch(() => {});
      return res.status(500).send("0G SDK exports not found");
    }

    const fileObj = await ZgFile.fromFilePath(tmpPath);
    const [tree, treeErr] = await fileObj.merkleTree();
    
    if (treeErr !== null) {
      await fileObj.close?.().catch(() => {});
      await fsp.unlink(tmpPath).catch(() => {});
      return res.status(500).send(`Merkle tree error: ${treeErr}`);
    }
    
    const rootHash = tree.rootHash();

    // Dynamic import for ethers
    const ethers = await import("ethers");
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(BACKEND_PK as string, provider);
    const indexer = new Indexer(INDEXER_RPC);

    let txResult: any;
    try {
      const [tx, uploadErr] = await indexer.upload(fileObj, RPC_URL, signer, { gasLimit: 5000000 });
      if (uploadErr !== null) {
        throw uploadErr;
      }
      txResult = tx;
    } catch (uploadError: any) {
      console.error("[og-upload] Upload error:", uploadError);
      throw new Error(`Failed to submit transaction: ${uploadError?.message || String(uploadError)}`);
    }

    await fileObj.close?.().catch(() => {});
    await fsp.unlink(tmpPath).catch(() => {});

    const txHash = typeof txResult === "string" ? txResult : txResult?.hash || txResult?.transactionHash || String(txResult);
    
    res.setHeader("content-type", "application/json");
    return res.status(200).send(JSON.stringify({ rootHash, txHash }));
    
  } catch (e: any) {
    console.error("[og-upload] Error:", e);
    return res.status(500).send(`Server error: ${e?.message || String(e)}`);
  }
}

