import { useState } from "react";
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
  Cpu
} from "lucide-react";
import { WalletConnect } from "./WalletConnect"; // Import the new component

export const DemoSection = () => {
  const [isWalletConnectOpen, setIsWalletConnectOpen] = useState(false); // State for wallet connect dialog
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [currentDemo, setCurrentDemo] = useState<'upload' | 'compute' | 'verify'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [computeStatus, setComputeStatus] = useState<'idle' | 'running' | 'complete'>('idle');

  const handleWalletConnect = () => {
    setIsWalletConnectOpen(true); // Open the wallet connect dialog
  };

  const simulateUpload = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const simulateCompute = () => {
    setComputeStatus('running');
    setTimeout(() => {
      setComputeStatus('complete');
    }, 3000);
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
              <Button
                variant="hero"
                onClick={handleWalletConnect}
                className="w-full"
              >
                Connect Wallet
              </Button>
              <WalletConnect open={isWalletConnectOpen} onOpenChange={setIsWalletConnectOpen} />
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
                  <div 
                    className="border-2 border-dashed border-border rounded-xl p-12 text-center 
                      hover:border-accent/50 hover:bg-accent/5 transition-all duration-300 cursor-pointer"
                    onClick={simulateUpload}
                  >
                    <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                    <p className="text-sm text-muted-foreground">Supports: .csv, .json, .parquet, .h5</p>
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>research-dataset.csv</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      {uploadProgress === 100 && (
                        <div className="flex items-center gap-2 text-sm text-accent">
                          <CheckCircle className="w-4 h-4" />
                          Stored on 0G Storage with hash: 0xab7f2...8e3c
                        </div>
                      )}
                    </div>
                  )}
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
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-accent" />
                        <span>Computation Hash Verified</span>
                      </div>
                      <Badge className="bg-accent/10 text-accent">✓ Valid</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-accent" />
                        <span>Data Integrity Confirmed</span>
                      </div>
                      <Badge className="bg-accent/10 text-accent">✓ Valid</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-accent" />
                        <span>Results Published to 0G DA</span>
                      </div>
                      <Badge className="bg-accent/10 text-accent">✓ Public</Badge>
                    </div>
                  </div>

                  {/* Blockchain Explorer Link */}
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Transaction Hash</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          0x7f3a9...b8e2c4
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View on Explorer
                      </Button>
                    </div>
                  </Card>

                  {/* Collaboration Panel */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="font-medium">Share with Collaborators</span>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm" 
                        placeholder="Enter researcher's wallet address"
                      />
                      <Button size="sm">Invite</Button>
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