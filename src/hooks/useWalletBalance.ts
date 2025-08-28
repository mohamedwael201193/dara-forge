import { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { formatEther } from 'viem'

const ZERO_G_CHAIN_ID = 16601

export function useWalletBalance() {
  const { address, isConnected } = useAccount()
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOnZeroGChain, setIsOnZeroGChain] = useState(false)
  const [balanceDisplay, setBalanceDisplay] = useState<string>('0.0000')
  const [isLoading, setIsLoading] = useState(false)

  // Check if wallet is on 0G Chain
  useEffect(() => {
    setIsOnZeroGChain(currentChainId === ZERO_G_CHAIN_ID)
  }, [currentChainId])

  // Get balance from 0G Chain ONLY when connected to the correct chain
  // Use a unique query key to prevent cache conflicts
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance, error } = useBalance({
    address,
    chainId: ZERO_G_CHAIN_ID,
    query: {
      enabled: isConnected && !!address && currentChainId === ZERO_G_CHAIN_ID,
      refetchInterval: isOnZeroGChain ? 10000 : false,
      retry: false,
      // Force fresh data when switching chains
      staleTime: 0,
      gcTime: 0, // Don't cache balance data
    }
  })

  // Format balance display - only when we have valid data from correct chain
  useEffect(() => {
    if (currentChainId !== ZERO_G_CHAIN_ID) {
      // Always show 0 when not on correct chain
      setBalanceDisplay('0.0000')
      return
    }

    if (balance && currentChainId === ZERO_G_CHAIN_ID) {
      const formatted = formatEther(balance.value)
      const truncated = parseFloat(formatted).toFixed(4)
      setBalanceDisplay(truncated)
    } else if (currentChainId === ZERO_G_CHAIN_ID && !balanceLoading) {
      // On correct chain but no balance data and not loading
      setBalanceDisplay('0.0000')
    }
  }, [balance, currentChainId, balanceLoading])

  // Handle balance fetch errors
  useEffect(() => {
    if (error && currentChainId === ZERO_G_CHAIN_ID) {
      console.warn('Failed to fetch 0G balance:', error)
      setBalanceDisplay('Error')
    }
  }, [error, currentChainId])

  // Switch to 0G Chain
  const switchToZeroGChain = async () => {
    if (!isConnected) return
    
    setIsLoading(true)
    try {
      await switchChain({ chainId: ZERO_G_CHAIN_ID })
      // Clear balance display immediately when switching
      setBalanceDisplay('0.0000')
      // Balance will be refetched automatically after chain switch
    } catch (error) {
      console.error('Failed to switch to 0G Chain:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    address,
    isConnected,
    chainId: currentChainId,
    isOnZeroGChain,
    balance: balanceDisplay,
    balanceLoading: balanceLoading && currentChainId === ZERO_G_CHAIN_ID,
    isLoading,
    switchToZeroGChain,
    refetchBalance,
    zeroGChainId: ZERO_G_CHAIN_ID,
    hasError: !!error && currentChainId === ZERO_G_CHAIN_ID
  }
}

