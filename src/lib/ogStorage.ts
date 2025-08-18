export async function uploadBlobTo0GStorage(blob: Blob, filename: string) {
  const form = new FormData();
  form.append("file", blob, filename);
  form.append("filename", filename);
  const res = await fetch("/api/og-upload", { method: "POST", body: form });
  if (!res.ok) throw new Error(await res.text().catch(() => `Upload failed (${res.status})`));
  return res.json() as Promise<{ rootHash: string; txHash: string }>;
}

export function gatewayUrlForRoot(rootHash: string, name?: string, indexer = (import.meta.env.VITE_OG_INDEXER as string) || "https://indexer-storage-testnet-turbo.0g.ai") {
  const base = indexer.replace(/\/$/, "");
  const n = name ? `&name=${encodeURIComponent(name)}` : "";
  return `${base}/file?root=${encodeURIComponent(rootHash)}${n}`;
}


