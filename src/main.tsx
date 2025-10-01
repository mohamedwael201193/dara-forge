import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// For now, we'll keep the simple setup without wagmi due to installation issues
// The WalletConnect component will handle wallet connections directly with window.ethereum

import { WalletProviders } from './lib/wallet';

import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WalletProviders>
        <App />
      </WalletProviders>
    </ErrorBoundary>
  </React.StrictMode>
);


