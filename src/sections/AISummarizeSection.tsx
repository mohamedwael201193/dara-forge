import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Brain, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface AnalysisResult {
  answer: string;
  provider: string;
  model: string;
  verified: boolean;
  chatID: string;
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
        throw new Error(data.error || 'Analysis failed');
      }

      // Set the real result from 0G Compute
      setResult({
        answer: data.answer,
        provider: data.provider,
        model: data.model,
        verified: data.verified,
        chatID: data.chatID
      });

      console.log('0G Compute analysis successful:', {
        model: data.model,
        verified: data.verified,
        provider: data.provider
      });

    } catch (err: any) {
      console.error('0G Compute error:', err);
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
          <Badge variant="secondary">0G Compute</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Leverage verifiable compute for intelligent analysis of your research data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Enter your dataset description or paste research data to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px]"
            disabled={loading}
          />
        </div>

        {datasetRoot && (
          <div className="text-sm text-muted-foreground">
            Dataset Root: <code className="font-mono">{datasetRoot}</code>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing with 0G Compute...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Start Analysis
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Analysis Result</h3>
              {result.verified && (
                <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Verified by 0G
                </Badge>
              )}
            </div>
            
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{result.answer}</p>
            </div>

            <div className="text-xs text-muted-foreground space-y-1 pt-3 border-t">
              <div>Model: <span className="font-mono">{result.model}</span></div>
              <div>Provider: <span className="font-mono">{result.provider.slice(0, 10)}...{result.provider.slice(-8)}</span></div>
              <div>Chat ID: <span className="font-mono">{result.chatID}</span></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}