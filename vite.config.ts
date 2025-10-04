import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util', 'stream', 'crypto'],
      globals: { 
        Buffer: true, 
        process: true 
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: { 
    'process.env': {} 
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