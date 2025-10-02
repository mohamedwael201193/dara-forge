import { Indexer, ZgFile } from "@0glabs/0g-ts-sdk";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ethers } from "ethers";
import formidable from "formidable";

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function parseForm(req: VercelRequest): Promise<{ files: formidable.File[] }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });
    form.parse(req as any, (err, _fields, files) => {
      if (err) return reject(err);
      const list: formidable.File[] = [];
      const ff = files.file;
      if (Array.isArray(ff)) list.push(...ff);
      else if (ff) list.push(ff as formidable.File);
      resolve({ files: list });
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    }

    const { files } = await parseForm(req);
    if (!files.length) return res.status(400).json({ ok: false, error: "No files uploaded (field name 'file')." });

    const indexerBase = must("OG_INDEXER_RPC").replace(/\/$/, "");
    const rpc = must("OG_RPC_URL");
    const priv = must("OG_STORAGE_PRIVATE_KEY");

    const indexer = new Indexer(indexerBase);
    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(priv, provider);

    if (files.length === 1) {
      // Single file upload using ZgFile.fromFilePath
      const zgFile = await ZgFile.fromFilePath(files[0].filepath);
      
      try {
        const [result, error] = await indexer.upload(zgFile, rpc, signer as any);
        
        if (error) {
          throw error;
        }
        
        return res.status(200).json({
          ok: true,
          mode: "single",
          root: result?.rootHash,
          indexerTx: result?.txHash,
          raw: result
        });
      } finally {
        // Clean up
        await zgFile.close();
      }
    }

    // Directory upload (multiple files)
    const dir = new Map<string, ZgFile>();
    const zgFiles: ZgFile[] = [];
    
    try {
      for (const f of files) {
        const zgFile = await ZgFile.fromFilePath(f.filepath);
        const name = (f as any).originalFilename || "file.bin";
        dir.set(name, zgFile);
        zgFiles.push(zgFile);
      }
      
      const [result, error] = await (indexer as any).uploadDirectory(dir as any, { evmRpc: rpc, signer: signer as any });
      
      if (error) {
        throw error;
      }
      
      return res.status(200).json({
        ok: true,
        mode: "directory",
        root: result?.rootHash,
        indexerTx: result?.txHash,
        raw: result
      });
    } finally {
      // Clean up all ZgFiles
      for (const zgFile of zgFiles) {
        await zgFile.close().catch(() => {});
      }
    }
  } catch (e: any) {
    console.error("upload error:", e?.stack || e?.message || e);
    return res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
}