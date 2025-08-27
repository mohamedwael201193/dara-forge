import React from 'react';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { UploadDataset } from './UploadDataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, ShieldCheck, Link, MessageSquareText, Network, Shield, Send, CheckCircle, Brain, Coins, Globe, Lock, ChevronRight, ArrowRight, Share, Cpu, AlertTriangle } from "@/lib/icons";
import { SummarizeDataset } from './SummarizeDataset'
import { DAPublish } from "@/components/DAPublish";

export const DemoApp: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">DARA Forge Platform</h1>
                <p className="text-blue-100">Decentralized AI Research Assistant</p>
              </div>
            </div>
            <ConnectWalletButton />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-blue-200" />
              <h3 className="font-semibold mb-1">Secure Storage</h3>
              <p className="text-xs text-blue-100">Decentralized file storage with cryptographic proofs</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Brain className="w-8 h-8 mx-auto mb-2 text-green-200" />
              <h3 className="font-semibold mb-1">AI Analysis</h3>
              <p className="text-xs text-blue-100">Intelligent dataset summarization and insights</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Send className="w-8 h-8 mx-auto mb-2 text-purple-200" />
              <h3 className="font-semibold mb-1">Global Publishing</h3>
              <p className="text-xs text-blue-100">Share research findings across decentralized networks</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Shield className="w-8 h-8 mx-auto mb-2 text-orange-200" />
              <h3 className="font-semibold mb-1">Blockchain Verify</h3>
              <p className="text-xs text-blue-100">Immutable verification and integrity tracking</p>
            </div>
          </div>
        </div>

        {/* Main Demo Tabs */}
        <div className="p-8">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100 border border-slate-200">
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Dataset
              </TabsTrigger>
              <TabsTrigger 
                value="summarize"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-600"
              >
                <MessageSquareText className="w-4 h-4 mr-2" />
                AI Summarize
              </TabsTrigger>
              <TabsTrigger 
                value="publish"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-600"
              >
                <Send className="w-4 h-4 mr-2" />
                DA Publish
              </TabsTrigger>
              <TabsTrigger 
                value="status"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-600"
              >
                <Network className="w-4 h-4 mr-2" />
                Network Status
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="upload" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Research Datasets</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    Securely upload your research datasets to the decentralized 0G Storage network. 
                    Each upload generates cryptographic proofs and is anchored on the blockchain for immutable verification.
                  </p>
                </div>
                <UploadDataset />
              </TabsContent>

              <TabsContent value="summarize" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">AI-Powered Dataset Analysis</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    Generate intelligent summaries and insights from your datasets using advanced AI models. 
                    Extract key findings, patterns, and research-relevant information automatically.
                  </p>
                </div>
                <SummarizeDataset />
              </TabsContent>

              <TabsContent value="publish" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Decentralized Publishing</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    Publish your research findings and datasets to decentralized networks for global accessibility. 
                    Ensure your work reaches the global research community through distributed channels.
                  </p>
                </div>
                <DAPublish />
              </TabsContent>

              <TabsContent value="status" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Network & Service Status</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">
                    Monitor the status of all integrated services and networks. 
                    Track the health and availability of 0G Storage, blockchain networks, and DARA services.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "0G Storage Network",
                      status: "Online & Ready",
                      description: "Decentralized storage network operating normally",
                      icon: Globe,
                      color: "green",
                      metrics: ["Uptime: 99.9%", "Nodes: 1,247", "Capacity: 2.4 PB"]
                    },
                    {
                      title: "0G Galileo Chain",
                      status: "Testnet Active",
                      description: "Blockchain network for immutable data anchoring",
                      icon: Link,
                      color: "blue",
                      metrics: ["Block Height: 2,847,392", "TPS: 1,000+", "Validators: 100"]
                    },
                    {
                      title: "DARA Smart Contract",
                      status: "Deployed & Verified",
                      description: "Smart contract for dataset registration and verification",
                      icon: Shield,
                      color: "purple",
                      metrics: ["Version: 1.2.0", "Datasets: 15,847", "Verifications: 98,234"]
                    }
                  ].map((service, index) => (
                    <Card key={index} className="border-slate-200">
                      <CardContent className="p-6 text-center space-y-4">
                        <div className={`w-16 h-16 mx-auto rounded-2xl bg-${service.color}-100 flex items-center justify-center border border-${service.color}-200`}>
                          <service.icon className={`w-8 h-8 text-${service.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-1">{service.title}</h3>
                          <Badge className={`bg-${service.color}-100 text-${service.color}-700 border-${service.color}-200 mb-2`}>
                            {service.status}
                          </Badge>
                          <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                          <div className="space-y-1">
                            {service.metrics.map((metric, i) => (
                              <div key={i} className="text-xs text-slate-500">{metric}</div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-2 h-2 rounded-full bg-${service.color}-500`}></div>
                          <span className="text-xs text-slate-500">Active</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Additional Network Information */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Network className="w-5 h-5 text-blue-500" />
                      Integration Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Supported Networks</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm text-slate-600">0G Galileo Testnet (Chain ID: 16601)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-slate-600">0G Storage Network</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-sm text-slate-600">IPFS Gateway Integration</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Platform Features</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-slate-600">Cryptographic Proof Generation</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-slate-600">Blockchain Data Anchoring</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-slate-600">AI-Powered Analysis</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-slate-600">Decentralized Publishing</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

