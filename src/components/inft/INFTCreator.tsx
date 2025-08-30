import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { Sparkles, Brain, Zap, Eye, MessageSquare, TrendingUp, CheckCircle, Clock, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { inftService, INFTStatus, INFTCreationRequest } from '../../services/inft';
import { requireEthersSigner } from '@/lib/ethersClient';
import { ResearchStatus } from '../../contracts/DaraResearch';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface INFTCreatorProps {
  tokenId: number;
  datasetName: string;
  datasetRoot: string;
  currentStatus: ResearchStatus;
  computeJobId?: string;
  daCommitment?: string;
  analysisResults?: any;
  onINFTCreated: (inftId: string) => void;
}

export const INFTCreator: React.FC<INFTCreatorProps> = ({
  tokenId,
  datasetName,
  datasetRoot,
  currentStatus,
  computeJobId,
  daCommitment,
  analysisResults,
  onINFTCreated
}) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [inftStatuses, setInftStatuses] = useState<Map<string, INFTStatus>>(new Map());
  const [activeINFT, setActiveINFT] = useState<string | null>(null);
  const [interactionQuery, setInteractionQuery] = useState('');
  const [interactionResult, setInteractionResult] = useState<any>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const aiModels = inftService.getAvailableAIModels();
  const allCapabilities = Array.from(new Set(aiModels.flatMap(model => model.capabilities)));

  const getModelIcon = (modelId: string) => {
    switch (modelId) {
      case 'gpt-4-research': return <Brain className="w-4 h-4" />;
      case 'claude-3-analyst': return <TrendingUp className="w-4 h-4" />;
      case 'llama-2-scientific': return <Sparkles className="w-4 h-4" />;
      case 'custom-research-model': return <Zap className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'creating': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'training': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'minting': return <Sparkles className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      creating: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'Creating' },
      training: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', text: 'Training' },
      minting: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', text: 'Minting' },
      completed: { color: 'bg-green-500/20 text-green-300 border-green-500/30', text: 'Completed' },
      failed: { color: 'bg-red-500/20 text-red-300 border-red-500/30', text: 'Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.creating;
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const handleCapabilityToggle = (capability: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(capability)
        ? prev.filter(c => c !== capability)
        : [...prev, capability]
    );
  };

  const handleCreateINFT = async () => {
    if (!name.trim() || !selectedModel || selectedCapabilities.length === 0 || !walletClient || !address) {
      alert('Please fill in all required fields and connect your wallet');
      return;
    }

    setIsCreating(true);
    try {
      const request: INFTCreationRequest = {
        tokenId,
        name: name.trim(),
        description: description.trim() || `Intelligent NFT created from ${datasetName}`,
        imageUrl: imageUrl.trim() || undefined,
        aiModel: selectedModel,
        capabilities: selectedCapabilities,
        trainingDataRoot: datasetRoot,
        analysisResults,
        computeJobId,
        daCommitment
      };

      const inftId = await inftService.createINFT(request, await requireEthersSigner());

      // Start monitoring the INFT creation
      const cleanup = inftService.monitorINFTCreation(inftId, (status) => {
        setInftStatuses(prev => new Map(prev.set(inftId, status)));
        
        if (status.status === 'completed') {
          setActiveINFT(inftId);
        }
      });

      // Store cleanup function for later use
      (window as any)[`cleanup_inft_${inftId}`] = cleanup;

      // Reset form
      setName('');
      setDescription('');
      setSelectedModel('');
      setSelectedCapabilities([]);
      setImageUrl('');
      
      onINFTCreated(inftId);
    } catch (error) {
      console.error('Error creating INFT:', error);
      alert('Failed to create INFT. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInteractWithINFT = async () => {
    if (!activeINFT || !interactionQuery.trim()) {
      alert('Please select an INFT and enter a query');
      return;
    }

    setIsInteracting(true);
    try {
      const result = await inftService.interactWithINFT(activeINFT, interactionQuery.trim());
      setInteractionResult(result);
      setInteractionQuery('');
    } catch (error) {
      console.error('Error interacting with INFT:', error);
      alert('Failed to interact with INFT. Please try again.');
    } finally {
      setIsInteracting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Cleanup monitoring on unmount
  useEffect(() => {
    return () => {
      inftStatuses.forEach((_, inftId) => {
        const cleanup = (window as any)[`cleanup_inft_${inftId}`];
        if (cleanup) cleanup();
      });
    };
  }, []);

  const canCreateINFT = currentStatus === ResearchStatus.Published && address;

  return (
    <div className="space-y-6">
      {/* INFT Creation Form */}
      {canCreateINFT && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-pink-400" />
              Create Intelligent NFT
            </CardTitle>
            <CardDescription className="text-slate-300">
              Transform your research into an intelligent, interactive NFT with AI capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inft-name" className="text-white">INFT Name *</Label>
                  <Input
                    id="inft-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter INFT name"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    disabled={isCreating}
                  />
                </div>
                
                <div>
                  <Label htmlFor="inft-description" className="text-white">Description</Label>
                  <Textarea
                    id="inft-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your intelligent NFT"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-24"
                    disabled={isCreating}
                  />
                </div>

                <div>
                  <Label htmlFor="inft-image" className="text-white">Image URL (Optional)</Label>
                  <Input
                    id="inft-image"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-white">AI Model *</Label>
                  <div className="space-y-2 mt-2">
                    {aiModels.map((model) => (
                      <div
                        key={model.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedModel === model.id
                            ? 'border-pink-500 bg-pink-500/10'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                        }`}
                        onClick={() => !isCreating && setSelectedModel(model.id)}
                      >
                        <div className="flex items-center gap-2">
                          {getModelIcon(model.id)}
                          <div>
                            <h4 className="font-medium text-white text-sm">{model.name}</h4>
                            <p className="text-xs text-slate-400">{model.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white">AI Capabilities * (Select at least one)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {allCapabilities.map((capability) => (
                  <button
                    key={capability}
                    onClick={() => !isCreating && handleCapabilityToggle(capability)}
                    disabled={isCreating}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      selectedCapabilities.includes(capability)
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {capability.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateINFT}
              disabled={!name.trim() || !selectedModel || selectedCapabilities.length === 0 || isCreating}
              className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating INFT...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Intelligent NFT
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* INFT Status */}
      {inftStatuses.size > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="w-5 h-5 text-purple-400" />
              Your Intelligent NFTs
            </CardTitle>
            <CardDescription className="text-slate-300">
              Monitor creation progress and interact with your INFTs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(inftStatuses.entries()).map(([inftId, status]) => (
                <div key={inftId} className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-pink-400" />
                      <span className="font-medium text-white">INFT {inftId.slice(-8)}</span>
                      {getStatusIcon(status.status)}
                      <span className="text-sm text-slate-300 capitalize">{status.status}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(status.status)}
                      {status.status === 'completed' && (
                        <Button
                          onClick={() => setActiveINFT(activeINFT === inftId ? null : inftId)}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          {activeINFT === inftId ? 'Hide' : 'Interact'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {status.status !== 'completed' && status.status !== 'failed' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Progress</span>
                        <span className="text-slate-300">{status.progress}%</span>
                      </div>
                      <Progress value={status.progress} className="h-2 bg-slate-700" />
                    </div>
                  )}

                  {/* INFT Details */}
                  <div className="text-sm text-slate-400 mt-2">
                    INFT ID: 
                    <code className="ml-2 text-pink-400 bg-slate-900 px-2 py-1 rounded text-xs">
                      {inftId.slice(0, 20)}...
                    </code>
                    <Button
                      onClick={() => copyToClipboard(inftId)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2 hover:bg-slate-600"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                    </Button>
                  </div>

                  {status.transactionHash && (
                    <div className="text-sm text-slate-400 mt-1">
                      Transaction: 
                      <code className="ml-2 text-green-400 bg-slate-900 px-2 py-1 rounded text-xs">
                        {status.transactionHash.slice(0, 20)}...
                      </code>
                      <Button
                        onClick={() => copyToClipboard(status.transactionHash!)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2 hover:bg-slate-600"
                      >
                        <Copy className="w-3 h-3 text-slate-400" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* INFT Interaction */}
      {activeINFT && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              Interact with INFT
            </CardTitle>
            <CardDescription className="text-slate-300">
              Query your intelligent NFT and get AI-powered insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={interactionQuery}
                onChange={(e) => setInteractionQuery(e.target.value)}
                placeholder="Ask your INFT anything... (e.g., 'analyze the data', 'summarize findings', 'predict trends')"
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                disabled={isInteracting}
                onKeyPress={(e) => e.key === 'Enter' && handleInteractWithINFT()}
              />
              <Button
                onClick={handleInteractWithINFT}
                disabled={!interactionQuery.trim() || isInteracting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isInteracting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Interaction Result */}
            {interactionResult && (
              <div className="p-4 bg-slate-700/50 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">INFT Response</span>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    Confidence: {Math.round((interactionResult.confidence || 0.9) * 100)}%
                  </Badge>
                </div>
                
                <p className="text-slate-300">{interactionResult.response}</p>
                
                {interactionResult.insights && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Key Insights:</h4>
                    <ul className="space-y-1">
                      {interactionResult.insights.map((insight: string, index: number) => (
                        <li key={index} className="text-sm text-slate-400 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {interactionResult.predictions && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Predictions:</h4>
                    <div className="space-y-2">
                      {interactionResult.predictions.map((pred: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">{pred.period}:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{pred.value}x</span>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                              {Math.round(pred.confidence * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Message */}
      {!canCreateINFT && (
        <Card className="bg-yellow-900/20 border-yellow-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300">
                {!address ? 'Connect your wallet to create Intelligent NFTs' : 
                 'Publish your research to Data Availability before creating INFTs'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

