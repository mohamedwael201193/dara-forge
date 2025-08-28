import { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { formatEther } from 'viem'

const ZERO_G_CHAIN_ID = 16601

export function useWalletBalance() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOnZeroGChain, setIsOnZeroGChain] = useState(false)
  const [balanceDisplay, setBalanceDisplay] = useState<string>('0.00')
  const [isLoading, setIsLoading] = useState(false)

  // Check if wallet is on 0G Chain
  useEffect(() => {
    setIsOnZeroGChain(chainId === ZERO_G_CHAIN_ID)
  }, [chainId])

  // Get balance from 0G Chain
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useBalance({
    address,
    chainId: ZERO_G_CHAIN_ID,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 10000, // Refetch every 10 seconds
    }
  })

  // Format balance display
  useEffect(() => {
    if (balance) {
      const formatted = formatEther(balance.value)
      const truncated = parseFloat(formatted).toFixed(4)
      setBalanceDisplay(truncated)
    } else {
      setBalanceDisplay('0.0000')
    }
  }, [balance])

  // Switch to 0G Chain
  const switchToZeroGChain = async () => {
    if (!isConnected) return
    
    setIsLoading(true)
    try {
      await switchChain({ chainId: ZERO_G_CHAIN_ID })
    } catch (error) {
      console.error('Failed to switch to 0G Chain:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    address,
    isConnected,
    chainId,
    isOnZeroGChain,
    balance: balanceDisplay,
    balanceLoading,
    isLoading,
    switchToZeroGChain,
    refetchBalance,
    zeroGChainId: ZERO_G_CHAIN_ID
  }
}

