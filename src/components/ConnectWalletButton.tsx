// src/components/ConnectWalletButton.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ConnectWalletButton() {
  const [isAppKitReady, setIsAppKitReady] = useState(false);
  const [appKit, setAppKit] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    // Wait for AppKit to be available
    const checkAppKit = async () => {
      try {
        const { useAppKit, useAppKitAccount } = await import('@reown/appkit/react');
        setAppKit({ useAppKit, useAppKitAccount });
        setIsAppKitReady(true);
      } catch (error) {
        console.warn('AppKit not available:', error);
        // Retry after a delay
        setTimeout(checkAppKit, 1000);
      }
    };

    checkAppKit();
  }, []);

  useEffect(() => {
    if (isAppKitReady && appKit) {
      try {
        const { useAppKitAccount } = appKit;
        const accountData = useAppKitAccount();
        setAccount(accountData);
      } catch (error) {
        console.warn('Failed to get account data:', error);
      }
    }
  }, [isAppKitReady, appKit]);

  const handleConnect = async () => {
    if (appKit) {
      try {
        const { useAppKit } = appKit;
        const { open } = useAppKit();
        open({ view: 'Connect', namespace: 'eip155' });
      } catch (error) {
        console.warn('Failed to open connect modal:', error);
      }
    }
  };

  const handleAccount = async () => {
    if (appKit) {
      try {
        const { useAppKit } = appKit;
        const { open } = useAppKit();
        open({ view: 'Account', namespace: 'eip155' });
      } catch (error) {
        console.warn('Failed to open account modal:', error);
      }
    }
  };

  if (!isAppKitReady) {
    return (
      <Button disabled className="bg-blue-600 hover:bg-blue-700">
        Wallet Loading...
      </Button>
    );
  }

  if (account?.isConnected) {
    return (
      <Button 
        variant="outline" 
        onClick={handleAccount}
        className="border-blue-500 text-blue-600 hover:bg-blue-50"
      >
        {account.address?.slice(0, 6)}…{account.address?.slice(-4)}
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

