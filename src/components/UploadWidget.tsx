import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOgUpload } from "@/hooks/useOgUpload";
import { AlertCircle, CheckCircle, Download, ExternalLink, Loader2, Upload } from "@/lib/icons";
import React from "react";

export function UploadWidget({ onUploaded }: { onUploaded?: (root: string, meta?: any) => void }) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [status, setStatus] = React.useState<string>("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [root, setRoot] = React.useState<string>("");
  const [gatewayUrl, setGatewayUrl] = React.useState<string>("");
  const [proofUrl, setProofUrl] = React.useState<string>("");
  const [verified, setVerified] = React.useState<boolean | null>(null);

  const { uploadFiles } = useOgUpload();

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files ? Array.from(e.target.files) : [];
    setFiles(f);
    // Reset previous results
    setRoot("");
    setGatewayUrl("");
    setProofUrl("");
    setVerified(null);
    setStatus("");
  }

  async function handleUpload() {
    if (!files.length) return;
    
    setIsUploading(true);
    setStatus("Uploading to 0G Storage...");
    
    try {
      const out = await uploadFiles(files);
      
      if (!out.ok || !out.root) {
        setStatus(`Upload failed: ${out.error || "unknown error"}`);
        return;
      }

      setRoot(out.root);
      setGatewayUrl(out.gatewayUrl || "");
      setProofUrl(out.proofUrl || "");
      setStatus("Upload completed successfully!");
      setVerified(true); // Assume successful upload means verified

      // Notify parent component
      onUploaded?.(out.root, out);
    } catch (error: any) {
      setStatus(`Error: ${error.message || "Upload failed"}`);
    } finally {
      setIsUploading(false);
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          0G Storage Upload
        </CardTitle>
        <CardDescription>
          Upload files to decentralized 0G Storage network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <input 
            type="file" 
            multiple 
            onChange={onFileChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          
          {files.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {files.length} file{files.length > 1 ? 's' : ''} selected ({formatFileSize(totalSize)})
              {files.length > 1 && <Badge variant="secondary" className="ml-2">Batch Upload</Badge>}
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {files.map((file, i) => (
              <div key={i} className="flex justify-between items-center text-sm bg-muted p-2 rounded">
                <span className="truncate">{file.name}</span>
                <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <Button 
          className="w-full" 
          disabled={!files.length || isUploading} 
          onClick={handleUpload}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload to 0G Storage
            </>
          )}
        </Button>

        {/* Status */}
        {status && (
          <div className="flex items-center gap-2 text-sm">
            {verified === true && <CheckCircle className="h-4 w-4 text-green-500" />}
            {verified === false && <AlertCircle className="h-4 w-4 text-yellow-500" />}
            {verified === null && isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span className={verified === true ? "text-green-600" : verified === false ? "text-yellow-600" : ""}>{status}</span>
          </div>
        )}

        {/* Results */}
        {root && (
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Successfully uploaded to 0G Storage</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Merkle Root:</span>
                <div className="font-mono bg-background p-2 rounded mt-1 break-all text-xs">
                  {root}
                </div>
              </div>

              <div className="flex gap-2">
                {gatewayUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={gatewayUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </a>
                  </Button>
                )}
                
                {proofUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Download with Proof
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}