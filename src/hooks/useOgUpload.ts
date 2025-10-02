import { downloadWithProofUrl as dlProofPublic, gatewayUrlForRoot as gatewayPublic } from "@/services/ogStorage";

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
      const form = new FormData();
      for (const f of files) form.append("file", f);
      const r = await fetch("/api/storage/upload", { method: "POST", body: form });
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