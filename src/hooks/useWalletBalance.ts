import { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId, useSwitchChain } from 'wagmi'
import { formatEther } from 'viem'

const ZERO_G_CHAIN_ID = 16601

export function useWalletBalance() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [isOnZeroGChain, setIsOnZeroGChain] = useState(false)
  const [balanceDisplay, setBalanceDisplay] = useState<string>('0.0000')
  const [isLoading, setIsLoading] = useState(false)
  const [actualBalance, setActualBalance] = useState<string>('0.0000')

  // Check if wallet is on 0G Chain
  useEffect(() => {
    const onCorrectChain = chainId === ZERO_G_CHAIN_ID
    setIsOnZeroGChain(onCorrectChain)
    
    // Reset balance display when not on correct chain
    if (!onCorrectChain) {
      setBalanceDisplay('0.0000')
      setActualBalance('0.0000')
    }
  }, [chainId])

  // Get balance from 0G Chain ONLY when connected to the correct chain
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance, error } = useBalance({
    address,
    chainId: ZERO_G_CHAIN_ID,
    query: {
      enabled: isConnected && !!address && chainId === ZERO_G_CHAIN_ID,
      refetchInterval: isOnZeroGChain ? 10000 : false, // Only refetch when on correct chain
      retry: false, // Don't retry if not on correct chain
    }
  })

  // Format balance display - only when we have valid data from correct chain
  useEffect(() => {
    if (balance && chainId === ZERO_G_CHAIN_ID) {
      const formatted = formatEther(balance.value)
      const truncated = parseFloat(formatted).toFixed(4)
      setBalanceDisplay(truncated)
      setActualBalance(truncated)
    } else {
      // Show 0 when not on correct chain or no balance data
      setBalanceDisplay('0.0000')
      setActualBalance('0.0000')
    }
  }, [balance, chainId])

  // Handle balance fetch errors
  useEffect(() => {
    if (error && chainId === ZERO_G_CHAIN_ID) {
      console.warn('Failed to fetch 0G balance:', error)
      setBalanceDisplay('Error')
      setActualBalance('0.0000')
    }
  }, [error, chainId])

  // Switch to 0G Chain
  const switchToZeroGChain = async () => {
    if (!isConnected) return
    
    setIsLoading(true)
    try {
      await switchChain({ chainId: ZERO_G_CHAIN_ID })
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
    chainId,
    isOnZeroGChain,
    balance: balanceDisplay,
    actualBalance,
    balanceLoading: balanceLoading && chainId === ZERO_G_CHAIN_ID,
    isLoading,
    switchToZeroGChain,
    refetchBalance,
    zeroGChainId: ZERO_G_CHAIN_ID,
    hasError: !!error
  }
}

