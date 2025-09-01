import React, { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Brain, Zap, CheckCircle, Copy, Download, AlertCircle } from '@/lib/icons';
import { computeClient, type ComputeRequest, type ComputeResponse, type ComputeHealthResponse } from '@/services/computeClient';

// Official 0G Compute Models
const COMPUTE_MODELS = {
  'llama-3.3-70b-instruct': {
    name: 'Llama 3.3 70B Instruct',
    type: 'chat',
    icon: Zap,
    description: 'Fast response for general tasks'
  },
  'deepseek-r1-70b': {
    name: 'DeepSeek R1 70B',
    type: 'reasoning',
    icon: Brain,
    description: 'Advanced reasoning and analysis'
  }
} as const;

interface AIWorkbenchProps {
  datasetRoot?: string;
  tokenId?: number;
  onComplete?: (result: any) => void;
}

interface AnalysisResult {
  content: string;
  model: string;
  provider: string;
  verified: boolean;
  usage?: any;
  timestamp: string;
  cost?: string;
}

const RESEARCH_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "string", "name": "jobId", "type": "string" },
      { "internalType": "string", "name": "jobType", "type": "string" },
      { "internalType": "string", "name": "inputDataRoot", "type": "string" }
    ],
    "name": "submitComputeJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "string", "name": "jobId", "type": "string" },
      { "internalType": "string", "name": "outputDataRoot", "type": "string" }
    ],
    "name": "completeComputeJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export function AIWorkbench({ datasetRoot, tokenId, onComplete }: AIWorkbenchProps) {
  const { isConnected, address } = useAppKitAccount();
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<keyof typeof COMPUTE_MODELS>('llama-3.3-70b-instruct');
  const [analysisType, setAnalysisType] = useState<string>('comprehensive');
  const [customPrompt, setCustomPrompt] = useState('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [progress, setProgress] = useState(0);
  const [health, setHealth] = useState<ComputeHealthResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('summarize');

  // Initialize contract and health check
  useEffect(() => {
    if (isConnected) {
      initializeServices();
    }
    checkHealth();
  }, [isConnected]);

  async function initializeServices() {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const researchContract = new ethers.Contract(
          import.meta.env.VITE_DARA_RESEARCH_CONTRACT || '0x1a8c31b7c93bDaC2951E1E80774e19679Ce4571d',
          RESEARCH_CONTRACT_ABI,
          signer
        );
        setContract(researchContract);
      }
    } catch (error) {
      console.error("Failed to initialize contract:", error);
    }
  }

  async function checkHealth() {
    try {
      const healthData = await computeClient.health();
      setHealth(healthData);
    } catch (error) {
      console.error("Health check failed:", error);
    }
  }

  // Analysis prompts for different research scenarios
  const analysisPrompts = {
    comprehensive: `Perform comprehensive research analysis${datasetRoot ? ` on dataset ${datasetRoot}` : ''}:

DATASET ANALYSIS:
1. Schema & Structure
   - Detect all data types and field structures
   - Identify primary/foreign key relationships
   - Analyze data distribution patterns
   
2. Quality Metrics
   - Calculate completeness score (0-100)
   - Identify anomalies and outliers
   - Detect data integrity issues
   
3. Research Opportunities
   - Generate 5 specific research questions
   - Suggest applicable ML/AI models
   - Identify potential cross-dataset linkages
   
4. Actionable Insights
   - Key patterns discovered
   - Recommended visualizations
   - Next steps for research

Format as structured JSON with keys: {schema, quality, opportunities, insights}`,

    aiModel: `Evaluate dataset${datasetRoot ? ` ${datasetRoot}` : ''} for AI/ML model development:

MODEL READINESS ASSESSMENT:
1. Feature Engineering
   - Identify high-value features
   - Suggest transformations and encodings
   - Detect multicollinearity issues
   
2. Model Recommendations
   - Classification vs regression suitability
   - Deep learning applicability
   - Ensemble method opportunities
   
3. Training Strategy
   - Optimal train/test/validation splits
   - Cross-validation approach
   - Handling imbalanced classes
   
4. Performance Predictions
   - Expected baseline accuracy
   - Computational requirements
   - Potential challenges

Return as JSON: {features, models, training, performance}`,

    privacy: `Conduct privacy and compliance analysis${datasetRoot ? ` on ${datasetRoot}` : ''}:

PRIVACY ASSESSMENT:
1. PII Detection
   - Identify sensitive fields
   - Risk score per attribute
   - De-identification requirements
   
2. Compliance Check
   - GDPR compliance gaps
   - CCPA requirements
   - Industry regulations (HIPAA, PCI-DSS)
   
3. Anonymization Strategy
   - K-anonymity recommendations
   - Differential privacy parameters
   - Synthetic data generation options
   
4. Sharing Guidelines
   - Safe publication methods
   - Access control requirements
   - Audit trail needs

Format as JSON: {pii, compliance, anonymization, guidelines}`,

    scientific: `Generate scientific research plan${datasetRoot ? ` for ${datasetRoot}` : ''}:

RESEARCH METHODOLOGY:
1. Hypothesis Formation
   - 5 testable hypotheses with null/alternative
   - Required sample sizes
   - Statistical power analysis
   
2. Experimental Design
   - Control variables identification
   - Randomization strategy
   - Replication requirements
   
3. Statistical Analysis
   - Appropriate tests selection
   - Multiple comparison corrections
   - Effect size calculations
   
4. Publication Readiness
   - Results interpretation framework
   - Visualization requirements
   - Reproducibility checklist

Return JSON: {hypotheses, design, statistics, publication}`,

    market: `Analyze business and market insights${datasetRoot ? ` from ${datasetRoot}` : ''}:

MARKET INTELLIGENCE:
1. Trend Analysis
   - Emerging patterns and signals
   - Seasonality detection
   - Growth trajectories
   
2. Competitive Insights
   - Market segmentation opportunities
   - Competitive advantages identified
   - Strategic recommendations
   
3. Risk Assessment
   - Market risks identified
   - Mitigation strategies
   - Scenario analysis
   
4. ROI Projections
   - Revenue opportunities
   - Cost optimization areas
   - Investment priorities

Format as JSON: {trends, insights, risks, roi}`,

    realtime: `Design real-time processing pipeline${datasetRoot ? ` for ${datasetRoot}` : ''}:

STREAMING ARCHITECTURE:
1. Ingestion Strategy
   - Optimal batch vs stream processing
   - Latency requirements
   - Throughput estimates
   
2. Processing Pipeline
   - Transformation stages
   - Aggregation windows
   - State management needs
   
3. Storage Design
   - Hot/warm/cold tier strategy
   - Indexing requirements
   - Retention policies
   
4. Monitoring Plan
   - Key metrics to track
   - Alert thresholds
   - Dashboard components

Return JSON: {ingestion, pipeline, storage, monitoring}`
  };

  async function runInference() {
    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    setLoading(true);
    setProgress(0);
    setStreamingContent('');
    setError('');
    
    try {
      const prompt = customPrompt || analysisPrompts[analysisType as keyof typeof analysisPrompts];
      
      // Add system prompt for better results
      const systemPrompt = `You are an advanced AI research analyst specializing in data science and machine learning. 
      Analyze the provided dataset comprehensively and return structured, actionable insights. 
      Always format responses as valid JSON when requested.`;
      
      const messages: ComputeRequest['messages'] = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      setProgress(25);

      const response = await computeClient.chat({
        model: selectedModel,
        messages,
        tokenId: tokenId?.toString(),
        datasetRef: datasetRoot
      });

      setProgress(75);
      
      // Try to parse JSON response
      let content = response.content;
      try {
        const parsed = JSON.parse(content);
        content = JSON.stringify(parsed, null, 2);
      } catch {
        // Keep as text if not JSON
      }
      
      const result: AnalysisResult = {
        content,
        model: response.model,
        provider: response.provider,
        verified: response.verified,
        usage: response.usage,
        cost: "~0.001 OG", // Approximate
        timestamp: new Date().toISOString()
      };
      
      setResults(result);
      
      // Record on blockchain if tokenId exists
      if (tokenId && contract && datasetRoot) {
        await recordAnalysisOnChain(result);
      }
      
      setProgress(100);
      
      // Refresh health status
      await checkHealth();
      
      if (onComplete) {
        onComplete(result);
      }
      
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setError(error.message || 'Analysis failed');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  async function recordAnalysisOnChain(result: AnalysisResult) {
    try {
      // First, store the analysis result to 0G Storage
      const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
      const file = new File([blob], `analysis-${tokenId}-${Date.now()}.json`);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });
      
      const uploadData = await uploadResponse.json();
      if (!uploadData.ok) throw new Error(uploadData.error);
      
      const outputRoot = uploadData.root;
      
      // Submit compute job to contract
      const jobId = `compute-${Date.now()}`;
      const tx1 = await contract.submitComputeJob(
        tokenId,
        jobId,
        analysisType,
        datasetRoot
      );
      await tx1.wait();
      
      // Complete compute job with output
      const tx2 = await contract.completeComputeJob(
        tokenId,
        jobId,
        outputRoot
      );
      await tx2.wait();
      
      console.log("Analysis recorded on-chain:", jobId);
    } catch (error) {
      console.error("Failed to record on-chain:", error);
    }
  }

  const copyToClipboard = () => {
    if (results?.content) {
      navigator.clipboard.writeText(results.content);
    }
  };

  const downloadResult = () => {
    if (results) {
      const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-analysis-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getProviderStatus = () => {
    if (!health) return { status: 'unknown', color: 'gray' };
    
    const healthyCount = health.providers.healthy;
    const totalCount = health.providers.total;
    
    if (healthyCount === totalCount) return { status: 'healthy', color: 'green' };
    if (healthyCount > 0) return { status: 'partial', color: 'yellow' };
    return { status: 'down', color: 'red' };
  };

  const providerStatus = getProviderStatus();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Workbench
            </CardTitle>
            <CardDescription className="flex items-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Providers: {health?.providers.healthy || 0}/{health?.providers.total || 0}</span>
                <Badge 
                  variant="outline" 
                  className={`text-${providerStatus.color}-700 border-${providerStatus.color}-300`}
                >
                  {providerStatus.status}
                </Badge>
              </div>
              {health?.ledger && (
                <>
                  <span>•</span>
                  <span>Balance: {health.ledger.availableBalance} {health.ledger.unit}</span>
                </>
              )}
              {datasetRoot && (
                <>
                  <span>•</span>
                  <span>Dataset: {datasetRoot.slice(0, 8)}...</span>
                </>
              )}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkHealth}
            className="flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summarize">Summarize</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>

          <TabsContent value="summarize" className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2">
                Custom Prompt
              </Label>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter your analysis prompt..."
                className="h-32"
                disabled={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="research" className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2">
                Analysis Type
              </Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {Object.keys(analysisPrompts).map((type) => (
                  <Button
                    key={type}
                    onClick={() => setAnalysisType(type)}
                    disabled={loading}
                    variant={analysisType === type ? "default" : "outline"}
                    className={analysisType === type ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Model Selection */}
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2">
            AI Model
          </Label>
          <Select value={selectedModel} onValueChange={(value: keyof typeof COMPUTE_MODELS) => setSelectedModel(value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMPUTE_MODELS).map(([key, model]) => {
                const Icon = model.icon;
                return (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-gray-500">{model.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Progress Bar */}
        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing with {COMPUTE_MODELS[selectedModel].name}...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Run Analysis Button */}
        <Button
          onClick={runInference}
          disabled={loading || !isConnected || providerStatus.status === 'down'}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Run AI Analysis'
          )}
        </Button>

        {/* Results Display */}
        {results && (
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-800">Analysis Results</CardTitle>
                <div className="flex items-center gap-2">
                  {results.verified && (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    {results.model}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={downloadResult}>
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {results.content}
                </pre>
              </div>

              {results.usage && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Tokens: {results.usage.total_tokens} 
                    ({results.usage.prompt_tokens} prompt + {results.usage.completion_tokens} completion)
                  </span>
                  <span>Cost: {results.cost}</span>
                </div>
              )}

              {tokenId && (
                <div className="mt-2 text-xs text-gray-500">
                  <a 
                    href={`https://chainscan-galileo.0g.ai/address/${import.meta.env.VITE_DARA_RESEARCH_CONTRACT}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View on-chain record →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

