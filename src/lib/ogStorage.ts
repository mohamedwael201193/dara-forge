import { ethers } from "ethers";

const INDEXER_RPC = (process.env.NEXT_PUBLIC_OG_INDEXER || "https://indexer-storage-testnet-turbo.0g.ai").replace(/\/$/, "");

export async function uploadBlobTo0GStorage(
  blob: Blob,
  filename: string
): Promise<{ rootHash: string; txHash: string }> {
  const form = new FormData();
  form.append("file", blob, filename);
  form.append("filename", filename);

  const res = await fetch("/api/og-upload", { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed with ${res.status}`);
  }
  return res.json();
}

export function gatewayUrlForRoot(rootHash: string, name?: string) {
  const n = name ? `&name=${encodeURIComponent(name)}` : "";
  return `${INDEXER_RPC}/file?root=${encodeURIComponent(rootHash)}${n}`;
}


