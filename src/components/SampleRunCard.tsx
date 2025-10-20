"use client";
import { apiUrl } from "@/lib/api";
import { DARA_ABI, getDaraContract, getSigner } from "@/lib/ethersClient";
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

  // DA State
  const [daInfo, setDaInfo] = useState<{
    blobHash: string;
    dataRoot: string;
    epoch: number;
    quorumId: number;
    verified: boolean;
    timestamp: string;
  } | null>(null);

  const explorer = (process.env.NEXT_PUBLIC_OG_EXPLORER || "").replace(
    /\/$/,
    ""
  );

  async function uploadToStorage() {
    setError("");
    setBusy(true);
    try {
      // Load tiny dataset from /public
      const res = await fetch("/sample-data/sample_abstracts.csv");
      if (!res.ok) throw new Error("Failed to load sample dataset");
      const dsBlob = await res.blob();

      // 1) Upload dataset to 0G Storage
      const ds = await uploadToZeroG(
        new File([dsBlob], "sample_abstracts.csv")
      );

      setDatasetRoot(ds.root || "");
      setDatasetTx(ds.tx || "");

      // 2) Build simple manifest + hash
      const accounts: string[] = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      const uploader = accounts[0];
      const manifest = {
        rootHash: ds.root,
        title: "Wave‑1 sample dataset import",
        uploader,
        app: "DARA",
        version: "0.1",
      };

      // Simple hash for demo
      const mHash = ethers.id(JSON.stringify(manifest));
      setManifestHash(mHash);

      // 3) Upload manifest.json to 0G Storage
      const mBlob = new Blob([JSON.stringify(manifest, null, 2)], {
        type: "application/json",
      });
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
        if (
          String(log.address).toLowerCase() ===
          String(contract.target).toLowerCase()
        ) {
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

  async function publishToDA() {
    if (!datasetRoot) {
      setError("Need dataset root for DA publishing");
      return;
    }

    setBusy(true);
    setError("");

    try {
      // Load the same sample data for DA publishing
      const res = await fetch("/sample-data/sample_abstracts.csv");
      if (!res.ok) throw new Error("Failed to load sample dataset");
      const fileData = await res.arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileData)));

      const response = await fetch(apiUrl("/api/da"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          data: base64Data,
          metadata: {
            datasetId: `sample-${Date.now()}`,
            rootHash: datasetRoot,
            fileName: "sample_abstracts.csv",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`DA submission failed: ${response.status}`);
      }

      const result = await response.json();
      setDaInfo(result);
    } catch (error: any) {
      setError(`DA publishing failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="text-lg font-semibold">Wave‑1: Minimal Verifiable Run</h3>
      <p className="text-sm text-muted-foreground">
        Upload a tiny dataset + manifest to 0G Storage (Merkle roots), then
        anchor one root on 0G Chain via your deployed contract.
      </p>

      <div className="flex gap-2">
        <button
          onClick={uploadToStorage}
          disabled={busy}
          className="px-3 py-2 border rounded"
        >
          1) Upload to 0G Storage
        </button>
        <button
          onClick={commitOnChain}
          disabled={busy || (!datasetRoot && !manifestRoot)}
          className="px-3 py-2 border rounded"
        >
          2) Commit on 0G Chain
        </button>
        <button
          onClick={publishToDA}
          disabled={busy || !datasetRoot}
          className="px-3 py-2 border rounded bg-blue-500 text-white"
        >
          3) Publish to 0G DA
        </button>
      </div>

      {error && <div className="text-red-600 text-sm">{String(error)}</div>}

      <div className="text-sm space-y-1">
        {datasetRoot && (
          <div>
            Dataset Root: <code>{datasetRoot}</code>{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href={gatewayUrlForRoot(datasetRoot)}
            >
              Open
            </a>{" "}
            {datasetTx && (
              <span>
                • Upload Tx: <code>{datasetTx}</code>
              </span>
            )}
          </div>
        )}
        {manifestHash && (
          <div>
            Manifest Hash: <code>{manifestHash}</code>
          </div>
        )}
        {manifestRoot && (
          <div>
            Manifest Root: <code>{manifestRoot}</code>{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href={gatewayUrlForRoot(manifestRoot)}
            >
              Open
            </a>{" "}
            {manifestTx && (
              <span>
                • Upload Tx: <code>{manifestTx}</code>
              </span>
            )}
          </div>
        )}
        {txHash && (
          <div>
            On‑chain Tx:{" "}
            <a
              className="underline"
              href={`${explorer}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {txHash}
            </a>
          </div>
        )}
        {logId && (
          <div>
            Log ID (event): <code>{logId}</code>
          </div>
        )}

        {/* DA Information */}
        {daInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <div className="text-sm font-medium text-blue-800 mb-2">
              🎯 0G Data Availability
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>
                DA Blob Hash:{" "}
                <code className="bg-blue-100 px-1 rounded">
                  {daInfo.blobHash}
                </code>
              </div>
              <div>
                DA Data Root:{" "}
                <code className="bg-blue-100 px-1 rounded">
                  {daInfo.dataRoot}
                </code>
              </div>
              <div>
                DA Status:{" "}
                <span
                  className={`inline-block px-2 py-1 rounded text-xs ${
                    daInfo.verified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {daInfo.verified ? "Available" : "Pending"}
                </span>
              </div>
              <div>DA Epoch: {daInfo.epoch}</div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Tip: open the on‑chain tx → Logs to see LogCreated(fileId = storage
        root).
      </p>
    </div>
  );
}
