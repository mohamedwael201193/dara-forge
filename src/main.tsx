import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// For now, we'll keep the simple setup without wagmi due to installation issues
// The WalletConnect component will handle wallet connections directly with window.ethereum

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Trigger Vercel redeploy

