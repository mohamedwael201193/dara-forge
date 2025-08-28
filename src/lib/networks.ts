// src/lib/networks.ts
import { defineChain } from '@reown/appkit/networks';

export const ogGalileo = defineChain({
  id: 16601,
  caipNetworkId: 'eip155:16601',
  chainNamespace: 'eip155',
  name: '0G-Galileo-Testnet',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_OG_RPC ?? 'https://16601.rpc.thirdweb.com/']
    }
  },
  blockExplorers: {
    default: {
      name: 'ChainScan',
      url: import.meta.env.VITE_OG_EXPLORER ?? 'https://chainscan-galileo.0g.ai'
    }
  },
  testnet: true
});

