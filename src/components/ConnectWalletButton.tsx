import { useWeb3Modal } from '@web3modal/wagmi/react'
import { Button } from "@/components/ui/button"

export function ConnectWalletButton() {
  const { open } = useWeb3Modal()
  return <Button onClick={() => open()} className="btn btn-primary">Connect Wallet</Button>
}

