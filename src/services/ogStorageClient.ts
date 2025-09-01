export async function uploadToZeroG(file: File) {
  const fd = new FormData();
  fd.append('file', file, file.name);

  const res = await fetch('/api/storage/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || `Upload failed (${res.status})`);
  }
  return data as { ok: true; root: string; tx: string; indexer: string; explorer: string };
}

