import React, { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { FileText, Globe, Shield, CheckCircle, Clock, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { ogDAService, DAPublicationStatus, DAPublicationResult } from '../../services/ogDA';
import { requireEthersSigner } from '@/lib/ethersClient';
import { ResearchStatus } from '../../contracts/DaraResearch';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

interface DAPublisherProps {
  tokenId: number;
  datasetName: string;
  currentStatus: ResearchStatus;
  onPublished: (commitment: string) => void;
}

export const DAPublisher: React.FC<DAPublisherProps> = ({
  tokenId,
  datasetName,
  currentStatus,
  onPublished
}) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [title, setTitle] = useState('');
  const [publicationType, setPublicationType] = useState('');
  const [content, setContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publications, setPublications] = useState<Map<string, DAPublicationStatus>>(new Map());
  const [publicationResults, setPublicationResults] = useState<Map<string, any>>(new Map());
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const publicationTypes = ogDAService.getAvailablePublicationTypes();

  const getPublicationTypeIcon = (type: string) => {
    switch (type) {
      case 'paper': return <FileText className="w-4 h-4" />;
      case 'dataset': return <Globe className="w-4 h-4" />;
      case 'analysis': return <Shield className="w-4 h-4" />;
      case 'report': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'submitted': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'confirmed': return <Shield className="w-4 h-4 text-purple-500" />;
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', text: 'Pending' },
      submitted: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', text: 'Submitted' },
      confirmed: { color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', text: 'Confirmed' },
      verified: { color: 'bg-green-500/20 text-green-300 border-green-500/30', text: 'Verified' },
      failed: { color: 'bg-red-500/20 text-red-300 border-red-500/30', text: 'Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const handlePublish = async () => {
    if (!title.trim() || !publicationType || !content.trim() || !walletClient || !address) {
      alert('Please fill in all required fields and connect your wallet');
      return;
    }

    setIsPublishing(true);
    try {
      const commitment = await ogDAService.publishToDA({
        tokenId,
        title: title.trim(),
        publicationType,
        content: content.trim(),
        metadata: {
          datasetName,
          author: address,
          publishedAt: new Date().toISOString()
        }
      }, await requireEthersSigner());

      // Start monitoring the publication
      const cleanup = ogDAService.monitorPublicationStatus(commitment, (status) => {
        setPublications(prev => new Map(prev.set(commitment, status)));
        
        if (status.status === 'verified') {
          handlePublicationVerified(commitment);
        }
      });

      // Store cleanup function for later use
      (window as any)[`cleanup_da_${commitment}`] = cleanup;

      // Reset form
      setTitle('');
      setContent('');
      setPublicationType('');
      
      onPublished(commitment);
    } catch (error) {
      console.error('Error publishing to DA:', error);
      alert('Failed to publish to Data Availability. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublicationVerified = async (commitment: string) => {
    try {
      // Fetch publication data and proof
      const [data, proof] = await Promise.all([
        ogDAService.getPublicationData(commitment),
        ogDAService.getDAProof(commitment)
      ]);

      setPublicationResults(prev => new Map(prev.set(commitment, {
        data,
        proof,
        explorerUrl: `${import.meta.env.VITE_OG_DA_ENDPOINT}/explorer/publication/${commitment}`,
        proofUrl: `${import.meta.env.VITE_OG_DA_ENDPOINT}/api/v1/publications/${commitment}/proof`
      })));
    } catch (error) {
      console.error('Error fetching publication results:', error);
    }
  };

  const handleViewDetails = (commitment: string) => {
    setShowDetails(showDetails === commitment ? null : commitment);
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
      publications.forEach((_, commitment) => {
        const cleanup = (window as any)[`cleanup_da_${commitment}`];
        if (cleanup) cleanup();
      });
    };
  }, []);

  const canPublish = currentStatus === ResearchStatus.Analyzed && address;

  return (
    <div className="space-y-6">
      {/* Publication Form */}
      {canPublish && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="w-5 h-5 text-green-400" />
              Publish to 0G Data Availability
            </CardTitle>
            <CardDescription className="text-slate-300">
              Publish your research with cryptographic proofs and decentralized availability
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title" className="text-white">Publication Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter publication title"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  disabled={isPublishing}
                />
              </div>
              
              <div>
                <Label htmlFor="type" className="text-white">Publication Type *</Label>
                <select
                  id="type"
                  value={publicationType}
                  onChange={(e) => setPublicationType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isPublishing}
                >
                  <option value="">Select publication type...</option>
                  {publicationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="content" className="text-white">Publication Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your research content, findings, or abstract..."
                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 h-32"
                disabled={isPublishing}
              />
            </div>

            <Button
              onClick={handlePublish}
              disabled={!title.trim() || !publicationType || !content.trim() || isPublishing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publishing to DA...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Publish to Data Availability
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Publications */}
      {publications.size > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-purple-400" />
              DA Publications
            </CardTitle>
            <CardDescription className="text-slate-300">
              Monitor your publications on 0G Data Availability Network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(publications.entries()).map(([commitment, status]) => (
                <div key={commitment} className="border border-slate-600 rounded-lg p-4 bg-slate-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getPublicationTypeIcon(commitment.split('_')[0])}
                      <span className="font-medium text-white">Publication {commitment.slice(-8)}</span>
                      {getStatusIcon(status.status)}
                      <span className="text-sm text-slate-300 capitalize">{status.status}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(status.status)}
                      {status.status === 'verified' && publicationResults.has(commitment) && (
                        <Button
                          onClick={() => handleViewDetails(commitment)}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          {showDetails === commitment ? 'Hide Details' : 'View Details'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-slate-400 mb-2">
                    Commitment: 
                    <code className="ml-2 text-green-400 bg-slate-900 px-2 py-1 rounded text-xs">
                      {commitment.slice(0, 20)}...
                    </code>
                    <Button
                      onClick={() => copyToClipboard(commitment)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2 hover:bg-slate-600"
                    >
                      <Copy className="w-3 h-3 text-slate-400" />
                    </Button>
                  </div>

                  {status.height && (
                    <div className="text-sm text-slate-400">
                      DA Height: <span className="text-purple-400">{status.height}</span>
                    </div>
                  )}

                  {/* Publication Details */}
                  {showDetails === commitment && publicationResults.has(commitment) && (
                    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg space-y-3">
                      <h4 className="font-medium text-white">Publication Details</h4>
                      {(() => {
                        const result = publicationResults.get(commitment)!;
                        return (
                          <div className="space-y-3">
                            <div>
                              <h5 className="text-sm font-medium text-slate-300">Data</h5>
                              <div className="text-sm text-slate-400">
                                <p><strong>Title:</strong> {result.data.title}</p>
                                <p><strong>Type:</strong> {result.data.type}</p>
                                <p><strong>Size:</strong> {(result.data.size / 1024).toFixed(2)} KB</p>
                                <p><strong>Hash:</strong> 
                                  <code className="ml-2 text-green-400 bg-slate-900 px-2 py-1 rounded text-xs">
                                    {result.data.hash.slice(0, 20)}...
                                  </code>
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h5 className="text-sm font-medium text-slate-300">DA Proof</h5>
                              <div className="text-sm text-slate-400">
                                <p><strong>Merkle Root:</strong> 
                                  <code className="ml-2 text-purple-400 bg-slate-900 px-2 py-1 rounded text-xs">
                                    {result.proof.merkleRoot.slice(0, 20)}...
                                  </code>
                                </p>
                                <p><strong>Proof:</strong> 
                                  <code className="ml-2 text-blue-400 bg-slate-900 px-2 py-1 rounded text-xs">
                                    {result.proof.proof.slice(0, 20)}...
                                  </code>
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => window.open(result.explorerUrl, '_blank')}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Explorer
                              </Button>
                              <Button
                                onClick={() => window.open(result.proofUrl, '_blank')}
                                variant="outline"
                                size="sm"
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                              >
                                <Shield className="w-3 h-3 mr-1" />
                                Proof
                              </Button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Message */}
      {!canPublish && (
        <Card className="bg-yellow-900/20 border-yellow-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300">
                {!address ? 'Connect your wallet to publish to Data Availability' : 
                 'Complete compute analysis before publishing to Data Availability'}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

