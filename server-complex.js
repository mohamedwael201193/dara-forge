// server.js - Standalone API server for Render
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';

// Import your existing API handlers (TypeScript files)
import anchorHandler from './api/anchor.ts';
import attestHandler from './api/attest.ts';
import computeHealthHandler from './api/compute-health.ts';
import computeHandler from './api/compute.ts';
import analyzeHandler from './api/compute/analyze.ts';
import daHandler from './api/da.ts';
import publishHandler from './api/da/publish.ts';
import verifyHandler from './api/da/verify.ts';
import storageUtilsHandler from './api/storage-utils.ts';
import downloadHandler from './api/storage/download.ts';
import proxyHandler from './api/storage/proxy.ts';
import resolveHandler from './api/storage/resolve.ts';
import uploadHandler from './api/storage/upload.ts';

config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS for frontend domain
app.use(cors({
  origin: [
    'https://dara-forge.vercel.app', // Your Vercel domain
    'http://localhost:5173',        // Local dev
    'http://localhost:4173',        // Local preview
  ],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Wrapper to convert Vercel handlers to Express
const wrapHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, message: error.message });
    }
  }
};

// Main API routes
app.all('/api/anchor', wrapHandler(anchorHandler));
app.all('/api/attest', wrapHandler(attestHandler));
app.all('/api/compute', wrapHandler(computeHandler));
app.all('/api/compute-health', wrapHandler(computeHealthHandler));
app.all('/api/da', wrapHandler(daHandler));
app.all('/api/storage-utils', wrapHandler(storageUtilsHandler));

// Storage routes
app.all('/api/storage/upload', wrapHandler(uploadHandler));
app.all('/api/storage/proxy', wrapHandler(proxyHandler));
app.all('/api/storage/resolve', wrapHandler(resolveHandler));
app.all('/api/storage/download', wrapHandler(downloadHandler));

// Compute sub-routes
app.all('/api/compute/analyze', wrapHandler(analyzeHandler));

// DA sub-routes
app.all('/api/da/publish', wrapHandler(publishHandler));
app.all('/api/da/verify', wrapHandler(verifyHandler));

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ ok: false, message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DARA API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});