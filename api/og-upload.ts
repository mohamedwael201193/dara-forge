import type { VercelRequest, VercelResponse } from "@vercel/node";
import formidable, { File as FormidableFile } from "formidable";
import os from "os";
import path from "path";
import fs from "fs/promises";

const RPC_URL = process.env.NEXT_PUBLIC_OG_RPC_URL || "https://evmrpc-testnet.0g.ai/";
const INDEXER_RPC = (process.env.NEXT_PUBLIC_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai").replace(/\/$/, "");
const BACKEND_PK = process.env.OG_STORAGE_PRIVATE_KEY;

// Parse multipart form with formidable (streaming; works on Vercel)
function parseForm(req: VercelRequest) {
  const form = formidable({ multiples: false, uploadDir: os.tmpdir(), keepExtensions: true });
  return new Promise<{ fields: formidable.Fields; file: FormidableFile }>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const f = Array.isArray(files.file) ? files.file[0] : (files.file as FormidableFile | undefined);
      if (!f) return reject(new Error("No file provided"));
      resolve({ fields, file: f });
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, route: "og-upload (vercel fn)", hasPK: !!BACKEND_PK?.startsWith("0x") });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).send("Method Not Allowed");
  }

  try {
    if (!BACKEND_PK?.startsWith("0x")) return res.status(500).send("Server not configured: OG_STORAGE_PRIVATE_KEY is missing or invalid");

    const { fields, file } = await parseForm(req);
    const explicitName = (fields.filename as string) || file.originalFilename || "upload.bin";

    // Copy to a fresh temp file we control
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "og-"));
    const tmpPath = path.join(tmpDir, `${Date.now()}-${explicitName}`);
    await fs.copyFile(file.filepath, tmpPath);

    // Import SDKs (ESM) dynamically
    const og = await import("@0glabs/0g-ts-sdk");
    const ZgFile = (og as any).ZgFile;
    const Indexer = (og as any).Indexer;
    if (!ZgFile || !Indexer) {
      await fs.unlink(tmpPath).catch(() => {});
      return res.status(500).send("0G SDK server exports not found (expected ZgFile, Indexer)");
    }

    const fileObj = await ZgFile.fromFilePath(tmpPath);
    const [tree, treeErr] = await fileObj.merkleTree();
    if (treeErr !== null) {
      await fileObj.close?.().catch(() => {});
      await fs.unlink(tmpPath).catch(() => {});
      return res.status(500).send(`Merkle tree error: ${treeErr}`);
    }
    const rootHash = tree.rootHash();

    const { JsonRpcProvider, Wallet } = await import("ethers");
    const provider = new JsonRpcProvider(RPC_URL);
    const signer = new Wallet(BACKEND_PK, provider);
    const indexer = new Indexer(INDEXER_RPC);

    const [tx, uploadErr] = await indexer.upload(fileObj, RPC_URL, signer);
    await fileObj.close?.().catch(() => {});
    await fs.unlink(tmpPath).catch(() => {});

    if (uploadErr !== null) return res.status(500).send(`0G upload error: ${uploadErr}`);

    const txHash = typeof tx === "string" ? tx : tx?.hash || tx?.transactionHash || String(tx);
    res.setHeader("content-type", "application/json");
    return res.status(200).send(JSON.stringify({ rootHash, txHash }));
  } catch (e: any) {
    return res.status(500).send(`Server error: ${e?.message || String(e)}`);
  }
}


