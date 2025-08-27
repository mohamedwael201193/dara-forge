// src/lib/wallet.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit';
import { WagmiProvider, type Config } from 'wagmi';

const projectId = import.meta.env.VITE_WC_PROJECT_ID;
if (!projectId) {
  // For local dev clarity; in prod, this simply leaves the modal non-functional
  // but we don't want to crash runtime
  console.warn('Missing VITE_WC_PROJECT_ID env var');
}

const ogGalileo: AppKitNetwork = defineChain({
  id: 16601,
  caipNetworkId: 'eip155:16601',
  chainNamespace: 'eip155',
  name: '0G-Galileo-Testnet',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://16601.rpc.thirdweb.com/'] }
  },
  blockExplorers: {
    default: { name: 'ChainScan', url: 'https://chainscan-galileo.0g.ai' }
  },
  testnet: true
});

const networks: AppKitNetwork[] = [ogGalileo];

const wagmiAdapter = new WagmiAdapter({
  projectId: projectId || 'missing',
  networks
});

export const wagmiConfig = wagmiAdapter.wagmiConfig as Config;

const metadata = {
  name: 'DARA Forge',
  description: 'Decentralized AI Research Assistant',
  url: 'https://dara-forge.vercel.app',
  icons: ['https://dara-forge.vercel.app/icon.png']
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId || 'missing',
  networks,
  defaultNetwork: ogGalileo,
  metadata
});

const queryClient = new QueryClient();

export function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

