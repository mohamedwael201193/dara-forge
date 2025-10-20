// Gateway URL functions (no SDK dependency)
function getIndexerBase(): string {
  return (
    import.meta.env.VITE_OG_INDEXER ||
    "https://indexer-storage-testnet-turbo.0g.ai/"
  ).replace(/\/$/, "");
}

export function gatewayUrlForRoot(root: string) {
  const base = getIndexerBase();
  return `${base}/file?root=${encodeURIComponent(root)}`;
}

export function downloadWithProofUrl(root: string) {
  const base = getIndexerBase();
  return `${base}/file?root=${encodeURIComponent(root)}&proof=true`;
}

// Browser-safe upload functions that use server API
type UploadProgress = (percent: number) => void;

import { apiUrl } from "../lib/api.js";

/**
 * Upload a single File from the browser via server API.
 */
export async function uploadFileClient(
  file: File,
  _opts?: { onProgress?: UploadProgress }
) {
  const fd = new FormData();
  fd.append("file", file, file.name);

  const r = await fetch(apiUrl("api/storage/upload"), {
    method: "POST",
    body: fd,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.ok)
    throw new Error(data?.error || `Upload failed (${r.status})`);

  return {
    root: data.root,
    indexerTx: data.indexerTx || null,
    raw: data,
  };
}

/**
 * Upload multiple files as a single dataset via server API.
 */
export async function uploadDirectoryClient(
  files: File[],
  _opts?: { onProgress?: UploadProgress }
) {
  const fd = new FormData();
  for (const f of files) fd.append("file", f);

  const r = await fetch(apiUrl("api/storage/upload"), {
    method: "POST",
    body: fd,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.ok)
    throw new Error(data?.error || `Upload failed (${r.status})`);

  return {
    root: data.root,
    indexerTx: data.indexerTx || null,
    raw: data,
  };
}

/**
 * Verify uploaded data integrity via indexer endpoint.
 */
export async function verifyRoot(root: string) {
  try {
    const base = getIndexerBase();
    const url = `${base}/verify?root=${encodeURIComponent(root)}`;
    const response = await fetch(url);
    return {
      ok: response.ok,
      raw: response.ok ? await response.json().catch(() => ({})) : null,
    };
  } catch {
    return {
      ok: false,
      message: "Verification endpoint not available",
      link: `${getIndexerBase()}/verify?root=${encodeURIComponent(root)}`,
    };
  }
}

// Legacy compatibility functions for existing components
type Hex = `0x${string}`;
type PublishResult = {
  rootHash: Hex;
  txHash: Hex;
  chainTx: string;
};

export async function uploadBlobTo0GStorageViaBrowser(
  blob: Blob,
  name = "upload.bin"
): Promise<PublishResult> {
  const file = new File([blob], name);
  return uploadFileTo0GStorageViaBrowser(file);
}

export async function uploadFileTo0GStorageViaBrowser(
  file: File
): Promise<PublishResult> {
  // Always use server upload to avoid Node.js module issues in browser
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("name", file.name);

  const r = await fetch(apiUrl("api/storage/upload"), {
    method: "POST",
    body: fd,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.ok)
    throw new Error(data?.error || `Upload failed (${r.status})`);

  const tx = (
    data.indexerTx && typeof data.indexerTx === "string" ? data.indexerTx : ""
  ) as Hex;
  const chainTx = `${
    import.meta.env.VITE_OG_EXPLORER || "https://chainscan-galileo.0g.ai"
  }/tx/${tx || ""}`;
  return { rootHash: data.root as Hex, txHash: (tx || "0x") as Hex, chainTx };
}

export async function uploadBlobTo0GStorage(
  blob: Blob,
  name = "upload.bin"
): Promise<PublishResult> {
  return uploadBlobTo0GStorageViaBrowser(blob, name);
}
