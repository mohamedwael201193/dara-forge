import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Brain, CheckCircle, Loader2, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AnalysisResult {
  answer: string;
  provider: string;
  model: string;
  verified: boolean;
  chatID: string;
  timestamp: string;
}

export function AISummarizeSection({ datasetRoot }: { datasetRoot?: string }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please enter text to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🚀 Calling real 0G Compute API...');
      
      const response = await fetch('/api/compute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          datasetRoot: datasetRoot
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      console.log('✅ Real 0G Compute response received');
      console.log('Provider:', data.provider);
      console.log('Model:', data.model);
      console.log('Verified:', data.verified);
      
      setResult({
        answer: data.answer,
        provider: data.provider,
        model: data.model,
        verified: data.verified,
        chatID: data.chatID,
        timestamp: data.timestamp
      });

    } catch (err: any) {
      console.error('❌ 0G Compute error:', err);
      setError(err.message || 'Failed to analyze with 0G Compute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" />
          AI-Powered Dataset Analysis
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            Real 0G Compute
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Verifiable AI analysis powered by the 0G decentralized compute network
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Enter your dataset description or research data to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px]"
            disabled={loading}
          />
        </div>

        {datasetRoot && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted rounded">
            <code className="font-mono text-xs">{datasetRoot}</code>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing with 0G Compute Network...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Start AI Analysis
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Analysis Result</h3>
              <div className="flex gap-2">
                {result.verified ? (
                  <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
                    <CheckCircle className="w-3 h-3" />
                    Verified by 0G
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.answer}</p>
            </div>

            <div className="text-xs text-muted-foreground space-y-1.5 pt-3 border-t">
              <div className="flex items-center gap-2">
                <span className="font-medium">Model:</span>
                <code className="px-2 py-0.5 bg-muted rounded">{result.model}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Provider:</span>
                <code className="px-2 py-0.5 bg-muted rounded text-xs">
                  {result.provider.slice(0, 6)}...{result.provider.slice(-4)}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Chat ID:</span>
                <code className="px-2 py-0.5 bg-muted rounded text-xs">{result.chatID}</code>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}