export async function uploadToZeroG(file: File) {
  const fd = new FormData();
  fd.append("file", file, file.name);
  fd.append("name", file.name); // Add this line to send the file name separately

  const r = await fetch("/api/storage/upload", { method: "POST", body: fd });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.ok) throw new Error(data?.error || `Upload failed (${r.status})`);
  return data as { ok: true; root: string; tx: string | null; indexer: string; status: "exists" | "uploaded"; explorer: string };
}

export async function checkRoot(root: string) {
  const r = await fetch(`/api/storage-utils?action=status&root=${encodeURIComponent(root)}`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data?.ok) throw new Error(data?.error || `Status failed (${r.status})`);
  return data as { ok: true; root: string; status: "pending" | "available"; indexer?: string };
}


