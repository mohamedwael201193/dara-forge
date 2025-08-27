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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              DARA Forge
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Decentralized AI Research Assistant - Upload, verify, and anchor your research datasets 
            on the 0G Network with cryptographic proof and blockchain immutability.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2">
              <CheckCircle className="w-4 h-4 mr-2" />
              Real 0G Integration
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
              <Link className="w-4 h-4 mr-2" />
              Live Blockchain
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Cryptographic Proofs
            </Badge>
          </div>
        </div>

        {/* How It Works */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-white">
              <Network className="w-7 h-7 text-blue-400" />
              How DARA Forge Works
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              A complete workflow for scientific data integrity using 0G Network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Upload,
                  title: "1. Upload to 0G Storage",
                  description: "Files are uploaded to the decentralized 0G Storage network with Merkle tree generation",
                  color: "blue"
                },
                {
                  icon: ShieldCheck,
                  title: "2. Generate Proofs",
                  description: "Cryptographic Merkle proofs are generated to ensure data integrity and authenticity",
                  color: "green"
                },
                {
                  icon: Link,
                  title: "3. Anchor on Chain",
                  description: "Dataset fingerprints are permanently anchored on 0G Chain for immutable records",
                  color: "purple"
                },
                {
                  icon: Download,
                  title: "4. Verified Access",
                  description: "Anyone can download and verify data integrity using cryptographic proofs",
                  color: "orange"
                }
              ].map((step, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-${step.color}-500/20 flex items-center justify-center border border-${step.color}-500/30`}>
                    <step.icon className={`w-8 h-8 text-${step.color}-400`} />
                  </div>
                  <h3 className="font-semibold text-white text-lg">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Demo Tabs */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-white">Live Demo Interface</CardTitle>
              <ConnectWalletButton />
            </div>
            <CardDescription className="text-slate-300">
              Experience real uploads to 0G Storage, cryptographic proof verification, and immutable blockchain anchoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-slate-700/50 border border-slate-600">
                <TabsTrigger 
                  value="upload" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Dataset
                </TabsTrigger>
                <TabsTrigger 
                  value="summarize"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300"
                >
                  <MessageSquareText className="w-4 h-4 mr-2" />
                  Summarize Dataset
                </TabsTrigger>
                <TabsTrigger 
                  value="publish"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300"
                >
                  <Send className="w-4 h-4 mr-2" />
                  DA Publish
                </TabsTrigger>
                <TabsTrigger 
                  value="status"
                  className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300"
                >
                  <Network className="w-4 h-4 mr-2" />
                  Network Status
                </TabsTrigger>
              </TabsList>

              <div className="mt-8">
                <TabsContent value="upload" className="space-y-6">
                  <UploadDataset />
                </TabsContent>

                <TabsContent value="summarize" className="space-y-6">
                  <SummarizeDataset />
                </TabsContent>

                <TabsContent value="publish" className="space-y-6">
                  <DAPublish />
                </TabsContent>

                <TabsContent value="status" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        title: "0G Storage",
                        status: "Online & Ready",
                        icon: Globe,
                        color: "green"
                      },
                      {
                        title: "0G Chain",
                        status: "Galileo Testnet",
                        icon: Link,
                        color: "blue"
                      },
                      {
                        title: "DARA Contract",
                        status: "Deployed & Verified",
                        icon: Shield,
                        color: "purple"
                      }
                    ].map((service, index) => (
                      <Card key={index} className="bg-slate-700/50 border-slate-600">
                        <CardContent className="p-6 text-center space-y-4">
                          <div className={`w-12 h-12 mx-auto rounded-xl bg-${service.color}-500/20 flex items-center justify-center border border-${service.color}-500/30`}>
                            <service.icon className={`w-6 h-6 text-${service.color}-400`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{service.title}</h3>
                            <p className={`text-${service.color}-400 text-sm`}>{service.status}</p>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${service.color}-400`}></div>
                            <span className="text-xs text-slate-400">Active</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

