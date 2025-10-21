import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { type AppKitNetwork } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { WagmiProvider } from "wagmi";
import { ogGalileo } from "./networks";

const projectId = import.meta.env.VITE_WC_PROJECT_ID || "your-project-id";

function getOrigin() {
  if (typeof window !== "undefined" && window.location?.origin)
    return window.location.origin;
  return import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://dara-forge.vercel.app";
}

const metadata = {
  name: "DARA Forge",
  description: "Decentralized AI Research Assistant",
  url: getOrigin(),
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [ogGalileo];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  defaultNetwork: ogGalileo,
  features: { analytics: true },
  themeVariables: {
    "--w3m-z-index": 99999,
  },
});

// 6. Create query client
const queryClient = new QueryClient();

export function WalletProviders({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export const wagmiConfig = wagmiAdapter.wagmiConfig;
export { modal };
