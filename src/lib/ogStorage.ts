export async function uploadBlobTo0GStorage(blob: Blob, filename: string) {
  const form = new FormData();
  form.append("file", blob, filename || "upload.bin"); // field name MUST be "file"
  const res = await fetch("/api/og-upload", {
    method: "POST",
    body: form, // do NOT set Content-Type; the browser sets the boundary
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Upload failed (${res.status})`);
  }
  return res.json() as Promise<{ rootHash: string; txHash: string }>;
}


