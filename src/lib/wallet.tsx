import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiConfig } from 'wagmi'
import { http } from 'viem'
import { ogGalileo } from '../chains/ogGalileo'

const projectId = import.meta.env.VITE_WC_PROJECT_ID as string
const metadata = {
  name: 'DARA Forge',
  description: 'Decentralized AI Research Assistant',
  url: 'https://dara-forge.vercel.app',
  icons: ['https://dara-forge.vercel.app/icon.png']
}

const chains = [ogGalileo]
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  transports: { [ogGalileo.id]: http('https://16601.rpc.thirdweb.com/') }
})

createWeb3Modal({ wagmiConfig, projectId, chains })

const queryClient = new QueryClient()

export function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  )
}

