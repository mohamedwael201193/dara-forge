import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Database, Loader2, Shield, Upload } from 'lucide-react';
import { useState } from 'react';

interface DAPublishProps {
  datasetId?: string;
  rootHash?: string;
  dataToPublish?: Uint8Array | string;
}

interface DAResult {
  blobHash: string;
  dataRoot: string;
  epoch: number;
  quorumId: number;
  verified: boolean;
  timestamp: string;
}

export function DAPublish({ datasetId, rootHash, dataToPublish }: DAPublishProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<DAResult | null>(null);

  const handlePublish = async () => {
    if (!dataToPublish) {
      setError('No data to publish to 0G DA');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🚀 Publishing to 0G DA...');

      // Convert data to base64
      let base64Data: string;
      if (typeof dataToPublish === 'string') {
        base64Data = Buffer.from(dataToPublish).toString('base64');
      } else {
        base64Data = Buffer.from(dataToPublish).toString('base64');
      }

      const response = await fetch('/api/da', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
          data: base64Data,
          metadata: {
            datasetId,
            rootHash
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      console.log('✅ Published to 0G DA');
      console.log('Blob hash:', data.blobHash);
      console.log('Data root:', data.dataRoot);

      setResult({
        blobHash: data.blobHash,
        dataRoot: data.dataRoot,
        epoch: data.epoch,
        quorumId: data.quorumId,
        verified: data.verified,
        timestamp: data.timestamp
      });

    } catch (err: any) {
      console.error('❌ 0G DA error:', err);
      setError(err.message || 'Failed to publish to 0G DA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!result?.blobHash) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/da', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify',
          blobHash: result.blobHash
        }),
      });

      const data = await response.json();

      if (data.ok && data.available) {
        alert('✅ Data is available on 0G DA network!');
      } else {
        alert('⚠️ Data availability could not be verified');
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          0G Data Availability
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Real 0G DA
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Publish research data to 0G's decentralized data availability layer for permanent accessibility
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {datasetId && (
          <div className="text-sm text-muted-foreground">
            Dataset ID: <code className="font-mono">{datasetId}</code>
          </div>
        )}

        {rootHash && (
          <div className="text-sm text-muted-foreground">
            Root Hash: <code className="font-mono text-xs">{rootHash}</code>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          onClick={handlePublish}
          disabled={loading || !dataToPublish}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Publishing to 0G DA...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Publish to 0G Data Availability
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Publication Result</h3>
              <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3" />
                Published
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Blob Hash:</span>
                <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">
                  {result.blobHash}
                </code>
              </div>

              <div>
                <span className="font-medium">Data Root:</span>
                <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">
                  {result.dataRoot}
                </code>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Epoch:</span> {result.epoch}
                </div>
                <div>
                  <span className="font-medium">Quorum ID:</span> {result.quorumId}
                </div>
              </div>

              <div>
                <span className="font-medium">Timestamp:</span> {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Verify Availability
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <div>• Maximum blob size: 32,505,852 bytes</div>
          <div>• Data is redundantly encoded across DA nodes</div>
          <div>• Permanent availability guaranteed by network consensus</div>
        </div>
      </CardContent>
    </Card>
  );
}


