// src/lib/appkit-init.ts
import { createAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { defineChain } from '@reown/appkit/networks';

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

let appKitInstance: any = null;

export function initializeAppKit() {
  if (!appKitInstance) {
    try {
      appKitInstance = createAppKit({
        adapters: [wagmiAdapter],
        projectId: projectId || 'missing',
        networks,
        defaultNetwork: ogGalileo as any,
        metadata
      });
      console.log('AppKit initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AppKit:', error);
    }
  }
  return appKitInstance;
}

export { wagmiAdapter };
export const wagmiConfig = wagmiAdapter.wagmiConfig;

