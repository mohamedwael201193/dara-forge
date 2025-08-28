import React, { useState } from 'react'
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import { ogGalileo } from '@/lib/networks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle, ExternalLink, Copy, AlertCircle, Loader2 } from "@/lib/icons"
import { uploadBlobTo0GStorage, gatewayUrlForRoot, downloadWithProofUrl } from "@/lib/ogStorage"
import { requireEthersSigner, getDaraContract, DARA_ABI, explorerTxUrl } from "@/lib/ethersClient"
import { buildManifest, manifestHashHex, DaraManifest } from "@/lib/manifest"
import { formatEther } from 'viem'
import ConnectWalletButton from './ConnectWalletButton'

interface UploadDatasetProps {}

export const UploadDataset: React.FC<UploadDatasetProps> = () => {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { chainId, switchNetwork } = useAppKitNetwork()
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState<any[]>([])
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
    
    if (chainId !== ogGalileo.id) {
      try { 
        await switchNetwork(ogGalileo); 
      } catch { 
        open({ view: 'Networks', namespace: 'eip155' }); 
        return; 
      }
    }

    // Check if user has sufficient balance for gas fees
    try {
      const signer = await requireEthersSigner();
      if (!address) {
        setError("Wallet address not found. Please reconnect your wallet.");
        return;
      }
      const balance = await signer.provider.getBalance(address);
      const balanceInEther = parseFloat(formatEther(balance));
      
      // Require at least 0.001 OG for gas fees
      if (balanceInEther < 0.001) {
        setError(`Insufficient balance for gas fees. You have ${balanceInEther.toFixed(4)} OG, but need at least 0.001 OG. Please get testnet tokens from a faucet.`);
        return;
      }
    } catch (error) {
      setError("Failed to check wallet balance. Please ensure you're connected to 0G Chain.");
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
      const signer = await requireEthersSigner()
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
                      Gateway
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(result.downloadUrl, '_blank')}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
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

