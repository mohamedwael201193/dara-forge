import { getPublicClient, getWalletClient, writeContract } from 'wagmi/actions'
import DARA_ABI from '../abi/Dara.json'
import { ogGalileo } from '../chains/ogGalileo'

export async function anchorRoot(rootHash: `0x${string}`) {
  const publicClient = getPublicClient()
  if (publicClient?.chain?.id !== ogGalileo.id) throw new Error("Wrong network")
  const walletClient = await getWalletClient()
  const hash = await writeContract({
    address: import.meta.env.VITE_DARA_CONTRACT as `0x${string}`,
    abi: DARA_ABI,
    functionName: "anchorData", // adjust if your ABI uses another name
    args: [rootHash]
  })
  return hash
}

