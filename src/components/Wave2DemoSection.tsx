"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ExternalLink,
  Download,
  Copy,
  AlertCircle,
  Zap,
  Network,
  FileText,
  Search,
  Star,
  GitBranch,
  Activity,
  TrendingUp,
  Globe,
  Lock,
  Unlock,
  Eye,
  Share2,
  Award
} from "lucide-react";
import { WalletConnect } from "./WalletConnect"; 
import { uploadTo0G } from "@/services/ogStorageClient";
import { gatewayUrlForRoot, downloadWithProofUrl } from "@/lib/ogStorage";
import { getSigner, getDaraContract, DARA_ABI, explorerTxUrl } from "@/lib/ethersClient";
import { buildManifest, manifestHashHex, DaraManifest } from "@/lib/manifest";
import { ethers } from "ethers";

interface Dataset {
  id: string;
  name: string;
  description: string;
  rootHash: string;
  size: number;
  uploadDate: string;
  author: string;
  verified: boolean;
  downloads: number;
  citations: number;
  tags: string[];
  version: string;
  txHash?: string;
}

interface ResearchProfile {
  address: string;
  name: string;
  institution: string;
  datasets: number;
  citations: number;
  reputation: number;
  verified: boolean;
}

export const Wave2DemoSection = () => {
  const [connectedWallet, setConnectedWallet] = useState(false);
  const [currentTab, setCurrentTab] = useState("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stage, setStage] = useState<"idle" | "dataset" | "manifest" | "compute">("idle");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [datasetMetadata, setDatasetMetadata] = useState({
    title: "",
    description: "",
    tags: "",
    version: "1.0.0",
    license: "MIT",
    isPublic: true,
    sourceUrl: ""
  });

  const [datasetRoot, setDatasetRoot] = useState<string>("");
  const [datasetTx, setDatasetTx] = useState<string>("");
  const [manifestRoot, setManifestRoot] = useState<string>("");
  const [manifestTx, setManifestTx] = useState<string>("");
  const [onchainTx, setOnchainTx] = useState<string>("");
  const [logId, setLogId] = useState<string>("");

  // Discovery states
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  // Profile states
  const [userProfile, setUserProfile] = useState<ResearchProfile | null>(null);
  const [profileStats, setProfileStats] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    totalCitations: 0,
    reputationScore: 0
  });

  // Compute states
  const [computeJobs, setComputeJobs] = useState<any[]>([]);
  const [selectedComputeJob, setSelectedComputeJob] = useState<any>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Initialize mock datasets
    setDatasets([
      {
        id: "1",
        name: "COVID-19 Protein Structures",
        description: "Comprehensive dataset of SARS-CoV-2 protein structures for drug discovery research",
        rootHash: "0x1234567890abcdef...",
        size: 2500000000, // 2.5GB
        uploadDate: "2024-08-15",
        author: "0x742d35Cc6634C0532925a3b8D404d3aABB8ad9",
        verified: true,
        downloads: 1247,
        citations: 89,
        tags: ["COVID-19", "Protein", "Drug Discovery", "Bioinformatics"],
        version: "2.1.0",
        txHash: "0xabcd1234..."
      },
      {
        id: "2", 
        name: "Climate Change Satellite Data",
        description: "10-year satellite imagery dataset tracking global temperature changes",
        rootHash: "0xfedcba0987654321...",
        size: 5000000000, // 5GB
        uploadDate: "2024-08-10",
        author: "0x8ba1f109551bD432803012645Hac136c30C6213",
        verified: true,
        downloads: 892,
        citations: 156,
        tags: ["Climate", "Satellite", "Temperature", "Environment"],
        version: "1.5.2",
        txHash: "0xefgh5678..."
      },
      {
        id: "3",
        name: "Neural Network Training Data",
        description: "Large-scale labeled dataset for computer vision model training",
        rootHash: "0x9876543210fedcba...",
        size: 1200000000, // 1.2GB
        uploadDate: "2024-08-20",
        author: "0x123456789abcdef0123456789abcdef012345678",
        verified: false,
        downloads: 445,
        citations: 23,
        tags: ["AI", "Computer Vision", "Training", "Neural Networks"],
        version: "1.0.0",
        txHash: "0xijkl9012..."
      }
    ]);

    // Initialize mock profile
    setUserProfile({
      address: "0x742d35Cc6634C0532925a3b8D404d3aABB8ad9",
      name: "Dr. Sarah Chen",
      institution: "MIT Research Lab",
      datasets: 12,
      citations: 1247,
      reputation: 95,
      verified: true
    });

    setProfileStats({
      totalUploads: 12,
      totalDownloads: 8934,
      totalCitations: 1247,
      reputationScore: 95
    });
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setSuccess("");
    }
  };

  const handleMetadataChange = (field: string, value: string | boolean) => {
    setDatasetMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUploadWithMetadata = async () => {
    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    if (!datasetMetadata.title || !datasetMetadata.description) {
      setError("Please fill in title and description");
      return;
    }

    setError("");
    setSuccess("");
    setUploadProgress(0);
    setBusy(true);
    setStage("dataset");

    try {
      // 1) Upload dataset to 0G Storage
      setSuccess("🚀 Uploading to 0G Storage Network...");
      const ds = await uploadTo0G(selectedFile);
      setDatasetRoot(ds.rootHash);
      setDatasetTx(ds.txHash || "");

      // 2) Create enhanced manifest with metadata
      setStage("manifest");
      setSuccess("📝 Creating enhanced manifest with metadata...");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const uploader = accounts[0];

      const enhancedManifest: DaraManifest = buildManifest({
        rootHash: ds.rootHash,
        title: datasetMetadata.title,
        uploader,
        app: "DARA",
        version: "2.0",
        description: datasetMetadata.description,
        tags: datasetMetadata.tags.split(',').map(tag => tag.trim()),
        datasetVersion: datasetMetadata.version,
        license: datasetMetadata.license,
        isPublic: datasetMetadata.isPublic,
        fileSize: selectedFile.size,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        uploadTime: new Date().toISOString(),
        sourceUrl: datasetMetadata.sourceUrl || ""
      });

      const mBlob = new Blob([JSON.stringify(enhancedManifest, null, 2)], { 
        type: "application/json"
      });
      const mu = await uploadTo0G(new File([mBlob], "manifest.json"));
      setManifestRoot(mu.rootHash);
      setManifestTx(mu.txHash || "");

      // 3) Commit to blockchain
      setSuccess("⛓️ Committing to 0G Chain...");
      const signer = await getSigner();
      const contract = getDaraContract(signer);
      const tx = await contract.logData(mu.rootHash);
      const receipt = await tx.wait();
      const txHash = (receipt as any).hash || (receipt as any).transactionHash;
      setOnchainTx(txHash);

      setUploadProgress(100);
      setStage("idle");
      setSuccess("🎉 Dataset uploaded successfully with enhanced metadata!");

      // Add to local datasets list
      const newDataset: Dataset = {
        id: Date.now().toString(),
        name: datasetMetadata.title,
        description: datasetMetadata.description,
        rootHash: mu.rootHash,
        size: selectedFile.size,
        uploadDate: new Date().toISOString().split('T')[0],
        author: uploader,
        verified: true,
        downloads: 0,
        citations: 0,
        tags: datasetMetadata.tags.split(',').map(tag => tag.trim()),
        version: datasetMetadata.version,
        txHash: txHash
      };
      setDatasets(prev => [newDataset, ...prev]);

    } catch (e: any) {
      setError(`❌ Upload failed: ${e.message || "Unknown error"}`);
      setUploadProgress(0);
      setStage("idle");
    } finally {
      setBusy(false);
    }
  };

  const simulateComputeJob = async (dataset: Dataset) => {
    setStage("compute");
    setBusy(true);
    setSuccess("🧠 Starting 0G Compute job on dataset...");

    // Simulate compute job
    const job = {
      id: Date.now().toString(),
      datasetId: dataset.id,
      datasetName: dataset.name,
      jobType: "AI Model Training",
      status: "running",
      progress: 0,
      startTime: new Date().toISOString(),
      estimatedDuration: "15 minutes",
      computeNodes: 4,
      gpuType: "NVIDIA A100"
    };

    setComputeJobs(prev => [job, ...prev]);
    setSelectedComputeJob(job);

    // Simulate progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadProgress(i);
      if (i === 100) {
        setSuccess("✅ Compute job completed successfully!");
        setStage("idle");
        setBusy(false);
      }
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(`📋 ${label} copied to clipboard!`);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDatasets = datasets.filter(dataset =>
    String(dataset.name).toLowerCase().includes(String(searchQuery).toLowerCase()) ||
    String(dataset.description).toLowerCase().includes(String(searchQuery).toLowerCase()) ||
    dataset.tags.some(tag => String(tag).toLowerCase().includes(String(searchQuery).toLowerCase()))
  );

  return (
    <section id="demo" className="py-24 px-4 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            🌊 Wave 2 Enhanced • Full 0G Stack Integration
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            DARA Forge
            <span className="text-gradient block">Research Ecosystem</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Complete research collaboration platform with dataset discovery, enhanced metadata, 
            researcher profiles, and 0G Compute integration for AI model execution.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Main Tabs Interface */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Enhanced Upload
            </TabsTrigger>
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Dataset Discovery
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Researcher Profile
            </TabsTrigger>
            <TabsTrigger value="compute" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              0G Compute
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Controls */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Wallet Connection
                  </h3>
                  <WalletConnect />
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Dataset Metadata
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Title *</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="Dataset title"
                        value={datasetMetadata.title}
                        onChange={(e) => handleMetadataChange('title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description *</label>
                      <textarea
                        className="w-full mt-1 p-2 border rounded-md h-20"
                        placeholder="Describe your dataset"
                        value={datasetMetadata.description}
                        onChange={(e) => handleMetadataChange('description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tags</label>
                      <input
                        type="text"
                        className="w-full mt-1 p-2 border rounded-md"
                        placeholder="AI, Biology, Climate (comma-separated)"
                        value={datasetMetadata.tags}
                        onChange={(e) => handleMetadataChange('tags', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium">Version</label>
                        <input
                          type="text"
                          className="w-full mt-1 p-2 border rounded-md"
                          value={datasetMetadata.version}
                          onChange={(e) => handleMetadataChange('version', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">License</label>
                        <select
                          className="w-full mt-1 p-2 border rounded-md"
                          value={datasetMetadata.license}
                          onChange={(e) => handleMetadataChange('license', e.target.value)}
                        >
                          <option value="MIT">MIT</option>
                          <option value="Apache-2.0">Apache 2.0</option>
                          <option value="GPL-3.0">GPL 3.0</option>
                          <option value="CC-BY-4.0">CC BY 4.0</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={datasetMetadata.isPublic}
                        onChange={(e) => handleMetadataChange('isPublic', e.target.checked)}
                      />
                      <label htmlFor="isPublic" className="text-sm">Make dataset public</label>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Upload Area */}
              <div className="lg:col-span-2">
                <Card className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Enhanced Dataset Upload</h3>
                      <p className="text-muted-foreground">Upload with rich metadata and versioning</p>
                    </div>
                  </div>

                  {/* File Selection */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-6">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept="*/*"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        {selectedFile ? selectedFile.name : "Choose a dataset file"}
                      </p>
                      <p className="text-muted-foreground">
                        {selectedFile 
                          ? `${formatFileSize(selectedFile.size)} • Click to change`
                          : "Any file type supported • Max 50MB"
                        }
                      </p>
                    </label>
                  </div>

                  {/* Upload Progress */}
                  {busy && (
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span>Upload Progress</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        {stage === "dataset" && "Uploading to 0G Storage Network..."}
                        {stage === "manifest" && "Creating enhanced manifest..."}
                        {stage === "compute" && "Running 0G Compute job..."}
                      </p>
                    </div>
                  )}

                  {/* Upload Button */}
                  <Button 
                    onClick={handleUploadWithMetadata}
                    disabled={!selectedFile || busy || !datasetMetadata.title}
                    className="w-full mb-6"
                    size="lg"
                  >
                    {busy ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Upload with Enhanced Metadata
                      </>
                    )}
                  </Button>

                  {/* Results */}
                  {(datasetRoot || manifestRoot) && (
                    <div className="space-y-4 pt-6 border-t">
                      <h4 className="font-semibold flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Upload Results
                      </h4>
                      
                      {datasetRoot && (
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Dataset Root Hash</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(datasetRoot, "Dataset hash")}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm font-mono break-all">{datasetRoot}</p>
                          {datasetTx && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Transaction:</span>
                              <a
                                href={explorerTxUrl(datasetTx)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                {datasetTx.slice(0, 10)}...{datasetTx.slice(-8)}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {onchainTx && (
                        <div className="bg-green-50 p-4 rounded-lg space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="font-medium text-green-700">Committed to 0G Chain</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-600">Transaction:</span>
                            <a
                              href={explorerTxUrl(onchainTx)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-700 hover:underline flex items-center gap-1"
                            >
                              {onchainTx.slice(0, 10)}...{onchainTx.slice(-8)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Dataset Discovery Tab */}
          <TabsContent value="discovery" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Dataset Discovery
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search datasets..."
                    className="px-3 py-2 border rounded-md w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDatasets.map((dataset) => (
                  <Card key={dataset.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-500" />
                        {dataset.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        v{dataset.version}
                      </Badge>
                    </div>
                    
                    <h4 className="font-semibold mb-2">{dataset.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {dataset.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {dataset.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span>{formatFileSize(dataset.size)}</span>
                      <span>{dataset.uploadDate}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs mb-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {dataset.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {dataset.citations}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedDataset(dataset)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => simulateComputeJob(dataset)}
                        disabled={busy}
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        Compute
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={downloadWithProofUrl(dataset.rootHash, dataset.name)}
                          download
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Researcher Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Info */}
              <div className="lg:col-span-1">
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">{userProfile?.name}</h3>
                    <p className="text-muted-foreground">{userProfile?.institution}</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      {userProfile?.verified && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline">
                        <Award className="w-3 h-3 mr-1" />
                        Rep: {userProfile?.reputation}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Address</span>
                      <span className="text-sm font-mono">
                        {userProfile?.address.slice(0, 6)}...{userProfile?.address.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Datasets</span>
                      <span className="text-sm font-medium">{userProfile?.datasets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Citations</span>
                      <span className="text-sm font-medium">{userProfile?.citations}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Profile Stats */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h3 className="font-semibold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Research Impact Metrics
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {profileStats.totalUploads}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Uploads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {profileStats.totalDownloads.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Downloads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {profileStats.totalCitations.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Citations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {profileStats.reputationScore}
                      </div>
                      <div className="text-sm text-muted-foreground">Reputation</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Upload className="w-4 h-4 text-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Uploaded "COVID-19 Protein Structures"</p>
                          <p className="text-xs text-muted-foreground">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Received 15 new citations</p>
                          <p className="text-xs text-muted-foreground">1 week ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Brain className="w-4 h-4 text-purple-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Completed 0G Compute job</p>
                          <p className="text-xs text-muted-foreground">2 weeks ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 0G Compute Tab */}
          <TabsContent value="compute" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                0G Compute Network
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Compute Jobs */}
                <div>
                  <h4 className="font-medium mb-4">Recent Compute Jobs</h4>
                  <div className="space-y-3">
                    {computeJobs.length > 0 ? computeJobs.map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{job.jobType}</span>
                          <Badge variant={job.status === 'running' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{job.datasetName}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{job.computeNodes} nodes • {job.gpuType}</span>
                          <span>{job.estimatedDuration}</span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No compute jobs yet</p>
                        <p className="text-sm text-muted-foreground">Select a dataset from Discovery to start a compute job</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compute Network Stats */}
                <div>
                  <h4 className="font-medium mb-4">Network Statistics</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Available Nodes</span>
                        <span className="font-medium">1,247</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Active Jobs</span>
                        <span className="font-medium">89</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Job Time</span>
                        <span className="font-medium">12 min</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h5 className="font-medium mb-2">GPU Types Available</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>NVIDIA A100</span>
                          <span>156 nodes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NVIDIA V100</span>
                          <span>89 nodes</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NVIDIA RTX 4090</span>
                          <span>234 nodes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 text-center">
                <Database className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">2.4TB</div>
                <div className="text-sm text-muted-foreground">Total Storage</div>
              </Card>
              <Card className="p-6 text-center">
                <Network className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">99.9%</div>
                <div className="text-sm text-muted-foreground">Network Uptime</div>
              </Card>
              <Card className="p-6 text-center">
                <Activity className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-sm text-muted-foreground">Active Researchers</div>
              </Card>
              <Card className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">89%</div>
                <div className="text-sm text-muted-foreground">Verification Rate</div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Network Health Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">0G Storage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <span className="text-green-600">Online</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Latency</span>
                      <span>45ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Throughput</span>
                      <span>1.2GB/s</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">0G Chain</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <span className="text-green-600">Online</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Block Height</span>
                      <span>2,847,392</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TPS</span>
                      <span>2,500</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">0G Compute</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <span className="text-green-600">Online</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Active Jobs</span>
                      <span>89</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Queue Time</span>
                      <span>2.3min</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

