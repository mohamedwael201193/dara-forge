import { OGStorageService } from '../0gStorage'
import { OGChainService } from '../0gChain'

interface WalletConnection {
  address: string
  provider: any
  isConnected: boolean
  chainId: number
}

export class WalletAuth {
  private connection: WalletConnection | null = null
  private ogStorage: OGStorageService
  private ogChain: OGChainService

  constructor() {
    this.ogStorage = new OGStorageService()
    this.ogChain = new OGChainService()
  }

  // FIXED: Complete wallet connection with 0G service initialization
  async connectWallet(): Promise<WalletConnection> {
    try {
      // Check if MetaMask is available
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.')
      }

      console.log('Connecting to MetaMask...')
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Get provider info
      const provider = window.ethereum
      const chainId = await provider.request({ method: 'eth_chainId' })

      this.connection = {
        address: accounts[0],
        provider,
        isConnected: true,
        chainId: parseInt(chainId, 16)
      }

      // CRITICAL: Initialize 0G services with wallet
      console.log('Initializing 0G services...')
      await this.ogStorage.initialize(provider)
      await this.ogChain.initialize(provider)

      console.log('Wallet connected successfully:', accounts[0])
      
      // Listen for account/network changes
      this.setupEventListeners()

      return this.connection
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  // FIXED: Proper event handling
  private setupEventListeners(): void {
    if (!window.ethereum) return

    // Handle account changes
    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      if (accounts.length === 0) {
        await this.disconnect()
      } else if (this.connection) {
        this.connection.address = accounts[0]
        // Reinitialize services with new account
        await this.ogStorage.initialize(window.ethereum)
        await this.ogChain.initialize(window.ethereum)
      }
    })

    // Handle network changes
    window.ethereum.on('chainChanged', async (chainId: string) => {
      if (this.connection) {
        this.connection.chainId = parseInt(chainId, 16)
        // Reinitialize services for new network
        await this.ogStorage.initialize(window.ethereum)
        await this.ogChain.initialize(window.ethereum)
      }
    })
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    this.connection = null
    console.log('Wallet disconnected')
  }

  // Get current connection
  getConnection(): WalletConnection | null {
    return this.connection
  }

  // Check if connected to 0G network
  isOnOGNetwork(): boolean {
    return this.connection?.chainId === 16601
  }

  // Get 0G services
  getStorageService(): OGStorageService {
    return this.ogStorage
  }

  getChainService(): OGChainService {
    return this.ogChain
  }

  // Check if services are ready
  areServicesReady(): boolean {
    return this.ogStorage.isInitialized() && this.ogChain.isInitialized()
  }
}

