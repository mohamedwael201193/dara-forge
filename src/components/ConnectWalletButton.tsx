// src/components/ConnectWalletButton.tsx
import React from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Button } from '@/components/ui/button';

export default function ConnectWalletButton() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();

  if (isConnected) {
    return (
      <Button variant="outline" onClick={() => open({ view: 'Account', namespace: 'eip155' })}>
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </Button>
    );
  }

  return (
    <Button onClick={() => open({ view: 'Connect', namespace: 'eip155' })}>
      Connect Wallet
    </Button>
  );
}

