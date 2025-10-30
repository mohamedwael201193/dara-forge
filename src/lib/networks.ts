// src/lib/networks.ts
import { defineChain } from "@reown/appkit/networks";

// 0G Mainnet - Wave 5 Production Network
export const ogMainnet = defineChain({
  id: 16661,
  caipNetworkId: "eip155:16661",
  chainNamespace: "eip155",
  name: "0G Mainnet",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_OG_RPC_MAINNET ?? "https://evmrpc.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "ChainScan",
      url:
        import.meta.env.VITE_OG_EXPLORER_MAINNET ?? "https://chainscan.0g.ai",
    },
  },
  testnet: false,
});

// 0G Testnet (Galileo) - For Compute and DA
export const ogGalileo = defineChain({
  id: 16602,
  caipNetworkId: "eip155:16602",
  chainNamespace: "eip155",
  name: "Galileo (Testnet)",
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_OG_RPC ?? "https://evmrpc-testnet.0g.ai/"],
    },
  },
  blockExplorers: {
    default: {
      name: "ChainScan",
      url:
        import.meta.env.VITE_OG_EXPLORER ?? "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
});
