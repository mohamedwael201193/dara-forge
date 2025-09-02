import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,

    // Removed proxy for Vercel deployment, as it's only for local development
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ["crypto", "buffer", "stream", "util", "events"],
      globals: { Buffer: true, process: true }
    })
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

    },
  },
  define: {
    global: "globalThis",
    "process.env": {},
  },
  optimizeDeps: {
    exclude: ["@0glabs/0g-ts-sdk", "@0glabs/0g-serving-broker"],
    esbuildOptions: {
      // Define global for browser compatibility
      define: {
        global: 'globalThis'
      }
    },
    include: ["buffer", "process"]
  },
  build: {
    sourcemap: true, // temporary while polishing
    rollupOptions: {
      external: ["@0glabs/0g-ts-sdk", "@0glabs/0g-serving-broker", "child_process", "fs", "path", "crypto"],
      output: {
        // Ensure server-only modules are not bundled for client
        manualChunks: (id) => {
          if (id.includes("@0glabs/0g-serving-broker")) {
            return "server-only";
          }
        }
      }
    },
    commonjsOptions: {
      ignoreTryCatch: true
    }
  }
});

