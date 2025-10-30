require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./contracts/test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    // 0G Mainnet (Production)
    'og-mainnet': {
      type: 'http',
      url: process.env.OG_RPC_URL_MAINNET || "https://evmrpc.0g.ai",
      chainId: process.env.OG_CHAIN_ID_MAINNET ? parseInt(process.env.OG_CHAIN_ID_MAINNET, 10) : 16661,
      accounts: process.env.OG_MAINNET_PRIVATE_KEY ? [process.env.OG_MAINNET_PRIVATE_KEY] : [],
      gasPrice: 'auto',
    },
    // 0G Galileo Testnet
    galileo: {
      type: 'http',
      url: process.env.OG_RPC_URL_TESTNET || process.env.VITE_OG_RPC || "https://evmrpc-testnet.0g.ai/",
      chainId: process.env.OG_CHAIN_ID_TESTNET ? parseInt(process.env.OG_CHAIN_ID_TESTNET, 10) : 16602,
      accounts: process.env.OG_STORAGE_PRIVATE_KEY ? [process.env.OG_STORAGE_PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      'og-mainnet': 'no-api-key-needed' // 0G mainnet doesn't require API key
    },
    customChains: [
      {
        network: 'og-mainnet',
        chainId: 16661,
        urls: {
          apiURL: 'https://chainscan.0g.ai/api',
          browserURL: 'https://chainscan.0g.ai'
        }
      }
    ]
  }
};