import { useEffect, useRef, useState } from 'react';
import { verifyManifestUrl } from '../lib/verifyManifest';

type Props = { expectedRoot: string; fetchUrl: string };

export default function VerifiedBadge({ expectedRoot, fetchUrl }: Props) {
  const [state, setState] = useState<'checking' | 'propagating' | 'ok' | 'fail'>('checking');
  const [err, setErr] = useState<string>('');
  const attempts = useRef(0);

  useEffect(() => {
    let alive = true;
    attempts.current = 0;
    setState('checking');
    setErr('');

    const tick = async () => {
      if (!alive) return;
      attempts.current += 1;
      const r = await verifyManifestUrl(expectedRoot, fetchUrl);

      if (!alive) return;
      if (r.ok) { setState('ok'); return; }

      const e = (r.error || '').toLowerCase();
      const stillPropagating = e.includes('not ready') || e.includes('404');
      if (stillPropagating && attempts.current < 30) {   // ~30 × 3s = 90s
        setState('propagating');
        setTimeout(tick, 3000);
      } else if (stillPropagating) {
        setState('fail'); setErr('timeout waiting for indexer');
      } else {
        setState('fail'); setErr(r.error || 'mismatch');
      }
    };

    tick();
    return () => { alive = false; };
  }, [expectedRoot, fetchUrl]);

  if (state === 'checking')    return <span style={{ color: '#888' }}>Verifying…</span>;
  if (state === 'propagating') return <span style={{ color: '#d97706', fontWeight: 600 }}>Propagating…</span>;
  if (state === 'ok')          return <span style={{ color: '#16a34a', fontWeight: 600 }}>Verified ✓</span>;
  return <span title={err} style={{ color: '#dc2626', fontWeight: 600 }}>Not verified ✕</span>;
}


