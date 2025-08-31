
import { OGChainService } from '../0gChain'

interface WalletConnection {
  address: string
  provider: any
  isConnected: boolean
  chainId: number
}

export class WalletAuth {
  private connection: WalletConnection | null = null
  private ogChain: OGChainService

  constructor() {
    this.ogChain = new OGChainService()
  }

  async connectWallet(): Promise<WalletConnection> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask.')
      }

      console.log('Connecting to MetaMask...')
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      const provider = window.ethereum
      const chainId = await provider.request({ method: 'eth_chainId' })

      this.connection = {
        address: accounts[0],
        provider,
        isConnected: true,
        chainId: parseInt(chainId, 16)
      }

      console.log('Initializing 0G Chain service...')
      await this.ogChain.initialize(provider)

      console.log('Wallet connected successfully:', accounts[0])
      
      this.setupEventListeners()

      return this.connection
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  private setupEventListeners(): void {
    if (!window.ethereum) return

    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
      if (accounts.length === 0) {
        await this.disconnect()
      } else if (this.connection) {
        this.connection.address = accounts[0]
        await this.ogChain.initialize(window.ethereum)
      }
    })

    window.ethereum.on('chainChanged', async (chainId: string) => {
      if (this.connection) {
        this.connection.chainId = parseInt(chainId, 16)
        await this.ogChain.initialize(window.ethereum)
      }
    })
  }

  async disconnect(): Promise<void> {
    this.connection = null
    console.log('Wallet disconnected')
  }

  getConnection(): WalletConnection | null {
    return this.connection
  }

  isOnOGNetwork(): boolean {
    return this.connection?.chainId === 16601
  }

  getChainService(): OGChainService {
    return this.ogChain
  }



  areServicesReady(): boolean {
    // Only check chain service as storage is now function-based
    return this.ogChain.isInitialized()
  }
}


