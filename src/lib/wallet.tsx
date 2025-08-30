import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider } from 'wagmi';
import { type AppKitNetwork } from '@reown/appkit/networks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { ogGalileo } from './networks';

// 1. Get projectId from https://cloud.reown.com
const projectId = import.meta.env.VITE_WC_PROJECT_ID || 'your-project-id';

// 2. Create a metadata object - optional
const metadata = {
  name: 'DARA Forge',
  description: 'Decentralized AI Research Assistant',
  url: 'https://dara-forge.vercel.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// 3. Set the networks - ONLY 0G Galileo Testnet
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [ogGalileo];

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
  defaultNetwork: ogGalileo,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
  themeMode: 'dark'
});

// Add custom CSS to fix z-index issues
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    w3m-modal,
    wcm-modal,
    [data-testid="w3m-modal"],
    .w3m-modal,
    .wcm-modal {
      z-index: 99999 !important;
    }
    
    w3m-modal *,
    wcm-modal *,
    [data-testid="w3m-modal"] *,
    .w3m-modal *,
    .wcm-modal * {
      z-index: inherit !important;
    }
  `;
  document.head.appendChild(style);
}

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