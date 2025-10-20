// server.js - Simple Express server for Render deployment
import { Indexer, ZgFile } from '@0glabs/0g-ts-sdk';
import cors from 'cors';
import 'dotenv/config';
import { ethers } from 'ethers';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import os from 'os';
import path from 'path';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// CORS - Allow Vercel domain and localhost
const allowedOrigins = [
  'https://dara-forge.vercel.app',
  'https://dara-forge.up.railway.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174' // Vite alternative port
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from origin ${origin}.`;
      console.warn('⚠️ CORS blocked:', origin);
      return callback(new Error(msg), false);
    }
    console.log('✅ CORS allowed:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Wallet-Address', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

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

// Debug endpoint
app.get('/debug', (req, res) => {
  res.json({
    headers: req.headers,
    origin: req.get('origin'),
    timestamp: new Date().toISOString()
  });
});

// Storage upload - REAL 0G STORAGE IMPLEMENTATION
app.post('/api/storage/upload', upload.array('file'), async (req, res) => {
  console.log('📤 Storage upload request received');
  console.log('Origin:', req.get('origin'));
  console.log('Files count:', req.files ? req.files.length : 0);
  
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      console.log('❌ No files in request');
      return res.status(400).json({ ok: false, message: 'No files uploaded' });
    }

    // Get wallet address from header
    const walletAddress = req.headers['x-wallet-address'];
    if (!walletAddress) {
      return res.status(401).json({ 
        ok: false, 
        message: 'Missing X-Wallet-Address header. Please connect wallet.' 
      });
    }

    console.log('✅ Processing', files.length, 'file(s) for wallet:', walletAddress);

    // Get 0G configuration from environment
    const indexerBase = process.env.OG_INDEXER_RPC || 'https://indexer-storage-galileo-turbo.0g.ai';
    const rpc = process.env.OG_RPC_URL || 'https://evmrpc-galileo.0g.ai';
    const priv = process.env.OG_STORAGE_PRIVATE_KEY;

    if (!priv) {
      console.error('❌ Missing OG_STORAGE_PRIVATE_KEY environment variable');
      return res.status(500).json({ 
        ok: false, 
        message: 'Server configuration error: Missing storage private key' 
      });
    }

    // Initialize 0G SDK
    const indexer = new Indexer(indexerBase);
    const provider = new ethers.JsonRpcProvider(rpc);
    const signer = new ethers.Wallet(priv, provider);

    // Write file to temporary location (needed by ZgFile.fromFilePath)
    const tempFiles = [];
    try {
      for (const file of files) {
        const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.originalname}`);
        fs.writeFileSync(tempPath, file.buffer);
        tempFiles.push({ path: tempPath, name: file.originalname });
      }

      if (tempFiles.length === 1) {
        // Single file upload
        console.log('📤 Uploading single file to 0G Storage...');
        const zgFile = await ZgFile.fromFilePath(tempFiles[0].path);
        
        try {
          const [result, error] = await indexer.upload(zgFile, rpc, signer);
          
          if (error) {
            console.error('❌ 0G Upload error:', error);
            throw error;
          }
          
          console.log('✅ Upload successful! Root:', result?.rootHash);
          return res.json({
            ok: true,
            root: result?.rootHash,
            indexerTx: result?.txHash,
            mode: 'single',
            fileName: tempFiles[0].name,
            timestamp: new Date().toISOString()
          });
        } finally {
          await zgFile.close();
        }
      } else {
        // Multiple files - directory upload
        console.log('📤 Uploading', tempFiles.length, 'files as directory to 0G Storage...');
        const dir = new Map();
        const zgFiles = [];
        
        try {
          for (const f of tempFiles) {
            const zgFile = await ZgFile.fromFilePath(f.path);
            dir.set(f.name, zgFile);
            zgFiles.push(zgFile);
          }
          
          const [result, error] = await indexer.uploadDirectory(dir, { evmRpc: rpc, signer });
          
          if (error) {
            console.error('❌ 0G Directory upload error:', error);
            throw error;
          }
          
          console.log('✅ Directory upload successful! Root:', result?.rootHash);
          return res.json({
            ok: true,
            root: result?.rootHash,
            indexerTx: result?.txHash,
            mode: 'directory',
            fileCount: tempFiles.length,
            timestamp: new Date().toISOString()
          });
        } finally {
          for (const zgFile of zgFiles) {
            await zgFile.close().catch(() => {});
          }
        }
      }
    } finally {
      // Clean up temp files
      for (const f of tempFiles) {
        try {
          fs.unlinkSync(f.path);
        } catch (e) {
          console.warn('Failed to delete temp file:', f.path);
        }
      }
    }
  } catch (error) {
    console.error('💥 Upload error:', error);
    res.status(500).json({ ok: false, message: error.message || 'Upload failed' });
  }
});

// Storage utils
app.get('/api/storage-utils', async (req, res) => {
  const { action } = req.query;
  
  if (action === 'health') {
    res.json({ 
      ok: true, 
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } else if (action === 'status') {
    const { root } = req.query;
    res.json({ 
      ok: true, 
      root: root || 'test',
      status: 'available',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(400).json({ 
      ok: false, 
      message: 'Invalid action. Use ?action=health or ?action=status' 
    });
  }
});

// Storage resolve endpoint
app.get('/api/storage/resolve', (req, res) => {
  try {
    const { root, name } = req.query;
    res.json({
      ok: true,
      root: root || 'mock-root',
      name: name || 'dataset',
      url: `https://mock-storage.example.com/${root || 'test'}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Storage resolve error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// OG Verify endpoint
app.get('/api/og-verify', async (req, res) => {
  try {
    const { root, wait_ms = 5000 } = req.query;
    // Mock verification response
    res.json({
      ok: true,
      verified: true,
      root: root || 'mock-root',
      timestamp: new Date().toISOString(),
      wait_ms: parseInt(wait_ms)
    });
  } catch (error) {
    console.error('OG verify error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Compute GET endpoint (for health, result, diagnostics)
app.get('/api/compute', async (req, res) => {
  try {
    const { action, id } = req.query;
    
    if (action === 'health') {
      res.json({
        ok: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
      });
    } else if (action === 'result') {
      res.json({
        ok: true,
        content: `Mock analysis result for job ${id || 'unknown'}. This is a comprehensive analysis response from the 0G Compute network.`,
        provider: '0xMockProvider',
        model: 'mock-llama-3.3-70b',
        verified: false,
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150
        },
        timestamp: new Date().toISOString()
      });
    } else if (action === 'diagnostics') {
      res.json({
        ok: true,
        status: 'operational',
        services: ['compute', 'storage', 'network'],
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ ok: false, message: 'Invalid action parameter' });
    }
  } catch (error) {
    console.error('Compute GET error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Compute health
app.get('/api/compute-health', async (req, res) => {
  res.json({
    status: 'healthy',
    sdk: '0G Compute SDK available',
    timestamp: new Date().toISOString()
  });
});

// Compute analyze
app.post('/api/compute', async (req, res) => {
  console.log('📥 Received compute request:', { 
    body: req.body ? Object.keys(req.body) : 'empty',
    query: req.query,
    headers: req.headers['content-type']
  });
  
  try {
    const { text, action } = req.body;
    
    if (action === 'health' || req.query.action === 'health') {
      console.log('✅ Health check request');
      return res.json({
        status: 'healthy',
        sdk: '0G Compute SDK available',
        timestamp: new Date().toISOString()
      });
    }
    
    if (!text) {
      return res.status(400).json({
        ok: false,
        message: 'Text is required'
      });
    }

    // Mock AI analysis response with jobId
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.json({
      ok: true,
      jobId: jobId,
      message: 'Analysis started successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Compute error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Compute analyze (alternative endpoint)
app.post('/api/compute/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        ok: false,
        message: 'Text is required'
      });
    }

    // Mock AI analysis response with jobId
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.json({
      ok: true,
      jobId: jobId,
      message: 'Analysis started successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Compute analyze error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// DA publish
app.post('/api/da', async (req, res) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ ok: false, message: 'Data is required' });
    }

    res.json({ 
      ok: true, 
      message: 'Data published to 0G DA network successfully',
      result: {
        blobHash: '0x' + 'mock'.repeat(16),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('DA error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Anchor
app.post('/api/anchor', async (req, res) => {
  try {
    const { rootHash } = req.body;
    if (!rootHash) {
      return res.status(400).json({ ok: false, message: 'rootHash is required' });
    }

    res.json({ 
      ok: true, 
      message: 'Data anchored on blockchain successfully',
      txHash: '0x' + 'mock'.repeat(16),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Anchor error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Attest
app.post('/api/attest', async (req, res) => {
  try {
    const { root, message, signature } = req.body;
    if (!root || !message || !signature) {
      return res.status(400).json({ 
        ok: false, 
        message: 'root, message, signature required' 
      });
    }

    res.json({ 
      ok: true, 
      message: 'Attestation stored successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Attest error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Verify endpoints
app.get('/api/verify/storage', async (req, res) => {
  const { root } = req.query;
  res.json({ 
    ok: true, 
    verified: true,
    root: root || 'test',
    status: 'available',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/verify/da', async (req, res) => {
  const { blob } = req.query;
  res.json({ 
    ok: true, 
    verified: true,
    blob: blob || 'test',
    status: 'available',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/verify/chain', async (req, res) => {
  const { tx } = req.query;
  res.json({ 
    ok: true, 
    verified: true,
    tx: tx || 'test',
    status: 'confirmed',
    timestamp: new Date().toISOString()
  });
});

// Chain verification endpoint
app.post('/api/chain/verify', async (req, res) => {
  try {
    const { transactionHash, expectedRoot } = req.body;
    res.json({
      ok: true,
      verified: true,
      transactionHash: transactionHash || 'mock-tx-hash',
      expectedRoot: expectedRoot || 'mock-root',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chain verify error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Compute verification endpoint
app.post('/api/compute/verify', async (req, res) => {
  try {
    const { jobId, endpoint } = req.body;
    res.json({
      ok: true,
      verified: true,
      jobId: jobId || 'mock-job-id',
      endpoint: endpoint || 'mock-endpoint',
      result: 'Mock computation verification result',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Compute verify error:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404:', req.method, req.originalUrl);
  res.status(404).json({
    ok: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Global error handler:', err);
  console.error('Request:', req.method, req.originalUrl);
  console.error('Body:', req.body);
  
  res.status(500).json({
    ok: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`🚀 DARA API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
});