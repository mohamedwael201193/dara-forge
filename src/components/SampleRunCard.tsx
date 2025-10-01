"use client";
import { DARA_ABI, getDaraContract, getSigner } from "@/lib/ethersClient";
import { buildManifest, DaraManifest, manifestHashHex } from "@/lib/manifest";
import { gatewayUrlForRoot } from "@/services/ogStorage";
import { uploadToZeroG } from "@/services/ogStorageClient";
import { ethers } from "ethers";
import { useState } from "react";

export default function SampleRunCard() {
  const [datasetRoot, setDatasetRoot] = useState<string>("");
  const [datasetTx, setDatasetTx] = useState<string>("");
  const [manifestRoot, setManifestRoot] = useState<string>("");
  const [manifestTx, setManifestTx] = useState<string>("");
  const [manifestHash, setManifestHash] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const [logId, setLogId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const explorer = (process.env.NEXT_PUBLIC_OG_EXPLORER || "").replace(/\/$/, "");

  async function uploadToStorage() {
    setError("");
    setBusy(true);
    try {
      // Load tiny dataset from /public
      const res = await fetch("/sample-data/sample_abstracts.csv");
      if (!res.ok) throw new Error("Failed to load sample dataset");
      const dsBlob = await res.blob();

      // 1) Upload dataset to 0G Storage
      const ds = await uploadToZeroG(new File([dsBlob], "sample_abstracts.csv"));


      setDatasetRoot(ds.root || "");
      setDatasetTx(ds.tx || "");

      // 2) Build manifest + hash
      const accounts: string[] = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const uploader = accounts[0];
      const manifest: DaraManifest = buildManifest({
        rootHash: ds.root,
        title: "Wave‑1 sample dataset import",
        uploader,
        app: "DARA",
        version: "0.1"
      });
      const mHash = manifestHashHex(manifest);
      setManifestHash(mHash);

      // 3) Upload manifest.json to 0G Storage
      const mBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" });
      const m = await uploadToZeroG(new File([mBlob], "manifest.json"));
      setManifestRoot(m.root || "");
      setManifestTx(m.tx || "");
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function commitOnChain() {
    setError("");
    setBusy(true);
    try {
      const fileId = manifestRoot || datasetRoot; // Prefer manifest root; fallback to dataset root
      if (!fileId) throw new Error("Run upload first");

      const signer = await getSigner();
      const contract = getDaraContract(signer);
      const tx = await contract.logData(fileId);
      const receipt = await tx.wait();

      // Parse LogCreated event
      const iface = new ethers.Interface(DARA_ABI as any);
      let id = "";
      for (const log of receipt.logs) {
        if (String(log.address).toLowerCase() === String(contract.target).toLowerCase()) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed?.name === "LogCreated") {
              id = parsed.args?.logId?.toString?.() || "";
              break;
            }
          } catch {}
        }
      }
      setLogId(id);
      const hash = (receipt as any).hash || (receipt as any).transactionHash;
      setTxHash(hash);
    } catch (e: any) {
      setError(e.message || "Commit failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="text-lg font-semibold">Wave‑1: Minimal Verifiable Run</h3>
      <p className="text-sm text-muted-foreground">
        Upload a tiny dataset + manifest to 0G Storage (Merkle roots), then anchor one root on 0G Chain via your deployed contract.
      </p>

      <div className="flex gap-2">
        <button onClick={uploadToStorage} disabled={busy} className="px-3 py-2 border rounded">
          1) Upload to 0G Storage
        </button>
        <button onClick={commitOnChain} disabled={busy || (!datasetRoot && !manifestRoot)} className="px-3 py-2 border rounded">
          2) Commit on 0G Chain
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{String(error)}</div>}

      <div className="text-sm space-y-1">
        {datasetRoot && (
          <div>
            Dataset Root: <code>{datasetRoot}</code>{" "}
            <a className="underline" target="_blank" rel="noreferrer" href={gatewayUrlForRoot(datasetRoot)}>Open</a>{" "}
            {datasetTx && <span>• Upload Tx: <code>{datasetTx}</code></span>}
          </div>
        )}
        {manifestHash && (
          <div>Manifest Hash: <code>{manifestHash}</code></div>
        )}
        {manifestRoot && (
          <div>
            Manifest Root: <code>{manifestRoot}</code>{" "}
            <a className="underline" target="_blank" rel="noreferrer" href={gatewayUrlForRoot(manifestRoot)}>Open</a>{" "}
            {manifestTx && <span>• Upload Tx: <code>{manifestTx}</code></span>}
          </div>
        )}
        {txHash && (
          <div>
            On‑chain Tx:{" "}
            <a className="underline" href={`${explorer}/tx/${txHash}`} target="_blank" rel="noreferrer">
              {txHash}
            </a>
          </div>
        )}
        {logId && <div>Log ID (event): <code>{logId}</code></div>}
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: open the on‑chain tx → Logs to see LogCreated(fileId = storage root).
      </p>
    </div>
  );
}


