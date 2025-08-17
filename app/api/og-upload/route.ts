import { NextRequest } from "next/server";
import { ethers } from "ethers";
import fs from "fs/promises";
import os from "os";
import path from "path";

export const runtime = "nodejs";       // ensure Node runtime (not Edge)
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const RPC_URL = process.env.NEXT_PUBLIC_OG_RPC_URL || "https://evmrpc-testnet.0g.ai/";
const INDEXER_RPC = (process.env.NEXT_PUBLIC_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai").replace(/\/$/, "");
const BACKEND_PK = process.env.OG_STORAGE_PRIVATE_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_PK?.startsWith("0x")) {
      return new Response("Server not configured: OG_STORAGE_PRIVATE_KEY is missing or invalid", { status: 500 });
    }

    const form = await req.formData();
    const file = form.get("file") as unknown as File | null;
    const explicitName = (form.get("filename") as string) || undefined;
    if (!file) return new Response("No file provided", { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "og-"));
    const filename = explicitName || (file as any).name || "upload.bin";
    const tmpPath = path.join(tmpDir, `${Date.now()}-${filename}`);
    await fs.writeFile(tmpPath, buffer);

    const mod = await import("@0glabs/0g-ts-sdk");
    const ZgFile = (mod as any).ZgFile;
    const Indexer = (mod as any).Indexer;
    if (!ZgFile || !Indexer) {
      await fs.unlink(tmpPath).catch(() => {});
      return new Response("0G SDK server exports not found (expected ZgFile, Indexer)", { status: 500 });
    }

    const fileObj = await ZgFile.fromFilePath(tmpPath);
    const [tree, treeErr] = await fileObj.merkleTree();
    if (treeErr !== null) {
      await fileObj.close?.().catch(() => {});
      await fs.unlink(tmpPath).catch(() => {});
      return new Response(`Merkle tree error: ${treeErr}`, { status: 500 });
    }
    const rootHash = tree.rootHash();

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = new ethers.Wallet(BACKEND_PK, provider);
    const indexer = new Indexer(INDEXER_RPC);

    const [tx, uploadErr] = await indexer.upload(fileObj, RPC_URL, signer);
    await fileObj.close?.().catch(() => {});
    await fs.unlink(tmpPath).catch(() => {});
    if (uploadErr !== null) return new Response(`0G upload error: ${uploadErr}`, { status: 500 });

    const txHash = typeof tx === "string" ? tx : tx?.hash || tx?.transactionHash || String(tx);
    return new Response(JSON.stringify({ rootHash, txHash }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(`Server error: ${e?.message || String(e)}`, { status: 500 });
  }
}


