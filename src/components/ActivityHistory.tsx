import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDataStore } from '@/store/dataStore';
import {
    Activity,
    Brain,
    CheckCircle,
    Clock,
    Database,
    ExternalLink,
    Hash,
    Shield,
    Trash2
} from 'lucide-react';
import { useMemo } from 'react';

export function ActivityHistory() {
  const { 
    uploadedDatasets,
    daPublications,
    computeResults,
    chainAnchors,
    clearAllData
  } = useDataStore();

  // Combined activity feed sorted by timestamp
  const activityFeed = useMemo(() => {
    const activities = [
      ...uploadedDatasets.map(item => ({
        type: 'upload' as const,
        id: item.datasetId,
        timestamp: item.uploadTime,
        data: item
      })),
      ...daPublications.map(item => ({
        type: 'da' as const,
        id: item.blobHash,
        timestamp: item.timestamp,
        data: item
      })),
      ...computeResults.map(item => ({
        type: 'compute' as const,
        id: item.chatID,
        timestamp: item.timestamp,
        data: item
      })),
      ...chainAnchors.map(item => ({
        type: 'anchor' as const,
        id: item.txHash,
        timestamp: item.timestamp,
        data: item
      }))
    ];

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [uploadedDatasets, daPublications, computeResults, chainAnchors]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateHash = (hash: string, length = 12) => {
    return `${hash.slice(0, length)}...${hash.slice(-4)}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return <Database className="w-4 h-4" />;
      case 'da': return <Shield className="w-4 h-4" />;
      case 'compute': return <Brain className="w-4 h-4" />;
      case 'anchor': return <Hash className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'upload': return 'text-blue-500';
      case 'da': return 'text-orange-500';
      case 'compute': return 'text-green-500';
      case 'anchor': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const openExplorer = (txHash: string) => {
    const explorerUrl = `https://chainscan-newton.0g.ai/tx/${txHash}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Session Activity
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAllData}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Track your uploads, DA publications, AI analyses, and blockchain transactions
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              All ({activityFeed.length})
            </TabsTrigger>
            <TabsTrigger value="uploads" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Storage ({uploadedDatasets.length})
            </TabsTrigger>
            <TabsTrigger value="da" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              DA ({daPublications.length})
            </TabsTrigger>
            <TabsTrigger value="compute" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI ({computeResults.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Combined activity feed • Most recent first
            </div>
            {activityFeed.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No activity yet</p>
                <p className="text-xs">Start by uploading a dataset</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityFeed.map((activity, index) => (
                  <div 
                    key={`${activity.type}-${activity.id}-${index}`}
                    className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg border"
                  >
                    <div className={`mt-0.5 ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm capitalize">{activity.type}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.type === 'upload' && 'Storage'}
                          {activity.type === 'da' && 'Data Availability'}
                          {activity.type === 'compute' && 'AI Analysis'}
                          {activity.type === 'anchor' && 'Blockchain'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {activity.type === 'upload' && (
                          <>
                            <div>File: <code className="text-xs">{activity.data.fileName}</code></div>
                            <div>Root: <code className="text-xs">{truncateHash(activity.data.rootHash)}</code></div>
                          </>
                        )}
                        {activity.type === 'da' && (
                          <>
                            <div>Blob: <code className="text-xs">{truncateHash(activity.data.blobHash)}</code></div>
                            <div>Epoch: {activity.data.epoch} • Quorum: {activity.data.quorumId}</div>
                          </>
                        )}
                        {activity.type === 'compute' && (
                          <>
                            <div>Model: <code className="text-xs">{activity.data.model}</code></div>
                            <div>Provider: <code className="text-xs">{truncateHash(activity.data.provider, 8)}</code></div>
                          </>
                        )}
                        {activity.type === 'anchor' && (
                          <>
                            <div>Root: <code className="text-xs">{truncateHash(activity.data.rootHash)}</code></div>
                          </>
                        )}
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {(activity.type === 'da' && activity.data.verified) && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {(activity.type === 'compute' && activity.data.verified) && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {(activity.type === 'da' || activity.type === 'anchor') && 'txHash' in activity.data && activity.data.txHash && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openExplorer(activity.data.txHash!)}
                          className="h-6 px-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="uploads" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Uploaded datasets • Stored on 0G Storage Network
            </div>
            {uploadedDatasets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No uploads yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedDatasets.map((upload) => (
                  <div key={upload.datasetId} className="p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{upload.fileName}</h4>
                        <div className="text-sm text-muted-foreground">
                          {(upload.fileSize / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      <Badge variant="outline">Storage</Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Root: <code>{upload.rootHash}</code></div>
                      <div>Dataset ID: <code>{upload.datasetId}</code></div>
                      <div>Uploaded: {formatTimestamp(upload.uploadTime)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="da" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              Data Availability publications • Permanently accessible
            </div>
            {daPublications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No DA publications yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {daPublications.map((da) => (
                  <div key={da.blobHash} className="p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">DA Publication</h4>
                        <div className="text-sm text-muted-foreground">
                          Epoch {da.epoch} • Quorum {da.quorumId}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {da.verified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge variant="outline">DA Layer</Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Blob Hash: <code>{da.blobHash}</code></div>
                      <div>Data Root: <code>{da.dataRoot}</code></div>
                      <div>Published: {formatTimestamp(da.timestamp)}</div>
                      {da.txHash && (
                        <div className="flex items-center gap-2">
                          <span>Transaction:</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openExplorer(da.txHash!)}
                            className="h-5 px-2 text-xs"
                          >
                            {truncateHash(da.txHash)}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="compute" className="space-y-4 mt-4">
            <div className="text-sm text-muted-foreground mb-4">
              AI Analysis results • Powered by 0G Compute Network
            </div>
            {computeResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No AI analyses yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {computeResults.map((result) => (
                  <div key={result.chatID} className="p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">AI Analysis</h4>
                        <div className="text-sm text-muted-foreground">
                          {result.model} • {truncateHash(result.provider, 8)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {result.verified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                        <Badge variant="outline">AI Compute</Badge>
                      </div>
                    </div>
                    <div className="mb-3 p-3 bg-background rounded text-sm max-h-32 overflow-y-auto">
                      <p className="whitespace-pre-wrap">{result.answer.substring(0, 300)}{result.answer.length > 300 ? '...' : ''}</p>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div>Chat ID: <code>{result.chatID}</code></div>
                      {result.input && (
                        <div>Input: <span className="italic">"{result.input.substring(0, 50)}{result.input.length > 50 ? '...' : ''}"</span></div>
                      )}
                      <div>Analyzed: {formatTimestamp(result.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}