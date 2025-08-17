import type { VercelRequest, VercelResponse } from "@vercel/node";
import os from "os";
import path from "path";
import fs from "fs/promises";

// Environment variables
const RPC_URL = process.env.NEXT_PUBLIC_OG_RPC_URL || "https://evmrpc-testnet.0g.ai/";
const INDEXER_RPC = (process.env.NEXT_PUBLIC_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai").replace(/\/$/, "");
const BACKEND_PK = process.env.OG_STORAGE_PRIVATE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Handle GET requests for health check and configuration info
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        route: "og-upload (vercel fn)",
        hasPK: !!BACKEND_PK?.startsWith("0x"),
        rpc: RPC_URL,
        indexer: INDEXER_RPC
      });
    }

    // Only allow POST requests for file uploads
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).send("Method Not Allowed");
    }

    // Validate private key presence
    if (!BACKEND_PK?.startsWith("0x")) {
      console.error("[og-upload] Missing or invalid OG_STORAGE_PRIVATE_KEY");
      return res.status(500).send("Server not configured: OG_STORAGE_PRIVATE_KEY is missing or invalid");
    }

    // Dynamically import formidable to avoid cold-start issues
    console.log("[og-upload] Dynamically importing formidable...");
    let formidable: any;
    try {
      const fmMod = await import("formidable");
      formidable = (fmMod as any).default ?? fmMod;
    } catch (e) {
      console.error("[og-upload] formidable import error:", e);
      return res.status(500).send(`Server error: Failed to import formidable: ${e instanceof Error ? e.message : String(e)}`);
    }

    console.log("[og-upload] Parsing multipart form...");
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

    // Dynamically import 0g-ts-sdk
    console.log("[og-upload] Importing @0glabs/0g-ts-sdk...");
    let ZgFile: any, Indexer: any;
    try {
      const og = await import("@0glabs/0g-ts-sdk");
      ZgFile = (og as any).ZgFile || (og as any).default?.ZgFile;
      Indexer = (og as any).Indexer || (og as any).default?.Indexer;
      if (!ZgFile || !Indexer) {
        console.error("[og-upload] SDK symbols not found. Module keys:", Object.keys(og || {}));
        throw new Error("0G SDK server exports not found (expected ZgFile, Indexer)");
      }
    } catch (e) {
      console.error("[og-upload] 0g-ts-sdk import error:", e);
      await fs.unlink(tmpPath).catch(() => {});
      return res.status(500).send(`Server error: Failed to import @0glabs/0g-ts-sdk: ${e instanceof Error ? e.message : String(e)}`);
    }

    console.log("[og-upload] Building Merkle tree...");
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

    // Dynamically import ethers
    console.log("[og-upload] Importing ethers...");
    let JsonRpcProvider: any, Wallet: any;
    try {
      const ethersMod = await import("ethers");
      JsonRpcProvider = (ethersMod as any).JsonRpcProvider || (ethersMod as any).default?.JsonRpcProvider;
      Wallet = (ethersMod as any).Wallet || (ethersMod as any).default?.Wallet;
      if (!JsonRpcProvider || !Wallet) {
        console.error("[og-upload] Ethers symbols not found. Module keys:", Object.keys(ethersMod || {}));
        throw new Error("Ethers exports not found (expected JsonRpcProvider, Wallet)");
      }
    } catch (e) {
      console.error("[og-upload] ethers import error:", e);
      return res.status(500).send(`Server error: Failed to import ethers: ${e instanceof Error ? e.message : String(e)}`);
    }

    console.log("[og-upload] Creating signer and Indexer...");
    const provider = new JsonRpcProvider(RPC_URL);
    const signer = new Wallet(BACKEND_PK as string, provider);
    const indexer = new Indexer(INDEXER_RPC);

    console.log("[og-upload] Uploading to 0G Indexer...");
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
    // Return a more detailed error message to the client
    return res.status(500).send(`Server error: ${e?.message || String(e)}`);
  }
}


