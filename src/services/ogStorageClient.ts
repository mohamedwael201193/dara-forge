export type UploadResponse = {
  ok: boolean;
  rootHash: string;
  txHash: string;
  explorer: string;
  error?: string;
};

export async function uploadTo0G(file: File): Promise<UploadResponse> {
  const fd = new FormData();
  // server expects the field name exactly "file"
  fd.append("file", file, file.name);

  const res = await fetch("/api/storage/upload", {
    method: "POST",
    body: fd, // IMPORTANT: do not set any headers; browser adds boundary
    // no headers: { "Content-Type": ... }
    // no JSON.stringify
  });

  // Helpful error payloads
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed (${res.status})`);
  }
  return res.json();
}


