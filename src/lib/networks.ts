// src/lib/networks.ts
import { defineChain } from '@reown/appkit/networks';

export const ogGalileo = defineChain({
  id: 16602,
  caipNetworkId: 'eip155:16602',
  chainNamespace: 'eip155',
  name: 'Galileo (Testnet)',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_OG_RPC ?? 'https://evmrpc-testnet.0g.ai/'] }
  },
  blockExplorers: {
    default: {
      name: 'ChainScan',
      url: import.meta.env.VITE_OG_EXPLORER ?? 'https://chainscan-galileo.0g.ai'
    }
  },
  testnet: true
});

