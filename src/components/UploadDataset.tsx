import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, ExternalLink, Copy, AlertCircle, Loader2 } from "@/lib/icons"
import { uploadBlobTo0GStorage, gatewayUrlForRoot, downloadWithProofUrl } from "@/lib/ogStorage"
import { getSigner, getDaraContract, DARA_ABI, explorerTxUrl } from "@/lib/ethersClient"
import { buildManifest, manifestHashHex, DaraManifest } from "@/lib/manifest"

interface UploadDatasetProps {}

export const UploadDataset: React.FC<UploadDatasetProps> = () => {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [datasetTitle, setDatasetTitle] = useState("")
  const [datasetDescription, setDatasetDescription] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [error, setError] = useState("")

  const checkWalletConnection = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum.selectedAddress;
    }
    return null;
  };

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        window.location.reload();
      } else {
        setError('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      setError('Failed to connect wallet. Please try again.');
    }
  };

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

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError("Please select files to upload")
      return
    }

    if (!datasetTitle.trim()) {
      setError("Please enter a dataset title")
      return
    }

    const connectedAddress = checkWalletConnection();
    if (!connectedAddress) {
      setError("Please connect your wallet first")
      return
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
        uploader: connectedAddress,
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
      const signer = await getSigner()
      const contract = getDaraContract(signer)
      const tx = await contract.logData(manifestResult.rootHash)
      const receipt = await tx.wait()
      const txHash = (receipt as any).hash || (receipt as any).transactionHash

      setUploadProgress(100)
      setCurrentStep("Upload completed successfully!")

      setResults([
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
      ])

    } catch (err: any) {
      setError(`Upload failed: ${err.message || 'Unknown error'}`)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      setCurrentStep("")
    }
  }

  const connectedAddress = checkWalletConnection();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!connectedAddress && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 mx-auto text-yellow-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Wallet Connection Required</h3>
              <p className="text-slate-600 mb-4">Connect your wallet to upload datasets to 0G Storage</p>
              <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Upload className="w-5 h-5 text-blue-500" />
            Upload Dataset to 0G Storage
          </CardTitle>
          <CardDescription className="text-slate-600">
            Upload your research datasets with cryptographic proofs and blockchain anchoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-slate-900">Dataset Title *</Label>
                <Input
                  id="title"
                  value={datasetTitle}
                  onChange={(e) => setDatasetTitle(e.target.value)}
                  placeholder="Enter dataset title"
                  className="border-slate-300"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-slate-900">Description</Label>
                <Textarea
                  id="description"
                  value={datasetDescription}
                  onChange={(e) => setDatasetDescription(e.target.value)}
                  placeholder="Describe your dataset"
                  className="border-slate-300 h-24"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="files" className="text-slate-900">Select Files *</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="border-slate-300"
                />
              </div>
              {files && files.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-slate-900">Selected Files:</Label>
                  <div className="space-y-1">
                    {Array.from(files).map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="w-4 h-4" />
                        <span>{file.name}</span>
                        <span className="text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{currentStep}</span>
                  <span className="text-slate-600">{uploadProgress.toFixed(0)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading || !connectedAddress || !files || files.length === 0}
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

      {/* Results */}
      {results.length > 0 && (
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-slate-900">{result.file}</span>
                      {result.isManifest && (
                        <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                          Manifest
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">
                      {(result.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-slate-600">Root Hash:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-green-600 bg-slate-100 px-2 py-1 rounded text-xs">
                          {result.rootHash.slice(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.rootHash, 'Root hash')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-slate-600">Storage TX:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-blue-600 bg-slate-100 px-2 py-1 rounded text-xs">
                          {result.txHash?.slice(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.txHash, 'Transaction hash')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {result.blockchainTx && (
                    <div>
                      <Label className="text-slate-600">Blockchain TX:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-purple-600 bg-slate-100 px-2 py-1 rounded text-xs">
                          {result.blockchainTx.slice(0, 20)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(result.blockchainTx, 'Blockchain transaction')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(explorerTxUrl(result.blockchainTx), '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(result.gatewayUrl, '_blank')}
                      className="border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Gateway
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(result.downloadUrl, '_blank')}
                      className="border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Download with Proof
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

