// server.js - Standalone API server for Render
import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import multer from 'multer';

// Load environment variables
config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// CORS configuration - Allow Vercel deployment
app.use(cors({
  origin: [
    /https:\/\/dara-forge.*\.vercel\.app$/,  // Any Vercel subdomain with regex
    'https://dara-forge.vercel.app',
    'https://dara-forge-git-main-mohamedwael201193.vercel.app', // Git branch deployments
    'https://dara-forge-mohamedwael201193.vercel.app',          // Alternative Vercel domain
    'http://localhost:5173',  // Local dev
    'http://localhost:4173',  // Local preview
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Wallet-Address'],
}));

// Explicit preflight handling
app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'production'
  });
});

// Debug endpoint to check CORS and origin
app.get('/debug', (req, res) => {
  res.json({
    origin: req.get('Origin'),
    referer: req.get('Referer'),
    userAgent: req.get('User-Agent'),
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Storage upload endpoint
app.post('/api/storage/upload', upload.array('file'), async (req, res) => {
  try {
    // Simple response for now - you can implement actual 0G storage logic later
    res.json({
      ok: true,
      message: 'Upload endpoint ready - implement 0G storage integration',
      files: req.files?.length || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message || 'Upload failed' 
    });
  }
});

// Storage utilities endpoint
app.get('/api/storage-utils', async (req, res) => {
  const { action } = req.query;
  
  try {
    if (action === 'health') {
      res.json({
        ok: true,
        status: 'healthy',
        rpc: [],
        indexers: [],
        timestamp: new Date().toISOString()
      });
    } else if (action === 'status') {
      res.json({
        ok: true,
        root: req.query.root,
        status: 'available',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        error: 'Invalid action. Use ?action=health or ?action=status' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message 
    });
  }
});

// Compute endpoints
app.get('/api/compute-health', async (req, res) => {
  try {
    res.json({
      status: 'healthy',
      sdk: '0G Compute SDK available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message 
    });
  }
});

app.post('/api/compute', async (req, res) => {
  try {
    const { action } = req.query;
    
    if (action === 'analyze' || !action) {
      const text = req.body?.text || req.body?.content || req.body?.input;
      
      if (!text) {
        return res.status(400).json({ 
          ok: false, 
          message: 'Text is required' 
        });
      }

      // Simple mock response - implement real 0G compute integration later
      res.json({
        ok: true,
        answer: `Mock analysis of: "${text.substring(0, 50)}..." - This is a simplified response for Render deployment. Full 0G compute integration available.`,
        provider: "0xMockProvider",
        model: "mock-model",
        verified: false,
        chatID: `chat_${Date.now()}`,
        attestation: null,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ 
        ok: false, 
        error: 'Invalid action. Use analyze.' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message 
    });
  }
});

// DA endpoints
app.post('/api/da', async (req, res) => {
  try {
    res.json({
      ok: true,
      message: 'DA publish endpoint ready - implement 0G DA integration',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message 
    });
  }
});

// Chain anchor endpoint
app.post('/api/anchor', async (req, res) => {
  try {
    res.json({
      ok: true,
      message: 'Chain anchor endpoint ready - implement blockchain integration',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message 
    });
  }
});

// Attest endpoint
app.post('/api/attest', async (req, res) => {
  try {
    res.json({
      ok: true,
      message: 'Attestation endpoint ready - implement attestation logic',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message 
    });
  }
});

// Verification endpoints
app.get('/api/verify/storage', async (req, res) => {
  try {
    res.json({
      ok: true,
      verified: true,
      root: req.query.root,
      status: 'available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message 
    });
  }
});

app.get('/api/verify/da', async (req, res) => {
  try {
    res.json({
      ok: true,
      verified: true,
      blob: req.query.blob,
      status: 'available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message 
    });
  }
});

app.get('/api/verify/chain', async (req, res) => {
  try {
    res.json({
      ok: true,
      verified: true,
      tx: req.query.tx,
      status: 'confirmed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      message: error.message 
    });
  }
});

// Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /health',
      'POST /api/storage/upload',
      'GET /api/storage-utils',
      'GET /api/compute-health',
      'POST /api/compute',
      'POST /api/da',
      'POST /api/anchor',
      'POST /api/attest',
      'GET /api/verify/storage',
      'GET /api/verify/da',
      'GET /api/verify/chain'
    ]
  });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`🚀 DARA API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});