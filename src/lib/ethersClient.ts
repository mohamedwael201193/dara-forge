import { ethers } from "ethers";

export const DARA_CONTRACT = (process.env.NEXT_PUBLIC_DARA_CONTRACT || "").toLowerCase();
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

export function getBrowserProvider(): ethers.BrowserProvider {
  const eth = (window as any).ethereum;
  if (!eth) throw new Error("No injected wallet found");
  return new ethers.BrowserProvider(eth);
}

export async function getSigner() {
  const provider = getBrowserProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

export function getDaraContract(signerOrProvider: any) {
  return new ethers.Contract(DARA_CONTRACT, DARA_ABI, signerOrProvider);
}


