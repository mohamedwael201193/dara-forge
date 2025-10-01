import { useEffect, useState } from 'react'
import { formatEther } from 'viem'
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'

const ZERO_G_CHAIN_ID = 16602

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

  // Get balance from 0G Chain ONLY when connected to the correct chain AND address
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance, error } = useBalance({
    address,
    chainId: ZERO_G_CHAIN_ID,
    query: {
      // Only fetch when ALL conditions are met:
      // 1. Wallet is connected
      // 2. Address exists
      // 3. Currently on 0G Chain (prevents cross-chain balance pollution)
      enabled: isConnected && !!address && currentChainId === ZERO_G_CHAIN_ID,
      refetchInterval: isOnZeroGChain ? 10000 : false,
      retry: false,
      // Force fresh data when switching chains or addresses
      staleTime: 0,
      gcTime: 0, // Don't cache balance data
    }
  })

  // Format balance display - STRICT validation
  useEffect(() => {
    // Reset to zero immediately when not on correct chain
    if (currentChainId !== ZERO_G_CHAIN_ID) {
      setBalanceDisplay('0.0000')
      return
    }

    // Only show balance when we have valid data AND we're on the correct chain
    if (balance && currentChainId === ZERO_G_CHAIN_ID && isConnected && address) {
      const formatted = formatEther(balance.value)
      const truncated = parseFloat(formatted).toFixed(4)
      setBalanceDisplay(truncated)
    } else if (currentChainId === ZERO_G_CHAIN_ID && !balanceLoading && isConnected && address) {
      // On correct chain, not loading, connected, but no balance data = zero balance
      setBalanceDisplay('0.0000')
    } else {
      // Any other state = show zero
      setBalanceDisplay('0.0000')
    }
  }, [balance, currentChainId, balanceLoading, isConnected, address])

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

