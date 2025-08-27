// src/lib/anchor.ts
import daraAbi from "@/abi/Dara.json";

const CONTRACT = import.meta.env.VITE_DARA_CONTRACT as `0x${string}` | undefined;

/**
 * Anchor a dataset root on-chain (stub implementation).
 * Returns a mock transaction hash for demo purposes.
 */
export async function anchorData(root: `0x${string}`): Promise<string> {
  if (!CONTRACT) {
    console.warn("Missing VITE_DARA_CONTRACT env var, using mock implementation");
  }
  
  // Mock implementation for demo purposes
  // In a real implementation, this would interact with the blockchain
  const mockTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log(`Mock anchor transaction for root ${root}: ${mockTxHash}`);
  return mockTxHash;
}

export { daraAbi };

