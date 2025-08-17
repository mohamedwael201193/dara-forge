import type { VercelRequest, VercelResponse } from "@vercel/node";
import os from "os";
import path from "path";
import fs from "fs/promises";

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
      console.error("[og-upload] Missing or invalid OG_STORAGE_PRIVATE_KEY");
      return res.status(500).send("Server not configured: OG_STORAGE_PRIVATE_KEY is missing or invalid");
    }

    // Dynamically import formidable only when needed to avoid cold-start crash
    console.log("[og-upload] Dynamically importing formidable…");
    const fmMod = await import("formidable").catch((e) => {
      console.error("[og-upload] formidable import error:", e);
      throw new Error("Cannot import formidable");
    });
    const formidable: any = (fmMod as any).default ?? fmMod;

    console.log("[og-upload] Parsing multipart form…");
    const fileInfo = await new Promise<{ fields: any; file: any }>((resolve, reject) => {
      const form = formidable({ multiples: false, uploadDir: os.tmpdir(), keepExtensions: true });
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) return reject(err);
        const f = Array.isArray(files?.file) ? files.file[0] : files?.file;
        if (!f) return reject(new Error("No file provided (expected field name 'file')"));
        resolve({ fields, file: f });
      });
    });

    const { fields, file } = fileInfo;
    console.log("[og-upload] Parsed file:", {
      name: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype
    });

    const explicitName = (fields.filename as string) || file.originalFilename || "upload.bin";
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "og-"));
    const tmpPath = path.join(tmpDir, `${Date.now()}-${explicitName}`);
    await fs.copyFile(file.filepath, tmpPath);
    console.log("[og-upload] Copied to tmp:", tmpPath);

    console.log("[og-upload] Importing @0glabs/0g-ts-sdk…");
    const og = await import("@0glabs/0g-ts-sdk").catch((e) => {
      console.error("[og-upload] 0g-ts-sdk import error:", e);
      throw new Error("Cannot import @0glabs/0g-ts-sdk");
    });
    const ZgFile = (og as any).ZgFile || (og as any).default?.ZgFile;
    const Indexer = (og as any).Indexer || (og as any).default?.Indexer;
    if (!ZgFile || !Indexer) {
      console.error("[og-upload] SDK symbols not found. Module keys:", Object.keys(og || {}));
      await fs.unlink(tmpPath).catch(() => {});
      return res.status(500).send("0G SDK server exports not found (expected ZgFile, Indexer)");
    }

    console.log("[og-upload] Building Merkle tree…");
    const fileObj = await ZgFile.fromFilePath(tmpPath);
    const [tree, treeErr] = await fileObj.merkleTree();
    if (treeErr !== null) {
      console.error("[og-upload] Merkle tree error:", treeErr);
      await fileObj.close?.().catch(() => {});
      await fs.unlink(tmpPath).catch(() => {});
      return res.status(500).send(`Merkle tree error: ${treeErr}`);
    }
    const rootHash = tree.rootHash();
    console.log("[og-upload] rootHash:", rootHash);

    console.log("[og-upload] Importing ethers…");
    const { JsonRpcProvider, Wallet } = await import("ethers").catch((e) => {
      console.error("[og-upload] ethers import error:", e);
      throw new Error("Cannot import ethers");
    });

    console.log("[og-upload] Creating signer and Indexer…");
    const provider = new JsonRpcProvider(RPC_URL);
    const signer = new Wallet(BACKEND_PK as string, provider);
    const indexer = new Indexer(INDEXER_RPC);

    console.log("[og-upload] Uploading to 0G Indexer…");
    const [tx, uploadErr] = await indexer.upload(fileObj, RPC_URL, signer);
    await fileObj.close?.().catch(() => {});
    await fs.unlink(tmpPath).catch(() => {});

    if (uploadErr !== null) {
      console.error("[og-upload] 0G upload error:", uploadErr);
      return res.status(500).send(`0G upload error: ${uploadErr}`);
    }

    const txHash = typeof tx === "string" ? tx : tx?.hash || tx?.transactionHash || String(tx);
    console.log("[og-upload] Success:", { rootHash, txHash });

    res.setHeader("content-type", "application/json");
    return res.status(200).send(JSON.stringify({ rootHash, txHash }));
  } catch (e: any) {
    console.error("[og-upload] Uncaught server error:", e);
    return res.status(500).send(`Server error: ${e?.message || String(e)}`);
  }
}


