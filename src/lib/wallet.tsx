import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type Config } from 'wagmi';
import { http, defineChain } from 'viem';
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const projectId = import.meta.env.VITE_WC_PROJECT_ID as string;

const ogGalileo = defineChain({
  id: 16601,
  name: '0G-Galileo-Testnet',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://16601.rpc.thirdweb.com/'] },
    public:  { http: ['https://16601.rpc.thirdweb.com/'] }
  },
  blockExplorers: {
    default: { name: 'ChainScan', url: 'https://chainscan-galileo.0g.ai' }
  },
  testnet: true
});

const networks = [ogGalileo] as const;

const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  transports: { [ogGalileo.id]: http('https://16601.rpc.thirdweb.com/') }
});

// Exported Wagmi config if you need wagmi actions elsewhere
export const wagmiConfig = wagmiAdapter.wagmiConfig as Config;

const metadata = {
  name: 'DARA Forge',
  description: 'Decentralized AI Research Assistant',
  url: 'https://dara-forge.vercel.app',
  icons: ['https://dara-forge.vercel.app/icon.png']
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
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


