// src/components/ConnectWalletButton.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

export default function ConnectWalletButton() {
  const handleConnect = async () => {
    try {
      // Simple wallet connection using window.ethereum
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        // Force page refresh to update connection state
        window.location.reload();
      } else {
        alert('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const checkConnection = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum.selectedAddress;
    }
    return null;
  };

  const connectedAddress = checkConnection();

  if (connectedAddress) {
    return (
      <Button 
        variant="outline" 
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        {connectedAddress.slice(0, 6)}…{connectedAddress.slice(-4)}
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      Connect Wallet
    </Button>
  );
}

