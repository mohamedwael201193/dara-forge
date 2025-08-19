export async function verifyManifestUrl(expectedRoot: string, _fetchUrl: string) {
  try {
    const resp = await fetch(`/api/og-verify?root=${encodeURIComponent(expectedRoot)}`, { cache: 'no-store' });
    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) return { ok: false, error: json?.error || `HTTP ${resp.status}` };
    return { ok: !!json.ok, computed: json.computed as string | undefined };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}


