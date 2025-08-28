// src/components/ConnectWalletButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { ogGalileo } from '@/lib/networks';
import { getWalletClient } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wallet';
import { useBalance } from 'wagmi';
import { Wallet, User } from '@/lib/icons';

async function addGalileoIfMissing() {
  const client = await getWalletClient(wagmiConfig);
  if (!client) return;
  try {
    await client.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x40D9', // 16601
        chainName: '0G-Galileo-Testnet',
        nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
        rpcUrls: [import.meta.env.VITE_OG_RPC ?? 'https://16601.rpc.thirdweb.com/'],
        blockExplorerUrls: [import.meta.env.VITE_OG_EXPLORER ?? 'https://chainscan-galileo.0g.ai']
      }]
    });
  } catch {}
}

const ConnectWalletButton: React.FC = () => {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const [balanceDisplay, setBalanceDisplay] = React.useState<string | null>(null);

  // Get balance using wagmi hook for the connected user on Galileo
  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: ogGalileo.id,
    query: {
      enabled: isConnected && !!address && chainId === ogGalileo.id,
      refetchInterval: 10000,
    }
  });

  React.useEffect(() => {
    (async () => {
      if (!isConnected) { 
        setBalanceDisplay(null); 
        return; 
      }

      // Auto-switch to Galileo; if wallet doesn't know it, add then switch
      if (chainId !== ogGalileo.id) {
        try {
          await switchNetwork(ogGalileo);
        } catch {
          await addGalileoIfMissing();
          try { 
            await switchNetwork(ogGalileo); 
          } catch { 
            open({ view: 'Networks' }); 
          }
        }
      }
    })();
  }, [isConnected, chainId, switchNetwork, open]);

  // Update balance display when balance data changes
  React.useEffect(() => {
    if (balance && chainId === ogGalileo.id) {
      const formatted = parseFloat(balance.formatted).toFixed(4);
      setBalanceDisplay(`${formatted} ${balance.symbol}`);
    } else {
      setBalanceDisplay(null);
    }
  }, [balance, chainId]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <Badge className={`px-3 py-1 ${
          chainId === ogGalileo.id 
            ? 'bg-green-500/20 text-green-300 border-green-500/30' 
            : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
            chainId === ogGalileo.id ? 'bg-green-400' : 'bg-yellow-400'
          }`}></div>
          {chainId === ogGalileo.id ? 'Connected to 0G' : 'Wrong Network'}
        </Badge>
        <Button
          onClick={() => open()}
          className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          {formatAddress(address)}
          {balanceDisplay && <span className="text-xs opacity-75">· {balanceDisplay}</span>}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => open()}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
};

export default ConnectWalletButton;

