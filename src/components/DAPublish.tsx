import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Database,
  Shield,
  Info,
  BookOpen,
  Zap,
  Server,
  Globe,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  FileText,
  Network,
  Layers,
  Clock,
  DollarSign,
  Users,
  TrendingUp
} from 'lucide-react';
import { useDataStore } from '@/store/dataStore';

export function DAPublish() {
  const { uploadedDatasets, daPublications } = useDataStore();
  const [selectedTab, setSelectedTab] = useState('learn');

  const features = [
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Global Availability",
      description: "Your data is distributed across multiple nodes worldwide"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Cryptographic Security",
      description: "All data is cryptographically signed and verified"
    },
    {
      icon: <Layers className="w-5 h-5" />,
      title: "Redundant Encoding",
      description: "Advanced erasure coding ensures data recovery even if nodes fail"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "High Performance",
      description: "Optimized for fast retrieval and verification"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Upload to Storage",
      description: "First, upload your dataset to 0G Storage",
      status: uploadedDatasets.length > 0 ? 'completed' : 'pending'
    },
    {
      number: "2",
      title: "Generate Merkle Root",
      description: "Storage creates a cryptographic proof of your data",
      status: uploadedDatasets.length > 0 ? 'completed' : 'pending'
    },
    {
      number: "3",
      title: "Publish to DA",
      description: "Submit data commitment to DA network",
      status: daPublications.length > 0 ? 'completed' : 'pending'
    },
    {
      number: "4",
      title: "Network Distribution",
      description: "Data is encoded and distributed across nodes",
      status: daPublications.length > 0 ? 'completed' : 'pending'
    }
  ];

  const faqs = [
    {
      q: "What is 0G Data Availability?",
      a: "0G DA is a decentralized layer that ensures your research data remains permanently accessible and verifiable across a distributed network of nodes."
    },
    {
      q: "How is this different from regular storage?",
      a: "Unlike traditional storage, 0G DA provides cryptographic proof that your data exists and can be retrieved, even if individual nodes go offline."
    },
    {
      q: "What's the maximum data size?",
      a: "You can submit data blobs up to 32,505,852 bytes (≈32 MB) per transaction."
    },
    {
      q: "How much does it cost?",
      a: "DA operations require a small amount of OG tokens for network fees. Current cost is approximately 0.001 OG per MB."
    },
    {
      q: "Is my data encrypted?",
      a: "Data is cryptographically signed and verified. For sensitive data, you should encrypt before submission."
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl">0G Data Availability Layer</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Ensure permanent accessibility of your research data
                </p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Decentralized
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="learn" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Learn
          </TabsTrigger>
          <TabsTrigger value="how" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            How it Works
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Your Status
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="learn" className="space-y-6">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertTitle>What is Data Availability?</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                Data Availability (DA) ensures that data behind a transaction or state change 
                is accessible to all network participants. In DARA Forge, this means your research 
                data is guaranteed to be retrievable by anyone who needs to verify it.
              </p>
              <p className="font-semibold text-primary">
                Think of it as a global, decentralized backup system with cryptographic proof!
              </p>
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="how" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How 0G DA Works with Your Research</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${step.status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }
                  `}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {idx < steps.length - 1 && (
                      <div className="mt-4 ml-5 border-l-2 border-dashed border-gray-300 dark:border-gray-700 h-8" />
                    )}
                  </div>
                  {step.status === 'completed' && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Completed
                    </Badge>
                  )}
                </div>
              ))}

              <Alert className="mt-6">
                <Zap className="w-4 h-4" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                  DA publishing happens automatically when you upload files in the Storage section. 
                  You can also manually publish any data using the API.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Uploads</p>
                    <p className="text-3xl font-bold">{uploadedDatasets.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">DA Publications</p>
                    <p className="text-3xl font-bold">{daPublications.length}</p>
                  </div>
                  <Database className="w-8 h-8 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Network Status</p>
                    <Badge className="mt-2" variant="outline">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2" />
                      Active
                    </Badge>
                  </div>
                  <Network className="w-8 h-8 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {daPublications.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent DA Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {daPublications.slice(-3).reverse().map((pub, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <code className="text-xs">{pub.blobHash.slice(0, 16)}...</code>
                          <p className="text-xs text-muted-foreground">
                            Epoch {pub.epoch}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {new Date(pub.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertTitle>No DA Publications Yet</AlertTitle>
              <AlertDescription>
                Upload a dataset in the Storage section to automatically publish to DA.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-semibold">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* CTA Section */}
      {uploadedDatasets.length === 0 && (
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-3">
              Ready to Make Your Research Permanently Available?
            </h3>
            <p className="text-muted-foreground mb-6">
              Start by uploading your first dataset to experience the power of decentralized data availability
            </p>
            <Button size="lg" className="gap-2">
              Go to Storage Section
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}