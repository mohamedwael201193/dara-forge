export type AnalyzeOptions = { text?: string; root?: string; model?: string; temperature?: number };

export async function getComputeHealth() {
  const r = await fetch("/api/compute?action=health");
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function initCompute(amount?: number) {
  const r = await fetch(`/api/compute?action=init${amount ? `&amount=${encodeURIComponent(amount)}` : ""}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function startAnalysis(opts: AnalyzeOptions) {
  const r = await fetch("/api/compute?action=analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{ ok: boolean; jobId: string }>;
}

export async function pollResult(jobId: string) {
  const r = await fetch(`/api/compute?action=result&id=${encodeURIComponent(jobId)}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}