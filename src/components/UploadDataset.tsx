import React, { useState } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { ogGalileo } from '@/lib/networks'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, ExternalLink, Copy, AlertCircle, Loader2, Brain, Globe } from "@/lib/icons"
import { Sparkles } from 'lucide-react'
import { uploadBlobTo0GStorage, gatewayUrlForRoot, downloadWithProofUrl } from "@/lib/ogStorage"
import { requireEthersSigner, getDaraContract, DARA_ABI, explorerTxUrl } from "@/lib/ethersClient"
import { buildManifest, manifestHashHex, DaraManifest } from "@/lib/manifest"
import { ComputeJobManager } from './compute/ComputeJobManager'
import { DAPublisher } from './da/DAPublisher'
import { INFTCreator } from './inft/INFTCreator'
import { ResearchStatus } from '../contracts/DaraResearch'
import ConnectWalletButton from './ConnectWalletButton'

interface UploadedDataset {
  id: number;
  name: string;
  size: string;
  uploadDate: string;
  datasetRoot: string;
  status: ResearchStatus;
  computeJobId?: string;
  daCommitment?: string;
  inftId?: string;
  analysisResults?: any;
}

interface UploadDatasetProps {}

export const UploadDataset: React.FC<UploadDatasetProps> = () => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { balance: ogBalance, isOnZeroGChain, switchToZeroGChain, isLoading: isSwitchingChain } = useWalletBalance()
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [uploadedDatasets, setUploadedDatasets] = useState<UploadedDataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<UploadedDataset | null>(null)
  const [activeTab, setActiveTab] = useState<'compute' | 'da' | 'inft'>('compute')
  const [datasetTitle, setDatasetTitle] = useState("")
  const [datasetDescription, setDatasetDescription] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
    setError("")
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleJobCompleted = (jobId: string, outputRoot: string) => {
    setUploadedDatasets(prev => 
      prev.map(dataset => 
        dataset.id === selectedDataset?.id 
          ? { ...dataset, status: ResearchStatus.Analyzed, computeJobId: jobId }
          : dataset
      )
    );
    
    if (selectedDataset) {
      setSelectedDataset(prev => prev ? { ...prev, status: ResearchStatus.Analyzed, computeJobId: jobId } : null);
    }
  };

  const handleDAPublished = (commitment: string) => {
    setUploadedDatasets(prev => 
      prev.map(dataset => 
        dataset.id === selectedDataset?.id 
          ? { ...dataset, status: ResearchStatus.Published, daCommitment: commitment }
          : dataset
      )
    );
    
    if (selectedDataset) {
      setSelectedDataset(prev => prev ? { ...prev, status: ResearchStatus.Published, daCommitment: commitment } : null);
    }
  };

  const handleINFTCreated = (inftId: string) => {
    setUploadedDatasets(prev => 
      prev.map(dataset => 
        dataset.id === selectedDataset?.id 
          ? { ...dataset, status: ResearchStatus.INFTCreated, inftId: inftId }
          : dataset
      )
    );
    
    if (selectedDataset) {
      setSelectedDataset(prev => prev ? { ...prev, status: ResearchStatus.INFTCreated, inftId: inftId } : null);
    }
  };

  const getStatusBadge = (status: ResearchStatus) => {
    const statusConfig = {
      [ResearchStatus.Uploaded]: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'Uploaded' },
      [ResearchStatus.Processing]: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', text: 'Processing' },
      [ResearchStatus.Analyzed]: { color: 'bg-green-500/20 text-green-300 border-green-500/30', text: 'Analyzed' },
      [ResearchStatus.Published]: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', text: 'Published' },
      [ResearchStatus.Verified]: { color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', text: 'Verified' },
      [ResearchStatus.INFTCreated]: { color: 'bg-pink-500/20 text-pink-300 border-pink-500/30', text: 'INFT Created' }
    };

    const config = statusConfig[status];
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getTabAvailability = (tab: 'compute' | 'da' | 'inft') => {
    if (!selectedDataset) return false;
    
    switch (tab) {
      case 'compute':
        return selectedDataset.status === ResearchStatus.Uploaded;
      case 'da':
        return selectedDataset.status === ResearchStatus.Analyzed;
      case 'inft':
        return selectedDataset.status === ResearchStatus.Published;
      default:
        return false;
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError("Please select files to upload")
      return
    }

    if (!datasetTitle.trim()) {
      setError("Please enter a dataset title")
      return
    }

    if (!isConnected) {
      await open({ view: 'Connect', namespace: 'eip155' });
      return;
    }
    
    if (!isOnZeroGChain) {
      try { 
        await switchToZeroGChain(); 
      } catch { 
        open({ view: 'Networks', namespace: 'eip155' }); 
        return; 
      }
    }

    // Check if user has sufficient balance for gas fees
    const balanceInEther = parseFloat(ogBalance);
    // Require at least 0.01 OG for gas fees (increased from 0.001 based on team message)
    if (balanceInEther < 0.01) {
      setError(`Insufficient balance for gas fees. You have ${balanceInEther.toFixed(4)} OG, but need at least 0.01 OG for increased gas fees. Please get testnet tokens from the faucet: https://faucet.0g.ai`);
      return;
    }

    setUploading(true)
    setError("")
    setResults([])
    setUploadProgress(0)

    try {
      const uploadResults: any[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setCurrentStep(`Uploading ${file.name} to 0G Storage...`)
        
        const result = await uploadBlobTo0GStorage(file, file.name, (progress: any) => {
          const fileProgress = (i / files.length) * 100 + (progress / files.length)
          setUploadProgress(Math.min(90, fileProgress))
        })

        uploadResults.push({
          file: file.name,
          size: file.size,
          rootHash: result.rootHash,
          txHash: result.txHash || result.chainTx,
          gatewayUrl: gatewayUrlForRoot(result.rootHash),
          downloadUrl: downloadWithProofUrl(result.rootHash)
        })
      }

      // Create manifest
      setCurrentStep("Creating dataset manifest...")
      const manifest: DaraManifest = buildManifest({
        rootHash: uploadResults[0].rootHash,
        title: datasetTitle,
        uploader: address,
        app: "DARA",
        version: "1.0",
        description: datasetDescription,
        files: uploadResults.map(r => ({
          name: r.file,
          rootHash: r.rootHash,
          size: uploadResults.find(ur => ur.file === r.file)?.size || 0
        }))
      })

      const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' })
      const manifestResult = await uploadBlobTo0GStorage(manifestBlob, 'manifest.json', (progress: any) => {
        setUploadProgress(90 + progress * 0.05)
      })

      // Anchor on blockchain
      setCurrentStep("Anchoring on 0G Chain...")
      
      let txHash: string;
      try {
        const signer = await requireEthersSigner()
        const contract = getDaraContract(signer)
        
        console.log('Attempting to create research asset with root hash:', manifestResult.rootHash);
        
        // Try with higher gas limit to avoid execution reverted errors
        const gasLimit = 500000; // Set a high gas limit
        const tx = await contract.createResearchAsset(manifestResult.rootHash, "", {
          gasLimit: gasLimit
        });
        console.log('Transaction sent:', tx.hash);
        
        const receipt = await tx.wait()
        console.log('Transaction confirmed:', receipt);
        
        txHash = (receipt as any).hash || (receipt as any).transactionHash || tx.hash
        
        setUploadProgress(100)
        setCurrentStep("Upload completed successfully!")
      } catch (contractError: any) {
        console.error('Contract error details:', contractError);
        
        // Handle specific contract errors
        if (contractError.code === 'CALL_EXCEPTION') {
          throw new Error(`Smart contract call failed. This might be due to network congestion or insufficient gas. Please try again with higher gas fees. Error: ${contractError.reason || contractError.message}`);
        } else if (contractError.code === 'INSUFFICIENT_FUNDS') {
          throw new Error(`Insufficient funds for gas fees. Please ensure you have enough OG tokens for the transaction.`);
        } else if (contractError.code === 'ACTION_REJECTED') {
          throw new Error(`Transaction was rejected by user. Please try again and confirm the transaction in your wallet.`);
        } else if (contractError.message?.includes('user rejected')) {
          throw new Error(`Transaction was rejected by user. Please try again and confirm the transaction in your wallet.`);
        } else if (contractError.message?.includes('execution reverted')) {
          throw new Error(`Smart contract execution failed. This might be due to invalid data or contract requirements not being met. Please try again.`);
        } else {
          throw new Error(`Blockchain transaction failed: ${contractError.message || 'Unknown error'}`);
        }
      }

      const finalResults = [
        ...uploadResults,
        {
          file: 'manifest.json',
          size: manifestBlob.size,
          rootHash: manifestResult.rootHash,
          txHash: manifestResult.txHash || manifestResult.chainTx,
          gatewayUrl: gatewayUrlForRoot(manifestResult.rootHash),
          downloadUrl: downloadWithProofUrl(manifestResult.rootHash),
          isManifest: true,
          blockchainTx: txHash
        }
      ]

      setResults(finalResults)

      // Add to uploaded datasets for compute processing
      const newDataset: UploadedDataset = {
        id: Date.now(),
        name: datasetTitle,
        size: (Array.from(files).reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(2) + ' MB',
        uploadDate: new Date().toLocaleDateString(),
        datasetRoot: manifestResult.rootHash,
        status: ResearchStatus.Uploaded
      };

      setUploadedDatasets(prev => [...prev, newDataset]);

    } catch (err: any) {
      setError(`Upload failed: ${err.message || 'Unknown error'}`)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      setCurrentStep("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Wallet Connection Required</h3>
              <p className="text-slate-300 mb-4">Connect your wallet to upload datasets to 0G Storage</p>
              <ConnectWalletButton />
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Info */}
      {isConnected && address && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <span className="text-blue-400 font-semibold text-sm">
                    {address.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">Connected Wallet</p>
                  <p className="text-slate-400 text-sm">{address}</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Authenticated
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Upload className="w-5 h-5 text-blue-400" />
            Upload Dataset to 0G Storage
          </CardTitle>
          <CardDescription className="text-slate-300">
            Upload your research datasets with cryptographic proofs and blockchain anchoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">Dataset Title *</Label>
                <Input
                  id="title"
                  value={datasetTitle}
                  onChange={(e) => setDatasetTitle(e.target.value)}
                  placeholder="Enter dataset title"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={datasetDescription}
                  onChange={(e) => setDatasetDescription(e.target.value)}
                  placeholder="Describe your dataset"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-24"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="files" className="text-white">Select Files *</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1"
                />
              </div>
              {files && files.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white">Selected Files:</Label>
                  <div className="space-y-1">
                    {Array.from(files).map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>{file.name}</span>
                        <span className="text-slate-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">{currentStep}</span>
                  <span className="text-slate-300">{uploadProgress.toFixed(0)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2 bg-slate-700" />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading || !isConnected || !files || files.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload to 0G Storage
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Uploaded Datasets */}
      {uploadedDatasets.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-blue-400" />
              Your Research Datasets
            </CardTitle>
            <CardDescription className="text-slate-300">
              Select a dataset to process through the complete 0G ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedDatasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedDataset?.id === dataset.id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                  }`}
                  onClick={() => setSelectedDataset(dataset)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="font-medium text-white">{dataset.name}</h4>
                        <p className="text-sm text-slate-400">
                          {dataset.size} • Uploaded {dataset.uploadDate} • ID: {dataset.id}
                        </p>
                        {dataset.inftId && (
                          <p className="text-xs text-pink-400">
                            INFT: {dataset.inftId.slice(0, 16)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(dataset.status)}
                      {selectedDataset?.id === dataset.id && (
                        <CheckCircle className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Tabs */}
      {selectedDataset && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Process Dataset - {selectedDataset.name}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Complete 0G ecosystem: Compute → Data Availability → Intelligent NFTs
                </CardDescription>
              </div>
              
              <div className="flex bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('compute')}
                  disabled={!getTabAvailability('compute')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'compute'
                      ? 'bg-blue-600 text-white'
                      : getTabAvailability('compute')
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Brain className="w-4 h-4 inline mr-2" />
                  Compute
                </button>
                <button
                  onClick={() => setActiveTab('da')}
                  disabled={!getTabAvailability('da')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'da'
                      ? 'bg-green-600 text-white'
                      : getTabAvailability('da')
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Globe className="w-4 h-4 inline mr-2" />
                  Data Availability
                </button>
                <button
                  onClick={() => setActiveTab('inft')}
                  disabled={!getTabAvailability('inft')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'inft'
                      ? 'bg-pink-600 text-white'
                      : getTabAvailability('inft')
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Intelligent NFT
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'compute' && (
              <ComputeJobManager
                tokenId={selectedDataset.id}
                datasetRoot={selectedDataset.datasetRoot}
                currentStatus={selectedDataset.status}
                onJobCompleted={handleJobCompleted}
              />
            )}
            
            {activeTab === 'da' && (
              <DAPublisher
                tokenId={selectedDataset.id}
                datasetName={selectedDataset.name}
                currentStatus={selectedDataset.status}
                onPublished={handleDAPublished}
              />
            )}

            {activeTab === 'inft' && (
              <INFTCreator
                tokenId={selectedDataset.id}
                datasetName={selectedDataset.name}
                datasetRoot={selectedDataset.datasetRoot}
                currentStatus={selectedDataset.status}
                computeJobId={selectedDataset.computeJobId}
                daCommitment={selectedDataset.daCommitment}
                analysisResults={selectedDataset.analysisResults}
                onINFTCreated={handleINFTCreated}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-slate-700/50 rounded-lg space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-white">{result.file}</span>
                      {result.isManifest && (
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          Manifest
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-slate-400">
                      {(result.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-slate-400">Root Hash:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-green-400 bg-slate-900 px-2 py-1 rounded text-xs">
                          {result.rootHash.slice(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.rootHash, 'Root hash')}
                          className="h-6 w-6 p-0 hover:bg-slate-600"
                        >
                          <Copy className="w-3 h-3 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-slate-400">Storage TX:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-blue-400 bg-slate-900 px-2 py-1 rounded text-xs">
                          {result.txHash?.slice(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.txHash, 'Transaction hash')}
                          className="h-6 w-6 p-0 hover:bg-slate-600"
                        >
                          <Copy className="w-3 h-3 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {result.blockchainTx && (
                    <div>
                      <Label className="text-slate-400">Blockchain TX:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-purple-400 bg-slate-900 px-2 py-1 rounded text-xs">
                          {result.blockchainTx.slice(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.blockchainTx, 'Blockchain transaction')}
                          className="h-6 w-6 p-0 hover:bg-slate-600"
                        >
                          <Copy className="w-3 h-3 text-slate-400" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(explorerTxUrl(result.blockchainTx), '_blank')}
                          className="h-6 w-6 p-0 hover:bg-slate-600"
                        >
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(result.gatewayUrl, '_blank')}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(result.downloadUrl, '_blank')}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

