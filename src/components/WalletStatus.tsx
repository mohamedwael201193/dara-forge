import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWalletBalance } from '@/hooks/useWalletBalance'
import { Wallet, AlertTriangle, CheckCircle, RefreshCw } from '@/lib/icons'

export const WalletStatus: React.FC = () => {
  const {
    address,
    isConnected,
    chainId,
    isOnZeroGChain,
    balance,
    balanceLoading,
    isLoading,
    switchToZeroGChain,
    refetchBalance,
    zeroGChainId,
    hasError
  } = useWalletBalance()

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">No wallet connected</p>
            <w3m-button />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div>
          <p className="text-sm font-medium mb-1">Address</p>
          <p className="text-xs font-mono bg-muted p-2 rounded">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
          </p>
        </div>

        {/* Network Status */}
        <div>
          <p className="text-sm font-medium mb-2">Network Status</p>
          <div className="flex items-center gap-2">
            {isOnZeroGChain ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Connected to 0G Chain
                </Badge>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <Badge variant="destructive">
                  Wrong Network (Chain ID: {chainId})
                </Badge>
              </>
            )}
          </div>
          
          {!isOnZeroGChain && (
            <Button 
              onClick={switchToZeroGChain} 
              disabled={isLoading}
              className="w-full mt-2"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Switching...
                </>
              ) : (
                `Switch to 0G Chain (${zeroGChainId})`
              )}
            </Button>
          )}
        </div>

        {/* Balance Display */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium">0G Balance</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchBalance()}
              disabled={balanceLoading || !isOnZeroGChain}
            >
              <RefreshCw className={`w-3 h-3 ${balanceLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">
                {!isOnZeroGChain ? (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="w-4 h-4" />
                    Switch to 0G Chain
                  </div>
                ) : balanceLoading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Loading...
                  </div>
                ) : hasError ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    Error fetching balance
                  </div>
                ) : (
                  `${balance} OG`
                )}
              </span>
              {isOnZeroGChain && !hasError && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            
            {!isOnZeroGChain && (
              <p className="text-xs text-muted-foreground mt-1">
                Connect to 0G Chain (ID: {zeroGChainId}) to view your balance
              </p>
            )}
            
            {isOnZeroGChain && balance === '0.0000' && !balanceLoading && (
              <p className="text-xs text-muted-foreground mt-1">
                This wallet has no 0G tokens. Visit a faucet to get testnet tokens.
              </p>
            )}
          </div>
        </div>

        {/* Network Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>0G Chain ID:</strong> {zeroGChainId}</p>
          <p><strong>Current Chain:</strong> {chainId}</p>
          <p><strong>Status:</strong> {isOnZeroGChain ? '✅ Correct Network' : '❌ Wrong Network'}</p>
          <p><strong>RPC:</strong> evmrpc-testnet.0g.ai</p>
          <p><strong>Explorer:</strong> chainscan-galileo.0g.ai</p>
        </div>
      </CardContent>
    </Card>
  )
}

