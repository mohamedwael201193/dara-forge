
'use client';
import React from 'react';
import FancyProgress from './FancyProgress';
import { uploadBlobTo0GStorage, gatewayUrlForRoot } from '@/lib/ogStorage';
type UploadResult = Awaited<ReturnType<typeof uploadBlobTo0GStorage>>;
export default function OGUploadCard() {
const [file, setFile] = React.useState<File | null>(null);
const [progress, setProgress] = React.useState(0);
const [busy, setBusy] = React.useState(false);
const [result, setResult] = React.useState<UploadResult | null>(null);
const [error, setError] = React.useState<string | null>(null);
const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
const f = e.target.files?.[0];
if (f) setFile(f);
};
const start = async () => {
if (!file) return;
setError(null); setResult(null); setProgress(0); setBusy(false);
try {
  // 0–70% real upload
  const res = await uploadBlobTo0GStorage(file, file.name, (p) => {
    setProgress(Math.min(70, Math.round(p * 0.7)));
  });

  // finish to 100% while server finishes on-chain log
  setBusy(true);
  setProgress(100);
  setResult(res);
} catch (e: any) {
  setError(e.message || 'Upload failed');
} finally {
  setBusy(false);
}

};
return (
<div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-zinc-100">
<div className="font-medium mb-2">Data Upload to 0G Storage</div>
<div className="text-sm opacity-80 mb-4">Supports .csv, .json, .parquet, .h5</div>
  <div className="mt-4 rounded-xl border border-dashed border-zinc-700 p-6 text-center">
    <input id="filePick" type="file" onChange={onPick} className="hidden" />
    <label htmlFor="filePick" className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700">
      {file ? 'Choose another file' : 'Drop file here or click to browse'}
    </label>

    <button
      onClick={start}
      disabled={!file}
      className="ml-3 inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Upload to 0G
    </button>

    {(progress > 0 && progress < 100) && <FancyProgress value={progress} busy={busy} />}

    {error && (
      <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
    )}

    {result?.ok && (
      <div className="mt-4 space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
        <div className="text-emerald-300">Stored on 0G Storage</div>
        <div>
          Root:
          <code className="ml-1 break-all text-zinc-300">{result.rootHash}</code>
          {' • '}
          <a
            className="text-emerald-300 underline"
            href={result.downloadUrl || gatewayUrlForRoot(result.rootHash, result.filename || 'dataset.bin')}
            target="_blank" rel="noreferrer"
          >
            Open
          </a>
        </div>
        {result.chainTx && (
          <div>Chain Tx: <code className="break-all text-zinc-300">{result.chainTx}</code></div>
        )}
        {result.alreadyStored && (
          <div className="text-xs text-zinc-400">Deduplicated: this exact content already exists on the network.</div>
        )}
      </div>
    )}
  </div>
</div>

);
}


