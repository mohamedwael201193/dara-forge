import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, type Config } from 'wagmi';
import { initializeAppKit, wagmiConfig } from './appkit-init';

const queryClient = new QueryClient();

export function WalletProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize AppKit when the provider mounts
    initializeAppKit();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export { wagmiConfig };

