import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { checkHealth, type HealthCheckResult } from '@/lib/0gHealthCheck';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export function HealthStatus() {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const result = await checkHealth();
        setHealth(result);
      } catch (error) {
        console.error('Health check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Checking network health...</p>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="destructive">Health check failed</Badge>
        </CardContent>
      </Card>
    );
  }

  const allRpcHealthy = health.rpc.every(rpc => rpc.ok);
  const galileoRpc = health.rpc.find(rpc => rpc.chainId === 16602);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allRpcHealthy ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
          Network Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium mb-1">0G Galileo (Chain ID: 16602)</p>
          {galileoRpc ? (
            <div className="flex items-center gap-2">
              <Badge variant={galileoRpc.ok ? "default" : "destructive"}>
                {galileoRpc.ok ? "Connected" : "Disconnected"}
              </Badge>
              {galileoRpc.block && (
                <span className="text-xs text-muted-foreground">
                  Block: {galileoRpc.block}
                </span>
              )}
            </div>
          ) : (
            <Badge variant="destructive">No Galileo RPC found</Badge>
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium mb-1">Storage Indexers</p>
          <div className="flex flex-wrap gap-1">
            {health.indexers.map((indexer, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {indexer.url.includes('standard') ? 'Standard' : 'Turbo'}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

