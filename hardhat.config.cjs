require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    galileo: {
      url: process.env.OG_RPC_URL || "https://evmrpc-testnet.0g.ai/",
      chainId: 16602,
      accounts: process.env.OG_STORAGE_PRIVATE_KEY ? [process.env.OG_STORAGE_PRIVATE_KEY] : []
    }
  }
};