import { useState } from "react"
import { uploadViaApi } from "@/lib/upload-api"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

interface UploadDatasetProps {
  walletAuth: WalletAuth
}

export const UploadDataset: React.FC<UploadDatasetProps> = ({ walletAuth }) => {
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [anchoring, setAnchoring] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [datasetTitle, setDatasetTitle] = useState("")
  const [datasetDescription, setDatasetDescription] = useState("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
    setResults([]) // Clear previous results
    setError("")
    setSuccess("")
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

    if (!walletAuth.getConnection()?.isConnected) {
      setError("Wallet not connected. Please connect your wallet first.")
      return
    }

    setUploading(true)
    setError("")
    setSuccess("")

    try {
      console.log("Starting upload process...")
      setSuccess("Uploading files to 0G Storage...")

      // Example direct call into your API. Adjust to your variables/state names.
      const results: Array<{ rootHash: string; txHash: string; filename: string; size: number }> = []
      for (const f of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", f, f.name) // Ensure key is 'file'
        fd.append("metadata", JSON.stringify({
          title: f.name,
          description: `Uploaded file: ${f.name}`,
          contributors: [walletAuth.getConnection()!.address],
          isPublic: true,
        }))

        // Debug: see exactly what you’re sending
        for (const [k, v] of fd.entries()) {
          console.log("FormData entry:", k, v instanceof File ? v.name : String(v));
        }

        const r = await fetch("/api/upload", {
          method: "POST",
          body: fd,
          headers: { "X-Wallet-Address": walletAuth.getConnection()!.address },
        })
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data?.success) {
          throw new Error(data?.message || `Upload failed (${r.status})`);
        }
        results.push(data);
      }

      const first = results[0];
      setResults(results)
      setSuccess(
        results.length === 1
          ? `Successfully uploaded file to 0G Storage! Root Hash: ${first.rootHash.slice(0, 6)}...${first.rootHash.slice(-4)}`
          : `Successfully uploaded ${results.length} files to 0G Storage!`
      )
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(`Upload failed: ${err?.message ?? err}`);
    } finally {
      setUploading(false);
    }
  }

  const handleAnchorToChain = async (rootHash: string, filename: string) => {
    if (!walletAuth.getConnection()?.isConnected) {
      setError("Wallet not connected for anchoring.")
      return
    }

    setAnchoring(true)
    setError("")

    try {
      console.log("Anchoring to 0G Chain...")
      setSuccess("Anchoring dataset to 0G Chain...")

      // Anchor to blockchain
      const anchorResult = await walletAuth.anchorDataset(
        datasetTitle.trim() || filename, // Use dataset title or filename as datasetId
        rootHash,
        { description: datasetDescription }
      )
      
      console.log("Anchor result:", anchorResult)
      
      // Update results with anchor info
      setResults(prev => prev.map(result => 
        result.rootHash === rootHash 
          ? { ...result, anchored: true, txHash: anchorResult.txHash }
          : result
      ))

      setSuccess(`Dataset "${filename}" successfully anchored to 0G Chain! Transaction: ${anchorResult.txHash.slice(0, 6)}...${anchorResult.txHash.slice(-4)}`)
      
    } catch (err: any) {
      console.error("Anchoring failed:", err)
      setError(`Anchoring failed: ${err.message}`)
    } finally {
      setAnchoring(false)
    }
  }

  const getExplorerUrl = (txHash: string) => {
    // Assuming 0G Chain Explorer URL structure
    return `https://chainscan-galileo.0g.ai/tx/${txHash}`
  }

  const connection = walletAuth.getConnection()
  const isConnected = connection?.isConnected || false
  const isOnOGNetwork = walletAuth.isOnOGNetwork()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-6 h-6" />
          Upload Dataset to 0G Network
        </CardTitle>
        <CardDescription>
          Upload your research datasets to 0G Storage and anchor them on 0G Chain for permanent verification
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Connection Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Wallet: {isConnected ? `Connected (${connection?.address.slice(0, 6)}...${connection?.address.slice(-4)})` : "Not connected"}</span>
            </div>
            <div className="flex items-center gap-2">
              {isOnOGNetwork ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span>Network: {isOnOGNetwork ? "0G Galileo Testnet" : "Wrong network"}</span>
            </div>
            <div className="flex items-center gap-2">
              {walletAuth.areServicesReady() ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span>0G Services: {walletAuth.areServicesReady() ? "Ready" : "Not initialized"}</span>
            </div>
          </div>
        </div>

        {/* Dataset Metadata */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Dataset Title *</Label>
            <Input
              id="title"
              value={datasetTitle}
              onChange={(e) => setDatasetTitle(e.target.value)}
              placeholder="Enter dataset title"
              disabled={uploading}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={datasetDescription}
              onChange={(e) => setDatasetDescription(e.target.value)}
              placeholder="Describe your dataset"
              disabled={uploading}
            />
          </div>
        </div>

        {/* File Selection */}
        <div>
          <Label htmlFor="files">Select Files *</Label>
          <Input
            id="files"
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
            className="cursor-pointer"
          />
          {files && (
            <p className="text-sm text-muted-foreground mt-2">
              Selected {files.length} file(s)
            </p>
          )}
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!isConnected || !isOnOGNetwork || !walletAuth.areServicesReady() || uploading || !files || !datasetTitle.trim()}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Uploading to 0G Storage...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload to 0G Storage
            </>
          )}
        </Button>

        {/* Status Messages */}
        {error && (
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 border border-green-200 bg-green-50 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Upload Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Upload Results</h3>
            {results.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.filename}</span>
                  <span className="text-sm text-muted-foreground">
                    {(result.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                
                {result.rootHash && (
                  <>
                    <div>
                      <Label className="text-xs">Root Hash</Label>
                      <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                        {result.rootHash}
                      </p>
                    </div>
                    
                    {result.txHash && (
                      <div>
                        <Label className="text-xs">Storage Transaction</Label>
                        <p className="text-sm font-mono bg-muted p-2 rounded">
                          {result.txHash}
                        </p>
                      </div>
                    )}

                    {!result.anchored && (
                      <Button
                        onClick={() => handleAnchorToChain(result.rootHash, result.filename)}
                        disabled={anchoring}
                        variant="outline"
                        size="sm"
                      >
                        {anchoring ? "Anchoring..." : "Anchor to 0G Chain"}
                      </Button>
                    )}

                    {result.anchored && result.txHash && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Anchored to 0G Chain</span>
                        <a
                          href={getExplorerUrl(result.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View on Explorer
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </>
                )}

                {!result.rootHash && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Upload failed</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}


