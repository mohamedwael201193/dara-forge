// api/og-upload.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Node built-ins via CJS for robustness in Vercel functions
const os = require("os");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const formidable = require("formidable");

const RPC_URL =
  process.env.NEXT_PUBLIC_OG_RPC_URL || "https://evmrpc-testnet.0g.ai/";
const INDEXER_RPC = (
  process.env.NEXT_PUBLIC_OG_INDEXER ||
  "https://indexer-storage-testnet-turbo.0g.ai"
).replace(/\/$/, "");
const BACKEND_PK = process.env.OG_STORAGE_PRIVATE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        route: "og-upload (vercel fn)",
        hasPK: !!BACKEND_PK?.startsWith("0x"),
        rpc: RPC_URL,
        indexer: INDEXER_RPC,
      });
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).send("Method Not Allowed");
    }

    if (!BACKEND_PK?.startsWith("0x")) {
      return res
        .status(500)
        .send(
          "Server not configured: OG_STORAGE_PRIVATE_KEY is missing or invalid"
        );
    }

    // 1) Parse multipart form (form field must be named "file")
    const { tmpPath } = await new Promise<{ tmpPath: string }>(
      (resolve, reject) => {
        const form = formidable({
          multiples: false,
          uploadDir: os.tmpdir(),
          keepExtensions: true,
        });

        form.parse(req, (err: any, fields: any, files: any) => {
          if (err) return reject(err);
          const file = Array.isArray(files?.file) ? files.file[0] : files?.file;
          if (!file?.filepath) {
            return reject(
              new Error(
                "No file provided (expected field name \'file\') or filepath missing"
              )
            );
          }
          resolve({ tmpPath: file.filepath });
        });
      }
    );

    // 2) Load 0G SDK
    const og = await import("@0glabs/0g-ts-sdk");
    const ZgFile = (og as any).ZgFile || (og as any).default?.ZgFile;
    const IndexerCtor =
      (og as any).Indexer ||
      (og as any).IndexerClient ||
      (og as any).default?.Indexer;
    if (!ZgFile || !IndexerCtor) {
      await safeUnlink(tmpPath);
      return res
        .status(500)
        .send("0G SDK exports not found (expected ZgFile, Indexer)");
    }

    // 3) Build Merkle tree
    const fileObj = await ZgFile.fromFilePath(tmpPath);
    const [tree, treeErr] = await fileObj.merkleTree();
    if (treeErr !== null) {
      await fileObj.close?.().catch(() => {});
      await safeUnlink(tmpPath);
      return res.status(500).send(`Merkle tree error: ${treeErr}`);
    }
    const rootHash = tree.rootHash();

    // 4) Ethers v5 provider/signer (the SDK expects v5 shapes)
    const E = await import("ethers");
    const ethersAny: any = (E as any).ethers ?? E;
    if (!ethersAny?.providers?.JsonRpcProvider) {
      await fileObj.close?.().catch(() => {});
      await safeUnlink(tmpPath);
      return res
        .status(500)
        .send("Server misconfigured: ethers v6 detected. Pin ethers@5.7.2");
    }
    const provider = new ethersAny.providers.JsonRpcProvider(RPC_URL);
    const signer = new ethersAny.Wallet(BACKEND_PK as string, provider);

    // Optional: log addr/balance to verify funds (never log the PK)
    try {
      const addr = await signer.getAddress();
      const bal = await provider.getBalance(addr);
      console.log(
        `[og-upload] Using backend addr=${addr}, balance=${ethersAny.utils.formatEther(
          bal
        )} OG`
      );
    } catch {}

    // 5) Indexer client and upload
    const indexerClient = new IndexerCtor(INDEXER_RPC);

    let txResult: any;
    try {
      const [tx, uploadErr] = await indexerClient.upload(
        fileObj,
        RPC_URL,
        signer
      );
      if (uploadErr !== null) {
        throw uploadErr;
      }
      txResult = tx;
    } catch (uploadError: any) {
      console.error("[og-upload] Upload error:", uploadError);
      throw new Error(
        `Failed to submit transaction: ${uploadError?.message || String(uploadError)}`
      );
    } finally {
      await fileObj.close?.().catch(() => {});
      await safeUnlink(tmpPath);
    }

    const txHash =
      typeof txResult === "string"
        ? txResult
        : txResult?.hash || txResult?.transactionHash || String(txResult);

    res.setHeader("content-type", "application/json");
    return res.status(200).send(JSON.stringify({ rootHash, txHash }));
  } catch (e: any) {
    console.error("[og-upload] Error:", e);
    return res
      .status(500)
      .send(`Server error: ${e?.message || String(e)}`);
  }
}

// Utility to avoid throwing on unlink
async function safeUnlink(p: string) {
  try {
    await fsp.unlink(p);
  } catch {}
}


