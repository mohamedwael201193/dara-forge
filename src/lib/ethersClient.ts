"use client";

import { ethers } from "ethers";
import { getAccount, getWalletClient } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wallet';

export const DARA_CONTRACT = (import.meta.env.VITE_DARA_CONTRACT || "").toLowerCase();
export const EXPLORER = "https://chainscan-galileo.0g.ai";

export function explorerTxUrl(tx: string) {
  return `${EXPLORER}/tx/${tx}`;
}

export const DARA_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "logId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "fileId", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "LogCreated",
    "type": "event"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_fileId", "type": "string" }],
    "name": "logData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "logCounter",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Returns an EIP-1193 provider backed by the connected wallet
export async function requireEip1193Provider() {
  const account = getAccount(wagmiConfig);
  if (!account.isConnected) throw new Error('Wallet not connected');

  const wc = await getWalletClient(wagmiConfig);
  if (!wc) throw new Error('Wallet client unavailable');

  // viem WalletClient -> EIP-1193 bridge
  const eip1193 = {
    request: async ({ method, params }: { method: string; params?: any[] }) =>
      wc.transport.request({ method, params })
  } as any;

  return eip1193;
}

export async function requireEthersSigner() {
  const eip1193 = await requireEip1193Provider();
  const provider = new ethers.BrowserProvider(eip1193);
  return provider.getSigner();
}

// Legacy functions for backward compatibility - use requireEthersSigner instead
export function getBrowserProvider(): ethers.BrowserProvider {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No injected wallet found");
  return new ethers.BrowserProvider(eth);
}

export async function getSigner() {
  // Use the new AppKit-compatible signer
  return await requireEthersSigner();
}

export function getDaraContract(signerOrProvider: any) {
  return new ethers.Contract(DARA_CONTRACT, DARA_ABI, signerOrProvider);
}







