import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';
import { WagmiProvider, type Config } from 'wagmi';

const projectId = import.meta.env.VITE_WC_PROJECT_ID;

const ogGalileo = defineChain({
  id: 16601,
  caipNetworkId: 'eip155:16601',
  chainNamespace: 'eip155',
  name: '0G-Galileo-Testnet',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: { default: { http: ['https://16601.rpc.thirdweb.com/'] } },
  blockExplorers: { default: { name: 'ChainScan', url: 'https://chainscan-galileo.0g.ai' } },
  testnet: true
});

// AppKit expects a non-readonly tuple. This cast is the simplest path.
const networks = [ogGalileo] as unknown as [any, ...any[]];

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
  defaultNetwork: ogGalileo as any,
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


