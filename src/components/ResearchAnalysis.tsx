import React, { useState, useEffect } from 'react';
import { ogComputeService, COMPUTE_PROVIDERS, ComputeResult } from '@/services/ogCompute';
import { useAppKitAccount } from '@reown/appkit/react';
import { ethers } from 'ethers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Zap, CheckCircle } from '@/lib/icons';

interface ResearchAnalysisProps {
  datasetRoot: string;
  tokenId?: number;
  onComplete?: (result: any) => void;
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

export function ResearchAnalysis({ datasetRoot, tokenId, onComplete }: ResearchAnalysisProps) {
  const { isConnected, address } = useAppKitAccount();
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(COMPUTE_PROVIDERS.llama.address);
  const [analysisType, setAnalysisType] = useState<string>('comprehensive');
  const [customPrompt, setCustomPrompt] = useState('');
  const [results, setResults] = useState<ComputeResult | null>(null);
  const [ledgerBalance, setLedgerBalance] = useState('0');
  const [contract, setContract] = useState<any>(null);

  // Initialize service and contract
  useEffect(() => {
    if (isConnected) {
      initializeServices();
    }
  }, [isConnected]);

  async function initializeServices() {
    try {
      // Initialize compute service
      await ogComputeService.initialize();
      const balance = await ogComputeService.getLedgerBalance();
      setLedgerBalance(balance);
      
      // Initialize contract
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
      console.error("Failed to initialize:", error);
    }
  }

  // Analysis prompts for different research scenarios
  const analysisPrompts = {
    comprehensive: `Perform comprehensive research analysis on dataset ${datasetRoot}:

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

    aiModel: `Evaluate dataset ${datasetRoot} for AI/ML model development:

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

    privacy: `Conduct privacy and compliance analysis on ${datasetRoot}:

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

    scientific: `Generate scientific research plan for ${datasetRoot}:

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

    market: `Analyze business and market insights from ${datasetRoot}:

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

    realtime: `Design real-time processing pipeline for ${datasetRoot}:

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

  async function runAnalysis() {
    if (!isConnected) {
      alert("Please connect your wallet");
      return;
    }

    setLoading(true);
    try {
      const prompt = customPrompt || analysisPrompts[analysisType as keyof typeof analysisPrompts];
      
      // Add system prompt for better results
      const systemPrompt = `You are an advanced AI research analyst specializing in data science and machine learning. 
      Analyze the provided dataset comprehensively and return structured, actionable insights. 
      Always format responses as valid JSON when requested.`;
      
      const result = await ogComputeService.runInference(
        selectedProvider,
        prompt,
        {
          temperature: 0.3,
          maxTokens: 3000,
          systemPrompt
        }
      );
      
      setResults(result);
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(result.answer);
        result.answer = JSON.stringify(parsed, null, 2);
      } catch {
        // Keep as text if not JSON
      }
      
      // Record on blockchain if tokenId exists
      if (tokenId && contract) {
        await recordAnalysisOnChain(result);
      }
      
      // Update ledger balance
      const newBalance = await ogComputeService.getLedgerBalance();
      setLedgerBalance(newBalance);
      
      if (onComplete) {
        onComplete(result);
      }
      
    } catch (error: any) {
      console.error("Analysis failed:", error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function recordAnalysisOnChain(result: ComputeResult) {
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
      const jobId = `compute-${result.chatId}`;
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

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          0G AI Research Analysis
        </CardTitle>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span>Ledger Balance: {ledgerBalance} OG</span>
          <span>•</span>
          <span>Dataset: {datasetRoot.slice(0, 8)}...</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2">
            Select AI Model
          </Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            {Object.entries(COMPUTE_PROVIDERS).map(([key, provider]) => (
              <Button
                key={provider.address}
                onClick={() => setSelectedProvider(provider.address)}
                variant={selectedProvider === provider.address ? "default" : "outline"}
                className={`p-4 h-auto flex-col ${
                  selectedProvider === provider.address
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'hover:bg-purple-50'
                }`}
              >
                <div className="font-semibold">{provider.name}</div>
                <div className="text-xs mt-1 flex items-center gap-1">
                  {provider.type === 'reasoning' ? <Brain className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                  {provider.type === 'reasoning' ? 'Advanced Reasoning' : 'Fast Response'}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Analysis Type Selection */}
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

        {/* Custom Prompt */}
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2">
            Custom Prompt (Optional)
          </Label>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter your custom analysis prompt..."
            className="h-32"
            disabled={loading}
          />
        </div>

        {/* Run Analysis Button */}
        <Button
          onClick={runAnalysis}
          disabled={loading || !isConnected}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing with {selectedProvider === COMPUTE_PROVIDERS.llama.address ? 'Llama 3.3' : 'DeepSeek R1'}...
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
            </CardHeader>

            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {results.answer}
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
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

