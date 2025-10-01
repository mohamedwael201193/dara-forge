import { defineChain } from 'viem'

export const ogGalileo = defineChain({
  id: 16602,
  name: 'Galileo (Testnet)',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evmrpc-testnet.0g.ai/'] },
    public:  { http: ['https://evmrpc-testnet.0g.ai/'] },
  },
  blockExplorers: {
    default: { name: 'ChainScan', url: 'https://chainscan-galileo.0g.ai' }
  },
  testnet: true
})

