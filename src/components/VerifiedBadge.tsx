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
      if (r.ok) {
        setState('ok');
        return;
      }

      const e = (r.error || '').toLowerCase();

      // Treat timeouts/404 as still propagating — do not mark red.
      const stillPropagating = e.includes('not ready') || e.includes('404') || e.includes('timeout');
      if (stillPropagating) {
        setState('propagating');
        // keep polling without a hard cap (or choose a larger cap, e.g., 5–10 minutes if you prefer)
        setTimeout(tick, 3000);
        return;
      }

      // Only show red when the server says “mismatch” (we return 422 for that)
      const mismatch = e.includes('422') || e.includes('mismatch');
      setState('fail');
      setErr(mismatch ? 'mismatch' : (r.error || 'verification failed'));    };

    tick();
    return () => { alive = false; };
  }, [expectedRoot, fetchUrl]);

  if (state === 'checking')    return <span style={{ color: '#888' }}>Verifying…</span>;
  if (state === 'propagating') return <span style={{ color: '#d97706', fontWeight: 600 }}>Propagating…</span>;
  if (state === 'ok')          return <span style={{ color: '#16a34a', fontWeight: 600 }}>Verified ✓</span>;
  return <span title={err} style={{ color: '#dc2626', fontWeight: 600 }}>Not verified ✕</span>;
}


