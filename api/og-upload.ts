import type { VercelRequest, VercelResponse } from "@vercel/node";
import os from "os";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import Busboy from "busboy";

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

    const ct = String(req.headers["content-type"] || "");
    const isMultipart = ct.toLowerCase().includes("multipart/form-data");

    // Create a temp file path helper
    const makeTmpPath = (name: string) => {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "og-"));
      return path.join(tmpDir, `${Date.now()}-${name}`);
    };

    // 1) Accept multipart uploads (recommended)
    let tmpPath: string | null = null;
    if (isMultipart) {
      tmpPath = await new Promise<string>((resolve, reject) => {
        const bb = Busboy({ headers: req.headers as any });
        let wrote = false;

        bb.on("file", (_name: string, file: any, info: any) => {
          const filename = info?.filename || "upload.bin";
          const p = makeTmpPath(filename);
          const ws = fs.createWriteStream(p);
          file.pipe(ws);
          ws.on("finish", () => { wrote = true; resolve(p); });
          ws.on("error", reject);
        });

        bb.on("error", reject);
        bb.on("finish", () => {
          if (!wrote) reject(new Error(\'No file provided (expected field name "file")\'));
        });

        (req as any).pipe(bb);
      }).catch((err) => {
        throw err;
      });
    } else {
      // 2) Fallback: accept raw binary body (e.g., if client posted the file directly)
      const filename = (req.headers["x-filename"] as string) || "upload.bin";
      const p = makeTmpPath(filename);
      await new Promise<void>((resolve, reject) => {
        const ws = fs.createWriteStream(p);
        (req as any).pipe(ws);
        ws.on("finish", () => resolve());
        ws.on("error", reject);
      });
      tmpPath = p;
    }

    // 3) 0G SDK
    const og = await import("@0glabs/0g-ts-sdk");
    const ZgFile = (og as any).ZgFile || (og as any).default?.ZgFile;
    const IndexerCtor = (og as any).Indexer || (og as any).IndexerClient || (og as any).default?.Indexer;
    if (!ZgFile || !IndexerCtor) {
      await safeUnlink(tmpPath);
      return res.status(500).send("0G SDK exports not found (expected ZgFile, Indexer)");
    }

    // 4) Merkle tree
    const fileObj = await ZgFile.fromFilePath(tmpPath);
    const [tree, treeErr] = await fileObj.merkleTree();
    if (treeErr !== null) {
      await fileObj.close?.().catch(() => {});
      await safeUnlink(tmpPath);
      return res.status(500).send(`Merkle tree error: ${treeErr}`);
    }
    const rootHash = tree.rootHash();

    // 5) ethers v5 (alias) for server-side signing
    const ethers5mod: any = await import("ethers5");
    const ethers5 = (ethers5mod?.default ?? ethers5mod) as any;
    const provider = new ethers5.providers.JsonRpcProvider(RPC_URL);
    const signer = new ethers5.Wallet(BACKEND_PK as string, provider);

    try {
      const addr = await signer.getAddress();
      const bal = await provider.getBalance(addr);
      console.log(`[og-upload] Using backend addr=${addr}, balance=${ethers5.utils.formatEther(bal)} OG`);
    } catch {}

    // 6) Upload via Indexer
    const indexerClient = new IndexerCtor(INDEXER_RPC);
    const [tx, uploadErr] = await indexerClient.upload(fileObj, RPC_URL, signer);

    await fileObj.close?.().catch(() => {});
    await safeUnlink(tmpPath);

    if (uploadErr !== null) {
      console.error("[og-upload] 0G upload error:", uploadErr);
      return res.status(500).send(`0G upload error: ${uploadErr}`);
    }

    const txHash = typeof tx === "string" ? tx : tx?.hash || tx?.transactionHash || String(tx);
    res.setHeader("content-type", "application/json");
    return res.status(200).send(JSON.stringify({ rootHash, txHash }));
  } catch (e: any) {
    console.error("[og-upload] Error:", e);
    return res.status(500).send(`Server error: ${e?.message || String(e)}`);
  }
}

async function safeUnlink(p: string | null) {
  if (!p) return;
  try { await fsp.unlink(p); } catch {}
}


