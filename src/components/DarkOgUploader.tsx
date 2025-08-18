// components/DarkOgUploader.tsx
"use client";
import React, { useMemo, useState } from "react";
import { ethers } from "ethers";
import { uploadBlobTo0GStorage, gatewayUrlForRoot } from "@/lib/ogStorage";
import { getSigner, getDaraContract, DARA_ABI, EXPLORER } from "@/lib/ethersClient";
import { buildManifest, manifestHashHex, DaraManifest } from "@/lib/manifest";

export default function DarkOgUploader() {
  const [wallet, setWallet] = useState<string>("");
  const [datasetRoot, setDatasetRoot] = useState<string>("");
  const [datasetTx, setDatasetTx] = useState<string>("");
  const [manifestRoot, setManifestRoot] = useState<string>("");
  const [manifestTx, setManifestTx] = useState<string>("");
  const [manifestHash, setManifestHash] = useState<string>("");
  const [onchainTx, setOnchainTx] = useState<string>("");
  const [logId, setLogId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  const networkOk = useMemo(() => true, []);

  async function ensureWallet() {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const addr = ethers.getAddress(accounts[0]);
    setWallet(addr);
    return addr;
  }

  async function handleFileSelect(file: File) {
    setErr(""); setBusy(true);
    try {
      // 1) Upload file to 0G Storage
      const { rootHash, txHash } = await uploadBlobTo0GStorage(file, file.name);
      setDatasetRoot(rootHash);
      setDatasetTx(txHash);

      // 2) Build manifest and upload it
      const uploader = await ensureWallet();
      const manifest: DaraManifest = buildManifest(rootHash, "Wave‑1 sample dataset import", uploader, { app: "DARA", version: "0.1" });
      const mHash = manifestHashHex(manifest);
      setManifestHash(mHash);

      const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
      const mUpload = await uploadBlobTo0GStorage(manifestBlob, "manifest.json");
      setManifestRoot(mUpload.rootHash);
      setManifestTx(mUpload.txHash);
    } catch (e: any) {
      setErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function commitToChain() {
    setErr(""); setBusy(true);
    try {
      const signer = await getSigner();
      const contract = getDaraContract(signer);
      const fileId = manifestRoot || datasetRoot;
      if (!fileId) throw new Error("Upload first.");

      const tx = await contract.logData(fileId);
      const receipt = await tx.wait();

      // parse event
      const iface = new ethers.Interface(DARA_ABI as any);
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() === contract.target.toLowerCase()) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed?.name === "LogCreated") {
              setLogId(parsed.args?.logId?.toString?.() || "");
              break;
            }
          } catch {}
        }
      }
      const hash = (receipt as any).hash || (receipt as any).transactionHash;
      setOnchainTx(hash);
    } catch (e: any) {
      setErr(e.message || "On‑chain logging failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-zinc-100">
      <div className="mb-3">
        <div className="text-sm opacity-80">Wallet</div>
        <div className="flex items-center gap-2">
          <button onClick={ensureWallet} className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700">
            {wallet ? `Connected: ${wallet.slice(0,6)}…${wallet.slice(-4)}` : "Connect MetaMask"}
          </button>
          {!networkOk && <span className="text-yellow-400 text-xs">Wrong network – switch to 0G Galileo</span>}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 p-4">
          <div className="font-medium mb-2">Data Upload to 0G Storage</div>
          <label className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 hover:border-zinc-500">
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              disabled={busy}
            />
            <span className="text-sm opacity-80">{busy ? "Uploading…" : "Drop file here or click to browse"}</span>
          </label>
          {err && <div className="mt-2 text-red-400 text-sm">{err}</div>}
        </div>

        <div className="rounded-lg border border-zinc-800 p-4">
          <div className="font-medium mb-2">Verification & On‑chain Log</div>
          <ul className="text-xs space-y-1">
            {datasetRoot && (
              <li>• Dataset Root: <code>{datasetRoot}</code> { " " }
                <a className="underline" href={gatewayUrlForRoot(datasetRoot)} target="_blank" rel="noreferrer">Open</a>
              </li>
            )}
            {datasetTx && <li>• Dataset Upload Tx: <code>{datasetTx}</code></li>}
            {manifestRoot && (
              <li>• Manifest Root: <code>{manifestRoot}</code> { " " }
                <a className="underline" href={gatewayUrlForRoot(manifestRoot, "manifest.json")} target="_blank" rel="noreferrer">Open</a>
              </li>
            )}
            {manifestTx && <li>• Manifest Upload Tx: <code>{manifestTx}</code></li>}
            {manifestHash && <li>• Manifest Hash (canonical): <code>{manifestHash}</code></li>}
            {onchainTx && (
              <li>• On‑chain Tx: <a className="underline" href={`${EXPLORER}/tx/${onchainTx}`} target="_blank" rel="noreferrer">{onchainTx}</a></li>
            )}
            {logId && <li>• Log ID (event): <code>{logId}</code></li>}
          </ul>
          <div className="mt-3">
            <button
              disabled={busy || (!datasetRoot && !manifestRoot)}
              onClick={commitToChain}
              className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
            >
              {busy ? "Committing…" : "Commit to 0G Chain"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


