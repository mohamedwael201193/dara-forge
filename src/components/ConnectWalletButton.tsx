import React from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, User } from '@/lib/icons';

const ConnectWalletButton: React.FC = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Connected
        </Badge>
        <Button
          onClick={() => open()}
          className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          {formatAddress(address)}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => open()}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
};

export default ConnectWalletButton;

