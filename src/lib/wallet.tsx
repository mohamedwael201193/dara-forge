import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { arbitrum, mainnet, type AppKitNetwork } from '@reown/appkit/networks';
import { Chain } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const zeroGGalileoTestnet: Chain = {
  id: 16601,
  name: '0G-Galileo-Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: 'OG',
  },
  rpcUrls: {
    default: {
      http: [
        'https://evmrpc-testnet.0g.ai/',
        'https://rpc.0g.ai/', // Added new RPC
        'https://16601.rpc.thirdweb.com' // Keep thirdweb as backup
      ],
    },
    public: {
      http: [
        'https://evmrpc-testnet.0g.ai/',
        'https://rpc.0g.ai/', // Added new RPC
        'https://16601.rpc.thirdweb.com' // Keep thirdweb as backup
      ],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Chainscan',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
};

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_WC_PROJECT_ID || 'your-project-id';

// 2. Create a metadata object - optional
const metadata = {
  name: 'DARA Forge',
  description: 'Decentralized AI Research Assistant',
  url: 'https://dara-forge.vercel.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// 3. Set the networks - create mutable array from readonly networks
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [zeroGGalileoTestnet, mainnet, arbitrum];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false // Set to true if used in server-side rendering context
});

// 5. Create modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  }
});

// 6. Create query client
const queryClient = new QueryClient();

export function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export const wagmiConfig = wagmiAdapter.wagmiConfig;
export { modal };