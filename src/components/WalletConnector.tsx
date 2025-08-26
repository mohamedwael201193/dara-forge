import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WalletAuth } from '@/lib/auth/wallet'
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface WalletConnectorProps {
  walletAuth: WalletAuth
  onConnectionChange: (connected: boolean) => void
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({ 
  walletAuth, 
  onConnectionChange 
}) => {
  const [connecting, setConnecting] = useState(false)
  const [connection, setConnection] = useState(walletAuth.getConnection())
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Check for existing connection on mount
    const existingConnection = walletAuth.getConnection()
    if (existingConnection) {
      setConnection(existingConnection)
      onConnectionChange(true)
    }
  }, [])

  const handleConnect = async () => {
    setConnecting(true)
    setError('')

    try {
      console.log('Attempting to connect wallet...')
      const newConnection = await walletAuth.connectWallet()
      setConnection(newConnection)
      onConnectionChange(true)
      console.log('Wallet connected successfully!')
    } catch (err: any) {
      console.error('Connection failed:', err)
      setError(err.message)
      onConnectionChange(false)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    await walletAuth.disconnect()
    setConnection(null)
    onConnectionChange(false)
  }

  const isConnected = connection?.isConnected || false
  const isOnOGNetwork = walletAuth.isOnOGNetwork()
  const servicesReady = walletAuth.areServicesReady()

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Wallet Connection
        </CardTitle>
        <CardDescription>
          Connect your wallet to interact with 0G Network
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            <Button
              onClick={handleConnect}
              disabled={connecting}
              className="w-full"
              size="lg"
            >
              {connecting ? (
                <>
                  <Wallet className="w-4 h-4 mr-2 animate-pulse" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>

            {error && (
              <div className="p-3 border border-red-200 bg-red-50 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-2">
              <p>To use DARA Forge, you need:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>MetaMask wallet installed</li>
                <li>Connection to 0G Galileo Testnet</li>
                <li>Some 0G tokens for transactions</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">
                  Connected: {connection?.address.slice(0, 6)}...{connection?.address.slice(-4)}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {isOnOGNetwork ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">
                  Network: {isOnOGNetwork ? '0G Galileo Testnet' : `Chain ID ${connection?.chainId}`}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {servicesReady ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm">
                  0G Services: {servicesReady ? 'Ready' : 'Initializing...'}
                </span>
              </div>
            </div>

            {/* Network Warning */}
            {!isOnOGNetwork && (
              <div className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-800 font-medium text-sm">Wrong Network</span>
                </div>
                <p className="text-yellow-700 text-sm">
                  Please switch to 0G Galileo Testnet to use DARA Forge features.
                </p>
              </div>
            )}

            {/* Services Status */}
            {isOnOGNetwork && !servicesReady && (
              <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium text-sm">Initializing Services</span>
                </div>
                <p className="text-blue-700 text-sm">
                  Setting up 0G Storage and Chain services...
                </p>
              </div>
            )}

            {/* Success State */}
            {isOnOGNetwork && servicesReady && (
              <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-800 font-medium text-sm">Ready to Use</span>
                </div>
                <p className="text-green-700 text-sm">
                  All systems ready! You can now upload datasets to 0G Network.
                </p>
              </div>
            )}

            {/* Useful Links */}
            <div className="space-y-2 text-sm">
              <p className="font-medium">Useful Links:</p>
              <div className="space-y-1">
                <a
                  href="https://chainscan-galileo.0g.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  0G Chain Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://storagescan-galileo.0g.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  0G Storage Explorer
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

