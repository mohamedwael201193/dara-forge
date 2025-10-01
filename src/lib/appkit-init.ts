// src/lib/appkit-init.ts
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';

const projectId = import.meta.env.VITE_WC_PROJECT_ID;

const ogGalileo = defineChain({
  id: 16602,
  caipNetworkId: 'eip155:16602',
  chainNamespace: 'eip155',
  name: 'Galileo (Testnet)',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: { default: { http: ['https://evmrpc-testnet.0g.ai/'] } },
  blockExplorers: { default: { name: 'ChainScan', url: 'https://chainscan-galileo.0g.ai' } },
  testnet: true
});

const networks = [ogGalileo] as unknown as [any, ...any[]];

const wagmiAdapter = new WagmiAdapter({
  projectId: projectId || 'missing',
  networks
});

const metadata = {
  name: 'DARA Forge',
  description: 'Decentralized AI Research Assistant',
  url: 'https://dara-forge.vercel.app',
  icons: ['https://dara-forge.vercel.app/icon.png']
};

// Initialize AppKit immediately at module load
let appKitInstance: any = null;

try {
  appKitInstance = createAppKit({
    adapters: [wagmiAdapter],
    projectId: projectId || 'missing',
    networks,
    defaultNetwork: ogGalileo as any,
    metadata
  });
  console.log('AppKit initialized successfully at module load');
} catch (error) {
  console.error('Failed to initialize AppKit at module load:', error);
}

export function initializeAppKit() {
  return appKitInstance;
}

export { wagmiAdapter };
export const wagmiConfig = wagmiAdapter.wagmiConfig;

