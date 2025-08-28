import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// For now, we'll keep the simple setup without wagmi due to installation issues
// The WalletConnect component will handle wallet connections directly with window.ethereum

import { WalletProviders } from './lib/wallet'
import { initializeErrorSuppression } from './utils/errorSuppression'

import ErrorBoundary from './components/ErrorBoundary';

// Initialize error suppression for non-critical console errors
initializeErrorSuppression()

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WalletProviders>
        <App />
      </WalletProviders>
    </ErrorBoundary>
  </React.StrictMode>
);


