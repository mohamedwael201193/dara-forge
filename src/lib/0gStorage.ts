// src/lib/0gStorage.ts
export * from './ogStorage';

// Legacy functions for backward compatibility
export async function uploadFileViaApi(file: File, addr: string) {
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("metadata", JSON.stringify({
    title: file.name,
    description: `Uploaded file: ${file.name}`,
    contributors: [addr],
    isPublic: true,
  }));
  const r = await fetch("/api/upload", {
    method: "POST",
    body: fd,
    headers: { "X-Wallet-Address": addr },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.success) throw new Error(data?.message || `Upload failed (${r.status})`);
  return data as { rootHash: string; txHash: string; filename: string; size: number };
}

// Stub for anchorWithWallet
export async function anchorWithWallet(datasetId: string, rootHashHex: string, metadata: any) {
  // Simplified stub for demo purposes
  return { txHash: '0x' + Math.random().toString(16).slice(2) };
}

