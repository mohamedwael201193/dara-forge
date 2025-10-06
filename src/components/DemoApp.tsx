import { ActivityHistory } from '@/components/ActivityHistory';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { DAPublish } from "@/components/DAPublish";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WalletStatus } from '@/components/WalletStatus';
import { Brain, CheckCircle, MessageSquareText, Network, Send, Shield, Upload } from "@/lib/icons";
import { StorageUploadSection } from '@/sections/StorageUploadSection';
import { Activity } from "lucide-react";
import React from 'react';
import { AISummarizeSection } from '../sections/AISummarizeSection';

export const DemoApp: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
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
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Upload className="w-8 h-8 mx-auto mb-2 text-blue-200" />
              <h3 className="font-semibold mb-1">Secure Storage</h3>
              <p className="text-xs text-blue-100">Decentralized file storage with cryptographic proofs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Brain className="w-8 h-8 mx-auto mb-2 text-green-200" />
              <h3 className="font-semibold mb-1">AI Analysis</h3>
              <p className="text-xs text-blue-100">Intelligent dataset summarization and insights</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Send className="w-8 h-8 mx-auto mb-2 text-purple-200" />
              <h3 className="font-semibold mb-1">Global Publishing</h3>
              <p className="text-xs text-blue-100">Share research findings across decentralized networks</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <Shield className="w-8 h-8 mx-auto mb-2 text-orange-200" />
              <h3 className="font-semibold mb-1">Blockchain Verify</h3>
              <p className="text-xs text-blue-100">Immutable verification and integrity tracking</p>
            </div>
          </div>
        </div>

        {/* Main Demo Tabs */}
        <div className="p-8 bg-slate-900">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800 border border-slate-700">
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Dataset
              </TabsTrigger>
              <TabsTrigger 
                value="summarize"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 hover:text-white"
              >
                <MessageSquareText className="w-4 h-4 mr-2" />
                AI Summarize
              </TabsTrigger>
              <TabsTrigger 
                value="publish"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300 hover:text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                DA Publish
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-300 hover:text-white"
              >
                <Activity className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="status"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300 hover:text-white"
              >
                <Network className="w-4 h-4 mr-2" />
                Network Status
              </TabsTrigger>
            </TabsList>

            <div className="mt-8">
              <TabsContent value="upload" className="space-y-6">
                <StorageUploadSection />
              </TabsContent>

              <TabsContent value="summarize" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">AI-Powered Dataset Analysis</h2>
                  <p className="text-slate-300 max-w-2xl mx-auto">
                    Generate intelligent summaries and insights from your datasets using advanced AI models. 
                    Extract key findings, patterns, and research-relevant information automatically.
                  </p>
                </div>
                <AISummarizeSection />
              </TabsContent>

              <TabsContent value="publish" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Decentralized Publishing</h2>
                  <p className="text-slate-300 max-w-2xl mx-auto">
                    Publish your research findings and datasets to decentralized networks for global accessibility. 
                    Ensure your work reaches the global research community through distributed channels.
                  </p>
                </div>
                <DAPublish />
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Session Activity</h2>
                  <p className="text-slate-300 max-w-2xl mx-auto">
                    Track all your uploads, DA publications, AI analyses, and blockchain transactions in one place. 
                    Monitor the complete workflow of your research data through the 0G ecosystem.
                  </p>
                </div>
                <ActivityHistory />
              </TabsContent>

              <TabsContent value="status" className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Wallet & Network Status</h2>
                  <p className="text-slate-300 max-w-2xl mx-auto">
                    Monitor your wallet connection, 0G balance, and network status. Ensure you're connected to the correct 0G Chain for optimal functionality.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WalletStatus />
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Network className="w-5 h-5" />
                        Network Information
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        0G Galileo Testnet details and status
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 mb-1">Chain ID</p>
                          <p className="text-white font-mono">16602</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Currency</p>
                          <p className="text-white font-mono">0G</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">RPC Endpoint</p>
                          <p className="text-white font-mono text-xs">evmrpc-testnet.0g.ai</p>
                        </div>
                        <div>
                          <p className="text-slate-400 mb-1">Explorer</p>
                          <p className="text-white font-mono text-xs">chainscan-galileo.0g.ai</p>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-700 pt-4">
                        <h4 className="font-semibold text-white mb-3">Network Services</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-sm text-slate-300">0G Chain (Blockchain)</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                            <span className="text-sm text-slate-300">0G Storage Network</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
                            <span className="text-sm text-slate-300">0G Compute Network</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                            <span className="text-sm text-slate-300">0G DA Layer</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-700 pt-4">
                        <h4 className="font-semibold text-white mb-3">Platform Features</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-slate-300">Real-time Balance Display</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-slate-300">Network Auto-Detection</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-slate-300">Chain Switching Support</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-slate-300">Multi-Wallet Compatibility</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

