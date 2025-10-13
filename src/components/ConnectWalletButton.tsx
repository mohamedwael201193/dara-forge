// src/components/ConnectWalletButton.tsx
import { Button } from '@/components/ui/button';
import { ogGalileo } from '@/lib/networks';
import { wagmiConfig } from '@/lib/wallet';
import { useAppKit, useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react';
import { getWalletClient } from '@wagmi/core';
import React from 'react';
import { formatEther } from 'viem';
import { useBalance } from 'wagmi';

async function addGalileoIfMissing() {
  const wc = await getWalletClient(wagmiConfig);
  if (!wc) return;
  try {
    await wc.transport.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${(import.meta.env.VITE_OG_CHAIN_ID ? parseInt(import.meta.env.VITE_OG_CHAIN_ID, 10) : 16602).toString(16)}`, // Environment-aware
        chainName: 'Galileo (Testnet)',
        nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
        rpcUrls: [import.meta.env.VITE_OG_RPC ?? 'https://evmrpc-testnet.0g.ai/'],
        blockExplorerUrls: [import.meta.env.VITE_OG_EXPLORER ?? 'https://chainscan-galileo.0g.ai']
      }]
    });
  } catch {}
}

export default function ConnectWalletButton() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();
  const { chainId, switchNetwork } = useAppKitNetwork();
  const [balance, setBalance] = React.useState<string | null>(null);

  // Use wagmi's useBalance hook - ONLY when on correct chain
  const { data: balanceData, isLoading: balanceLoading } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: ogGalileo.id,
    query: {
      enabled: isConnected && !!address && chainId === ogGalileo.id,
      refetchInterval: chainId === ogGalileo.id ? 10000 : false,
      staleTime: 0, // Always fetch fresh data
      gcTime: 0, // Don't cache
    }
  });

  React.useEffect(() => {
    (async () => {
      if (!isConnected) { 
        setBalance(null); 
        return; 
      }

      // Auto-switch to Galileo if not already there
      if (chainId !== ogGalileo.id) {
        setBalance(null); // Clear balance when not on correct chain
        try {
          await switchNetwork(ogGalileo);
        } catch {
          await addGalileoIfMissing();
          try { await switchNetwork(ogGalileo); }
          catch { open({ view: 'Networks', namespace: 'eip155' }); }
        }
        return;
      }

      // Only show balance when on correct chain AND we have data
      if (chainId === ogGalileo.id && balanceData && !balanceLoading) {
        const formatted = formatEther(balanceData.value);
        const truncated = parseFloat(formatted).toFixed(4);
        setBalance(`${truncated} ${balanceData.symbol}`);
      } else if (chainId === ogGalileo.id && !balanceLoading) {
        // On correct chain but no balance (empty wallet)
        setBalance('0.0000 OG');
      } else {
        setBalance(null);
      }
    })();
  }, [isConnected, chainId, switchNetwork, open, balanceData, balanceLoading]);

  if (isConnected) {
    return (
      <Button variant="outline" onClick={() => open({ view: 'Account', namespace: 'eip155' })}>
        {address?.slice(0, 6)}…{address?.slice(-4)} 
        {chainId === ogGalileo.id && balance ? ` · ${balance}` : ''}
      </Button>
    );
  }
  return <Button onClick={() => open({ view: 'Connect', namespace: 'eip155' })}>Connect Wallet</Button>;
}

