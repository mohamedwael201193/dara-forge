import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const { toast } = useToast();

  // Simulated 0G Chain configuration
const OG_CHAIN_CONFIG = {
  chainId: '0x40d9', // 16601 in hex
  chainName: '0G-Galileo-Testnet',
  nativeCurrency: {
    name: '0G',
    symbol: 'OG',
    decimals: 18,
  },
  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls: ['https://chainscan-galileo.0g.ai'],
};

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Get current chain ID
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      // Check if we're on the correct chain (0G Newton Testnet)
      if (currentChainId !== OG_CHAIN_CONFIG.chainId) {
        try {
          // Try to switch to 0G Newton Testnet
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: OG_CHAIN_CONFIG.chainId }],
          });
        } catch (switchError: any) {
          // If the chain hasn't been added to MetaMask, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [OG_CHAIN_CONFIG],
              });
            } catch (addError) {
              throw new Error('Failed to add 0G Newton Testnet to MetaMask');
            }
          } else {
            throw switchError;
          }
        }
      }

      // Set connection state
      setWalletAddress(accounts[0]);
      setChainId(OG_CHAIN_CONFIG.chainId);
      setIsConnected(true);

      toast({
        title: "Wallet Connected Successfully",
        description: `Connected to 0G-Galileo-Testnet with address ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });

    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress("");
    setChainId("");
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected from DARA.",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard.",
    });
  };

  const openExplorer = () => {
    window.open(`${OG_CHAIN_CONFIG.blockExplorerUrls[0]}/address/${walletAddress}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {!isConnected ? (
        <>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Connect Your Wallet</h3>
              <p className="text-muted-foreground text-sm">
                 Connect to 0G-Galileo-Testnet to interact with DARA's decentralized features
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">0G-Galileo-Testnet</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Chain ID: {parseInt(OG_CHAIN_CONFIG.chainId, 16)}</p>
                <p>RPC: {OG_CHAIN_CONFIG.rpcUrls[0]}</p>
                <p>Explorer: {OG_CHAIN_CONFIG.blockExplorerUrls[0]}</p>
              </div>
            </div>

            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect MetaMask
                </>
              )}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Successfully Connected</h3>
              <p className="text-muted-foreground text-sm                    Your wallet is connected to 0G-Galileo-Testnet
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network</span>
                <Badge variant="secondary">0G-Galileo-Testnet</Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Wallet Address</span>
                <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm font-mono">
                  <span className="flex-1 truncate">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openExplorer}
                    className="h-6 w-6 p-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={disconnectWallet}
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

