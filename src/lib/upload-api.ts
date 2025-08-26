export async function uploadViaApi(file: File, addr: string) {
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

// optional: multi-file
export async function uploadMany(files: File[], addr: string) {
  const results = [];
  for (const f of files) results.push(await uploadViaApi(f, addr));
  return results;
}


