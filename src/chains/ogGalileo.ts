import { defineChain } from 'viem'

export const ogGalileo = defineChain({
  id: 16601,
  name: '0G-Galileo-Testnet',
  nativeCurrency: { name: 'OG', symbol: 'OG', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://16601.rpc.thirdweb.com/'] },
    public:  { http: ['https://16601.rpc.thirdweb.com/'] },
  },
  blockExplorers: {
    default: { name: 'ChainScan', url: 'https://chainscan-galileo.0g.ai' }
  },
  testnet: true
})

