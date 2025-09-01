import React from 'react';
import { getUploadHistory, clearUploadHistory, type UploadRecord } from '@/lib/uploadHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Trash2, Download } from 'lucide-react';
import { gatewayUrlForRoot, downloadWithProofUrl } from '@/services/ogStorage';

export function UploadHistory() {
  const [history, setHistory] = React.useState<UploadRecord[]>([]);

  React.useEffect(() => {
    setHistory(getUploadHistory());
  }, []);

  const handleClear = () => {
    clearUploadHistory();
    setHistory([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No uploads yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upload History</CardTitle>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((record, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{record.fileName}</span>
                <Badge variant="outline">{formatFileSize(record.fileSize)}</Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {formatDate(record.timestamp)}
              </div>
              
              <div className="text-xs font-mono bg-muted p-2 rounded">
                Root: {record.rootHash.slice(0, 20)}...
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(gatewayUrlForRoot(record.rootHash), '_blank')}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(downloadWithProofUrl(record.rootHash), '_blank')}
                >
                  <Download className="h-3 w-3 mr-1" />
                  With Proof
                </Button>
                
                {record.explorer && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(record.explorer, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Explorer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

