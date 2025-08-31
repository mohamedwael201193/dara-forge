export type UploadResponse = {
  ok: boolean;
  rootHash?: string;
  txHash?: string;
  explorer?: string;
  error?: string;
};

export async function uploadTo0G(file: File): Promise<UploadResponse> {
  const fd = new FormData();
  fd.append("file", file, file.name);
  const res = await fetch("/api/storage/upload", { method: "POST", body: fd });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(text || `Upload failed (${res.status})`);
  }
}


