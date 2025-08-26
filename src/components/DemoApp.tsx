import React, { useState, useEffect } from 'react'
import { WalletAuth } from '@/lib/auth/wallet'
import { WalletConnector } from './WalletConnector'
import { UploadDataset } from './UploadDataset'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Shield, 
  Network, 
  CheckCircle, 
  Upload,
  Download,
  ShieldCheck,
  Link
} from 'lucide-react'

export const DemoApp: React.FC = () => {
  const [walletAuth] = useState(() => new WalletAuth())
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Check for existing connection on mount
    const connection = walletAuth.getConnection()
    if (connection?.isConnected) {
      setIsConnected(true)
    }
  }, [])

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DARA Forge
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Decentralized AI Research Assistant - Upload, verify, and anchor your research datasets 
            on the 0G Network with cryptographic proof and blockchain immutability.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              ✅ Real 0G Integration
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              🔗 Live Blockchain
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              🛡️ Cryptographic Proofs
            </Badge>
          </div>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-6 h-6" />
              How DARA Forge Works
            </CardTitle>
            <CardDescription>
              A complete workflow for scientific data integrity using 0G Network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold">1. Upload to 0G Storage</h3>
                <p className="text-sm text-gray-600">
                  Files are uploaded to the decentralized 0G Storage network with Merkle tree generation
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold">2. Generate Proofs</h3>
                <p className="text-sm text-gray-600">
                  Cryptographic Merkle proofs are generated to ensure data integrity and authenticity
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                  <Link className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold">3. Anchor on Chain</h3>
                <p className="text-sm text-gray-600">
                  Dataset fingerprints are permanently anchored on 0G Chain for immutable records
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto">
                  <Download className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="font-semibold">4. Verified Access</h3>
                <p className="text-sm text-gray-600">
                  Anyone can download and verify data integrity using cryptographic proofs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Interface */}
        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connect" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Connect Wallet
            </TabsTrigger>
            <TabsTrigger value="upload" disabled={!isConnected} className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Dataset
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="mt-6">
            <WalletConnector 
              walletAuth={walletAuth} 
              onConnectionChange={handleConnectionChange}
            />
          </TabsContent>
          
          <TabsContent value="upload" className="mt-6">
            {isConnected ? (
              <UploadDataset walletAuth={walletAuth} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Wallet Connection Required</h3>
                  <p className="text-gray-600">
                    Please connect your wallet first to upload datasets to 0G Network
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Network Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              0G Network Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">0G Storage</p>
                  <p className="text-sm text-green-600">Online & Ready</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">0G Chain</p>
                  <p className="text-sm text-green-600">Galileo Testnet</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">DARA Contract</p>
                  <p className="text-sm text-green-600">Deployed & Verified</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            DARA Forge - Powered by 0G Network | 
            <a href="https://chainscan-galileo.0g.ai" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline">
              Chain Explorer
            </a> | 
            <a href="https://storagescan-galileo.0g.ai" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline">
              Storage Explorer
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}


