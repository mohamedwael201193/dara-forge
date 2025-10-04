import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Specific options to ensure Web3 libraries work
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['@0glabs/0g-ts-sdk']
  },
  build: {
    rollupOptions: {
      external: ['@0glabs/0g-ts-sdk']
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});