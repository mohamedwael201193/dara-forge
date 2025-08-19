import { useEffect, useState } from 'react';
import { verifyManifestUrl } from '../lib/verifyManifest';

type Props = {
  expectedRoot: string;     // your displayed Manifest Root (0x...)
  fetchUrl: string;         // /api/og-file?root=...&name=manifest.json
};

export default function VerifiedBadge({ expectedRoot, fetchUrl }: Props) {
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'fail'>('idle');
  const [computed, setComputed] = useState<string>('');
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    let alive = true;
    (async () => {
      setState('checking');
      const r = await verifyManifestUrl(expectedRoot, fetchUrl);
      if (!alive) return;
      if (r.ok) { setComputed(r.computed || ''); setState('ok'); }
      else { setErr(r.error || 'mismatch'); setComputed(r.computed || ''); setState('fail'); }
    })();
    return () => { alive = false; };
  }, [expectedRoot, fetchUrl]);

  if (state === 'checking') return <span style={{ color: '#888' }}>Verifying…</span>;
  if (state === 'ok')      return <span style={{ color: '#16a34a', fontWeight: 600 }}>Verified ✓</span>;
  if (state === 'fail')    return <span title={err || computed} style={{ color: '#dc2626', fontWeight: 600 }}>Not verified ✕</span>;
  return null;
}

