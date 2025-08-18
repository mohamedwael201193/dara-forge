import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Upload, 
  Brain, 
  Shield, 
  Users, 
  Play, 
  CheckCircle, 
  Clock,
  Database,
  Cpu,
  BarChart2,
  Activity,
  FileText,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { WalletConnect } from "./WalletConnect"; // Import the new component
import { uploadBlobTo0GStorage, gatewayUrlForRoot } from "@/lib/ogStorage";
import { getSigner, getDaraContract, DARA_ABI, EXPLORER } from "@/lib/ethersClient";
import { buildManifest, manifestHashHex, DaraManifest } from "@/lib/manifest";
import { ethers } from "ethers";

export const DemoSection = () => {
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<'upload' | 'compute' | 'verify'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [computeStatus, setComputeStatus] = useState<'idle' | 'running' | 'complete'>('idle');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");

  const [datasetRoot, setDatasetRoot] = useState<string>("");
  const [datasetTx, setDatasetTx] = useState<string>("");

  const [manifestRoot, setManifestRoot] = useState<string>("");
  const [manifestTx, setManifestTx] = useState<string>("");
  const [manifestHash, setManifestHash] = useState<string>("");

  const [onchainTx, setOnchainTx] = useState<string>("");
  const [logId, setLogId] = useState<string>("");

  const [stage, setStage] = useState<'idle' | 'dataset' | 'manifest'>('idle');

  const handleRealUpload = async (file: File) => {
    setError('');
    setUploadProgress(0);
    setBusy(true);
    setStage('dataset');

    try {
      // 1) Dataset upload with real progress → map to 0–70%
      const ds = await uploadBlobTo0GStorage(file, file.name, (p) =>
        setUploadProgress(Math.min(70, Math.round(p * 0.7)))
      );
      setDatasetRoot(ds.rootHash);
      setDatasetTx(ds.txHash || ds.chainTx || '');

      // 2) Build + upload manifest → 70–100%
      setStage('manifest');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const uploader = accounts[0];

      const manifest: DaraManifest = buildManifest(
        ds.rootHash,
        'Wave-1 sample dataset import',
        uploader,
        { app: 'DARA', version: '0.1' }
      );
      const mHash = manifestHashHex(manifest);
      setManifestHash(mHash);

      const mBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
      const mu = await uploadBlobTo0GStorage(mBlob, 'manifest.json', (p) =>
        setUploadProgress(70 + Math.round(p * 0.30))
      );
      setManifestRoot(mu.rootHash);
      setManifestTx(mu.txHash || mu.chainTx || '');

      setUploadProgress(100);
      setStage('idle');

    } catch (e: any) {
      setError(e.message || 'Upload failed');
      setUploadProgress(0);
      setStage('idle');
    } finally {
      setBusy(false);
    }
  };

  const simulateCompute = () => {
    setComputeStatus("running");
    setTimeout(() => {
      setComputeStatus("complete");
    }, 3000);
  };

  const commitToChain = async () => {
    setError("");
    setBusy(true);
    try {
      const fileId = manifestRoot || datasetRoot;
      if (!fileId) throw new Error("Please upload a dataset first.");

      const signer = await getSigner();
      const contract = getDaraContract(signer);
      const tx = await contract.logData(fileId);
      const receipt = await tx.wait();

      // Parse LogCreated event
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
      const txHash = (receipt as any).hash || (receipt as any).transactionHash;
      setOnchainTx(txHash);
    } catch (e: any) {
      setError(e.message || "On‑chain logging failed");
    } finally {
      setBusy(false);
    }
  };

  const demoSteps = [
    {
      id: 'upload',
      title: 'Data Upload',
      description: 'Upload research data to 0G Storage',
      icon: Upload,
      color: 'text-accent'
    },
    {
      id: 'compute',
      title: 'AI Execution',
      description: 'Run AI models on 0G Compute',
      icon: Brain,
      color: 'text-neural-node'
    },
    {
      id: 'verify',
      title: 'Verification',
      description: 'Verify results on 0G Chain',
      icon: Shield,
      color: 'text-primary'
    }
  ];

  return (
    <section id="demo" className="py-24 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-neural-node/10 text-neural-node border-neural-node/20">
            Interactive Demo
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Experience DARA
            <span className="text-gradient block">in Action</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Try our interactive prototype showcasing the core DARA workflow. 
            See how decentralized AI research works in practice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demo Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Wallet Connection */}
            <Card className="p-6 border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Wallet Connection</h3>
                <Wallet className="w-5 h-5 text-muted-foreground" />
              </div>
              <WalletConnect />
            </Card>

            {/* Demo Steps */}
            <Card className="p-6 border-border">
              <h3 className="font-semibold mb-4">Demo Workflow</h3>
              <div className="space-y-3">
                {demoSteps.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentDemo === step.id;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 
                        ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'}`}
                      onClick={() => setCurrentDemo(step.id as any)}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center 
                        ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{step.title}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Demo Interface */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-border min-h-[500px]">
              {/* Upload Demo */}
              {currentDemo === 'upload' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Data Upload to 0G Storage</h3>
                      <p className="text-muted-foreground">Upload your research dataset</p>
                    </div>
                  </div>

                  {/* File Drop Zone */}
                  <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-accent/50 hover:bg-accent/5 transition-all duration-300">
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleRealUpload(e.target.files[0])}
                        disabled={busy}
                        accept=".csv,.json,.parquet,.h5"
                      />
                      <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                      <p className="text-sm text-muted-foreground">Supports: .csv, .json, .parquet, .h5</p>
                    </label>
                  </div>

                  {/* Progress bar (same section, shows during upload) */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{stage === 'dataset' ? 'Uploading dataset' : 'Uploading manifest'}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-border/50">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500 transition-[width] duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                        {stage === 'manifest' && (
                          <div
                            className="pointer-events-none absolute inset-0 animate-[barberpole_1s_linear_infinite] bg-[length:1.25rem_1.25rem]"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 10px, transparent 10px 20px)' }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {datasetRoot && (
                    <div className="flex items-center gap-2 text-sm mt-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Stored on 0G Storage</span>
                    </div>
                  )}
                  <div className="text-xs space-y-1 mt-2">
                    {datasetRoot && (
                      <div>
                        Dataset Root: <code>{datasetRoot}</code>
                        {" • "}
                        <a className="underline" target="_blank" rel="noreferrer" href={gatewayUrlForRoot(datasetRoot)}>
                          Open
                        </a>
                        {datasetTx && <> {" • "} Upload Tx: <code>{datasetTx}</code></>}
                      </div>
                    )}
                    {manifestRoot && (
                      <div>
                        Manifest Root: <code>{manifestRoot}</code>
                        {" • "}
                        <a className="underline" target="_blank" rel="noreferrer" href={gatewayUrlForRoot(manifestRoot, "manifest.json")}>
                          Open
                        </a>
                        {manifestTx && <> {" • "} Upload Tx: <code>{manifestTx}</code></>}
                      </div>
                    )}
                    {manifestHash && (
                      <div>Manifest Hash (canonical): <code>{manifestHash}</code></div>
                    )}
                    {error && <div className="text-red-500">{error}</div>}
                  </div>
                </div>
              )}

              {/* Compute Demo */}
              {currentDemo === 'compute' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-neural-node/10 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-neural-node" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">AI Model Execution</h3>
                      <p className="text-muted-foreground">Run analysis on 0G Compute</p>
                    </div>
                  </div>

                  {/* Model Selection */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="p-4 border border-neural-node/20 bg-neural-node/5">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-8 h-8 text-neural-node" />
                        <div>
                          <div className="font-medium">Neural Network Analysis</div>
                          <div className="text-sm text-muted-foreground">Pattern recognition</div>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-4 border border-border opacity-50">
                      <div className="flex items-center gap-3">
                        <Brain className="w-8 h-8 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Deep Learning</div>
                          <div className="text-sm text-muted-foreground">Coming soon</div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Execution Button */}
                  <Button
                    variant="neural"
                    onClick={simulateCompute}
                    disabled={computeStatus === 'running'}
                    className="w-full"
                  >
                    {computeStatus === 'idle' && (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Execute Model
                      </>
                    )}
                    {computeStatus === 'running' && (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Computing on 0G Network...
                      </>
                    )}
                    {computeStatus === 'complete' && (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Computation Complete
                      </>
                    )}
                  </Button>

                  {/* Results */}
                  {computeStatus === 'complete' && (
                    <div className="mt-6 p-4 bg-neural-node/5 rounded-lg border border-neural-node/20">
                      <h4 className="font-medium mb-3">Analysis Results</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Patterns Found:</span>
                          <span className="ml-2 font-medium">73</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Accuracy:</span>
                          <span className="ml-2 font-medium">94.7%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Compute Time:</span>
                          <span className="ml-2 font-medium">2.3s</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gas Used:</span>
                          <span className="ml-2 font-medium">0.002 ETH</span>
                        </div>
                      </div>
                      {/* Simulated Graph/Visualization */}
                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Key Metric Trend:</h5>
                        <div className="w-full h-32 bg-neural-node/10 rounded-lg flex items-end justify-around p-2">
                          <div className="w-4 bg-neural-node rounded-t-full" style={{ height: '80%' }}></div>
                          <div className="w-4 bg-neural-node rounded-t-full" style={{ height: '60%' }}></div>
                          <div className="w-4 bg-neural-node rounded-t-full" style={{ height: '90%' }}></div>
                          <div className="w-4 bg-neural-node rounded-t-full" style={{ height: '70%' }}></div>
                          <div className="w-4 bg-neural-node rounded-t-full" style={{ height: '85%' }}></div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">Simulated trend data over time</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Verification Demo */}
              {currentDemo === 'verify' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Result Verification</h3>
                      <p className="text-muted-foreground">Verify on 0G Chain & DA</p>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="space-y-4">
  <div className="p-4 bg-card rounded-lg border border-border">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-primary" />
        <span>Anchor manifest root on 0G Chain</span>
      </div>
      <Button variant="default" size="sm" disabled={busy || (!datasetRoot && !manifestRoot)} onClick={commitToChain}>
        {busy ? "Committing…" : "Commit to 0G Chain"}
      </Button>
    </div>
    {onchainTx && (
      <div className="text-xs mt-3">
        <CheckCircle className="w-4 h-4 text-primary inline-block mr-1" />
        <span>Transaction sent: </span>
        <a className="underline" href={`${EXPLORER}/tx/${onchainTx}`} target="_blank" rel="noreferrer">
          <code>{onchainTx}</code>
        </a>
        {logId && <span> (Log ID: <code>{logId}</code>)</span>}
      </div>
    )}
    {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
  </div>

  <div className="p-4 bg-card rounded-lg border border-border">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-primary" />
        <span>Verify data availability on 0G Storage</span>
      </div>
      <Button variant="outline" size="sm" disabled={!datasetRoot && !manifestRoot}>
        Verify
      </Button>
    </div>
    <div className="text-xs text-muted-foreground mt-2">
      This step ensures your uploaded data is retrievable from the 0G Storage network.
    </div>
  </div>

  <div className="p-4 bg-card rounded-lg border border-border">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-5 h-5 text-primary" />
        <span>Audit AI computation results</span>
      </div>
      <Button variant="outline" size="sm" disabled={computeStatus !== 'complete'}>
        Audit
      </Button>
    </div>
    <div className="text-xs text-muted-foreground mt-2">
      This step allows independent verification of the AI model execution.
    </div>
  </div>
</div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

