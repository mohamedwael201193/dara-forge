import { downloadWithProofUrl as dlProofPublic, gatewayUrlForRoot as gatewayPublic } from "@/services/ogStorage";
import { getAccount } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wallet';

type UploadResult = {
  ok: boolean;
  root?: string;
  indexerTx?: string | null;
  error?: string;
  proofUrl?: string;
  gatewayUrl?: string;
  raw?: any;
};

export function useOgUpload() {
  async function uploadFiles(files: File[]): Promise<UploadResult> {
    try {
      // Get connected wallet address for authentication
      const account = getAccount(wagmiConfig);
      if (!account.address) {
        return { 
          ok: false, 
          error: "Please connect your wallet before uploading files" 
        };
      }

      const form = new FormData();
      for (const f of files) form.append("file", f);
      
      const r = await fetch("/api/storage/upload", { 
        method: "POST", 
        body: form,
        headers: {
          "X-Wallet-Address": account.address
        }
      });
      
      if (!r.ok) return { ok: false, error: await r.text() };
      const out = await r.json();
      const root = out?.root;
      return {
        ok: true,
        root,
        indexerTx: out?.indexerTx || null,
        proofUrl: root ? dlProofPublic(root) : undefined,
        gatewayUrl: root ? gatewayPublic(root) : undefined,
        raw: out
      };
    } catch (e: any) {
      return { ok: false, error: e?.message || "Upload failed" };
    }
  }

  return { uploadFiles };
}