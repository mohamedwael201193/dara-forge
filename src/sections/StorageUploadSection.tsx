import { AnimatedButton } from "@/components/AnimatedButton";
import { SuccessNotification } from "@/components/SuccessNotification";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOgUpload } from "@/hooks/useOgUpload";
import { anchorWithWallet } from "@/lib/chain/anchorClient";
import { requireEthersSigner } from "@/lib/ethersClient";
import { cn } from "@/lib/utils";
import { useActivityRecorder } from "@/services/activityRecorder";
import { useDataStore } from "@/store/dataStore";
import {
    Anchor,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Database,
    Download,
    ExternalLink,
    Eye,
    PenTool,
    Server,
    Shield
} from "lucide-react";
import React from "react";

function fmtKB(n: number) { return `${(n / 1024).toFixed(2)} KB`; }

export function StorageUploadSection() {
  const { uploadFiles } = useOgUpload();
  const { recordChainAnchor } = useActivityRecorder();
  
  // Global store
  const { 
    uploadedDatasets,
    daPublications,
    currentUpload,
    currentDA,
    addUploadedDataset,
    addDAPublication,
    setCurrentUpload,
    setCurrentDA
  } = useDataStore();
  
  // Local UI state
  const [files, setFiles] = React.useState<File[]>([]);
  const [status, setStatus] = React.useState<"idle" | "preparing" | "registering" | "checking" | "done" | "error">("idle");
  const [error, setError] = React.useState<string>("");
  const [attestation, setAttestation] = React.useState<{address: string, signature: string} | null>(null);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [successNotification, setSuccessNotification] = React.useState<{
    title: string;
    message: string;
    txHash?: string;
    explorerUrl?: string;
  } | null>(null);
  
  // DA State
  const [daStatus, setDaStatus] = React.useState<"idle" | "publishing" | "published" | "error">("idle");
  const [daError, setDaError] = React.useState<string>("");

  // Get current data from store
  const root = currentUpload?.rootHash || "";
  const daInfo = currentDA;

  function onInput(e: React.ChangeEvent<HTMLInputElement>) {
    // Reset local state
    setError(""); setStatus("idle");
    setAttestation(null); setShowAdvanced(false); setSuccessNotification(null);
    setDaStatus("idle"); setDaError("");
    
    // Reset global state
    setCurrentUpload(null);
    setCurrentDA(null);
    
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []);
    if (list.length) {
      setFiles(list);
      
      // Reset local state
      setError(""); setStatus("idle");
      setAttestation(null); setShowAdvanced(false); setSuccessNotification(null);
      setDaStatus("idle"); setDaError("");
      
      // Reset global state
      setCurrentUpload(null);
      setCurrentDA(null);
    }
  }

  async function handleUpload() {
    try {
      if (!files.length) return;
      setStatus("preparing");
      // simulate steps for UX; server call is atomic
      setTimeout(() => setStatus("registering"), 300);
      setTimeout(() => setStatus("checking"), 1000);

      const out = await uploadFiles(files);
      if (!out.ok || !out.root) {
        setError(out.error || "Upload failed");
        setStatus("error");
        return;
      }
      
      // Save to global store
      const uploadResult = {
        datasetId: `dataset-${Date.now()}`,
        rootHash: out.root,
        fileName: files[0]?.name || 'unknown',
        fileSize: files[0]?.size || 0,
        uploadTime: new Date().toISOString(),
        txHash: undefined
      };
      
      addUploadedDataset(uploadResult);
      setStatus("done");
    } catch (e: any) {
      setError(e?.message || "Upload failed");
      setStatus("error");
    }
  }

  async function handleDAPublish() {
    if (!files.length || !root) {
      setDaError("Need files and storage root for DA publishing");
      return;
    }

    setDaStatus("publishing");
    setDaError("");

    try {
      // Convert files to base64 for DA submission
      const fileData = await files[0].arrayBuffer();
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(fileData)));

      const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

      const response = await fetch(`${API_BASE}/api/da`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          data: base64Data,
          metadata: { 
            datasetId: `dataset-${Date.now()}`,
            rootHash: root,
            fileName: files[0].name,
            fileSize: files[0].size
          }
        })
      });

      if (!response.ok) {
        throw new Error(`DA submission failed: ${response.status}`);
      }

      const result = await response.json();
      
      // Save to global store
      addDAPublication(result);
      setDaStatus("published");

      setSuccessNotification({
        title: "Published to 0G DA! 🎯",
        message: "Your dataset is now permanently available on the Data Availability network.",
      });

    } catch (error: any) {
      setDaError(`DA publishing failed: ${error.message}`);
      setDaStatus("error");
    }
  }

  async function handleAnchor() {
    if (!root) return;
    try {
      const { txHash, explorerUrl, activityData } = await anchorWithWallet(
        root as `0x${string}`,
        undefined, // manifest
        undefined, // project
        {
          datasetId: currentUpload?.datasetId,
          storageIndexer: currentUpload?.indexer,
          daEndpoint: currentDA?.daEndpointUsed,
          description: `Storage section anchor: ${currentUpload?.fileName || 'unknown file'}`
        }
      );
      
      // Record the anchor activity with enhanced metadata
      if (activityData) {
        recordChainAnchor(activityData);
      }
      
      setSuccessNotification({
        title: "Dataset Anchored Successfully! 🎉",
        message: "Your dataset has been permanently anchored on 0G Chain with full provenance.",
        txHash,
        explorerUrl
      });
    } catch (e: any) {
      alert(`Anchor failed: ${e?.message || "Unknown error"}`);
    }
  }

  async function handleAttestation() {
    if (!root) return;
    try {
      const signer = await requireEthersSigner();
      const address = await signer.getAddress();
      const message = `DARA Attestation: root=${root}`;
      const signature = await signer.signMessage(message);
      
      // Store attestation on server
      const response = await fetch('/api/attest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ root, message, signature })
      });
      
      const result = await response.json();
      if (result.ok) {
        setAttestation({ address, signature });
        setSuccessNotification({
          title: "Attestation Signed Successfully! ✅",
          message: `Your authorship has been cryptographically verified and stored.`
        });
      } else {
        throw new Error(result.error || 'Attestation failed');
      }
    } catch (e: any) {
      alert(`Attestation failed: ${e?.message || "Unknown error"}`);
    }
  }

  async function handleServerAnchor() {
    if (!root) return;
    try {
      const body = { rootHash: root, manifestHash: root, projectId: "dara-forge" };
      const response = await fetch("/api/anchor", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
      });
      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error || "Server anchor failed");
      }
      alert(`Dataset anchored by server! Transaction: ${result.txHash}`);
      window.open(result.explorerUrl, "_blank");
    } catch (e: any) {
      alert(`Server anchor failed: ${e?.message || "Unknown error"}`);
    }
  }

  const total = files.reduce((a, f) => a + f.size, 0);

  return (
    <section className="py-16 px-4 bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-white">Upload Research Datasets</h2>
          <p className="text-slate-300 mt-2">Securely upload to 0G Storage with cryptographic proofs and verifiable retrieval.</p>
        </div>

        <Card className="bg-slate-900/60 border-slate-700 shadow-xl">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white">0G Storage Upload</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className={cn(
                "rounded-xl border-2 border-dashed p-8 text-center transition",
                "bg-slate-800/40 border-slate-700 hover:border-blue-400"
              )}
            >
              <p className="text-slate-300 mb-3">Drag & drop files here or choose from device</p>
              <input type="file" multiple onChange={onInput} className="block w-full text-slate-200" />
              <div className="mt-4 text-sm text-slate-400">Selected: {files.length} file(s) • {fmtKB(total)}</div>
            </div>

            {files.length > 0 && (
              <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-200 font-medium mb-2">Files</p>
                <ul className="space-y-1 text-sm">
                  {files.map((f, i) => (
                    <li key={i} className="flex justify-between text-slate-300">
                      <span className="truncate">{f.name}</span>
                      <span className="text-slate-400">{fmtKB(f.size)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className={cn("rounded-lg p-3 border", status !== "idle" ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-800/40")}>
                <p className="text-slate-200 text-sm font-medium">Upload prepared</p>
              </div>
              <div className={cn("rounded-lg p-3 border", ["registering","checking","done"].includes(status) ? "border-green-500 bg-green-500/10" : "border-slate-700 bg-slate-800/40")}>
                <p className="text-slate-200 text-sm font-medium">Registration transaction complete</p>
              </div>
              <div className={cn("rounded-lg p-3 border", ["checking","done"].includes(status) ? "border-purple-500 bg-purple-500/10" : "border-slate-700 bg-slate-800/40")}>
                <p className="text-slate-200 text-sm font-medium">Waiting for checking file metadata…</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="bg-blue-600 hover:bg-blue-500" onClick={handleUpload} disabled={!files.length || status === "preparing"}>
                Upload to 0G Storage
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-200" onClick={() => { setFiles([]); setStatus("idle"); setError(""); }}>
                Clear
              </Button>
            </div>

            {error && <div className="text-red-400 text-sm">Upload failed: {error}</div>}

            {root && (
              <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4 space-y-3">
                <div>
                  <p className="text-slate-300 text-sm mb-1">Merkle Root</p>
                  <code className="text-slate-100 break-all">{root}</code>
                </div>

                {/* DA Information Section */}
                {daInfo && (
                  <div className="space-y-2 p-3 bg-slate-800/60 border border-slate-600 rounded-lg">
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Published to 0G DA</span>
                    </div>
                    
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-slate-400">Blob Hash:</span>
                        <code className="ml-2 text-xs text-slate-300">{daInfo.blobHash.slice(0, 16)}...</code>
                      </div>
                      
                      <div>
                        <span className="text-slate-400">Data Root:</span>
                        <code className="ml-2 text-xs text-slate-300">{daInfo.dataRoot.slice(0, 16)}...</code>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-slate-400">Epoch:</span>
                          <span className="ml-2 text-slate-300">{daInfo.epoch}</span>
                        </div>
                        
                        <div>
                          <span className="text-slate-400">Status:</span>
                          <Badge variant="outline" className="ml-2 text-green-400 border-green-400">
                            {daInfo.verified ? '✓ Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      
                      {daInfo.txHash && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-blue-400 border-blue-400 hover:bg-blue-400/10"
                            onClick={() => window.open(`https://chainscan-galileo.0g.ai/tx/${daInfo.txHash}`, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            View Transaction on Explorer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {daError && (
                  <div className="bg-red-900/20 border border-red-700 rounded p-3">
                    <p className="text-red-400 text-sm">DA Error: {daError}</p>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="bg-slate-700/30 rounded-lg p-3">
                    <p className="text-slate-300 text-sm mb-2">Dataset Manifest</p>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Files: {files.length} • Total: {fmtKB(files.reduce((sum, f) => sum + f.size, 0))}</p>
                      <p>Created: {new Date().toLocaleString()}</p>
                      {files.length <= 3 ? (
                        files.map((f, i) => (
                          <p key={i}>• {f.name} ({fmtKB(f.size)})</p>
                        ))
                      ) : (
                        <>
                          {files.slice(0, 2).map((f, i) => (
                            <p key={i}>• {f.name} ({fmtKB(f.size)})</p>
                          ))}
                          <p>• ... and {files.length - 2} more files</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {attestation && (
                  <div className="bg-green-900/20 border border-green-700 rounded p-3">
                    <p className="text-green-400 text-sm mb-1">✅ Researcher Attestation Signed</p>
                    <p className="text-slate-300 text-xs">Address: {attestation.address}</p>
                  </div>
                )}
                
                <div className="bg-slate-700/50 rounded p-3 text-sm">
                  <p className="text-slate-300 mb-2"><strong>Provenance Information:</strong></p>
                  <p className="text-slate-400">• Storage Payer: Server (0xDE84...4435) - Sponsored Upload</p>
                  <p className="text-slate-400">• Dataset Author: {attestation ? attestation.address : 'Sign attestation to verify'}</p>
                  <p className="text-slate-400">• Anchor Signer: Connected Wallet (for on-chain provenance)</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {root && (
                    <>
                      <AnimatedButton 
                        variant="secondary"
                        icon={Download}
                        href={`/api/storage/proxy?root=${encodeURIComponent(root)}&name=${encodeURIComponent(files[0]?.name || "dataset")}`}
                        download={files[0]?.name || "dataset"}
                      >
                        Download
                      </AnimatedButton>
                      <AnimatedButton 
                        variant="warning"
                        icon={Shield}
                        href={`/api/storage/proxy?root=${encodeURIComponent(root)}&proof=1&name=${encodeURIComponent((files[0]?.name || "dataset") + ".proof")}`}
                        download={(files[0]?.name || "dataset") + ".proof"}
                      >
                        Download with Proof
                      </AnimatedButton>
                    </>
                  )}
                  <AnimatedButton 
                    variant="info"
                    icon={Eye}
                    href={`https://storagescan-galileo.0g.ai/files?root=${encodeURIComponent(root)}`}
                    target="_blank"
                  >
                    View on StorageScan
                  </AnimatedButton>
                  <AnimatedButton 
                    variant="success"
                    icon={CheckCircle}
                    href={`https://storagescan-galileo.0g.ai/files?root=${encodeURIComponent(root)}`}
                    target="_blank"
                  >
                    Verify Integrity
                  </AnimatedButton>
                  
                  {!attestation && (
                    <AnimatedButton 
                      variant="info"
                      icon={PenTool}
                      onClick={handleAttestation}
                    >
                      Sign Attestation
                    </AnimatedButton>
                  )}
                  
                  <AnimatedButton 
                    variant="primary"
                    icon={Anchor}
                    onClick={handleAnchor}
                  >
                    Anchor on 0G Chain
                  </AnimatedButton>
                  
                  {/* DA Publish Button */}
                  {!daInfo && daStatus !== "publishing" && (
                    <AnimatedButton 
                      variant="secondary"
                      icon={Database}
                      onClick={handleDAPublish}
                      disabled={!root}
                    >
                      Publish to 0G DA
                    </AnimatedButton>
                  )}
                  
                  {daStatus === "publishing" && (
                    <AnimatedButton 
                      variant="secondary"
                      icon={Database}
                      disabled
                    >
                      Publishing to DA...
                    </AnimatedButton>
                  )}
                  
                  <AnimatedButton 
                    variant="secondary"
                    size="sm"
                    icon={showAdvanced ? ChevronUp : ChevronDown}
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-slate-400 hover:text-slate-300"
                  >
                    {showAdvanced ? 'Hide' : 'Show'} Advanced
                  </AnimatedButton>
                </div>
                
                {showAdvanced && (
                  <div className="bg-slate-800/60 rounded border border-slate-600 p-4">
                    <p className="text-slate-300 text-sm mb-3">Alternative Anchoring:</p>
                    <AnimatedButton 
                      variant="secondary"
                      size="sm"
                      icon={Server}
                      onClick={handleServerAnchor}
                    >
                      Use Server Anchor (Demo Mode)
                    </AnimatedButton>
                    <p className="text-slate-400 text-xs mt-2">
                      Note: Server anchoring shows server as uploader, not ideal for provenance
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Success Notification Modal */}
      {successNotification && (
        <SuccessNotification
          title={successNotification.title}
          message={successNotification.message}
          txHash={successNotification.txHash}
          explorerUrl={successNotification.explorerUrl}
          onClose={() => setSuccessNotification(null)}
        />
      )}
    </section>
  );
}