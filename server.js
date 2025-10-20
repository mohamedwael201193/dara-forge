// server.js - Standalone API server for Render
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'DARA API Server'
  });
});

// Import existing Vercel API handlers and adapt them
const importHandler = (filePath) => {
  try {
    delete require.cache[require.resolve(filePath)];
    return require(filePath);
  } catch (error) {
    console.error(`Failed to import ${filePath}:`, error);
    return null;
  }
};

// Wrapper to convert Vercel handlers to Express
const adaptVercelHandler = (handler) => {
  return async (req, res) => {
    try {
      // Create Vercel-compatible request/response objects
      const vercelReq = {
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        headers: req.headers
      };
      
      const vercelRes = {
        statusCode: 200,
        headers: {},
        setHeader(key, value) {
          this.headers[key] = value;
          return this;
        },
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.data = data;
          return this;
        }
      };
      
      await handler.default(vercelReq, vercelRes);
      
      // Send Express response
      Object.keys(vercelRes.headers).forEach(key => {
        res.setHeader(key, vercelRes.headers[key]);
      });
      
      res.status(vercelRes.statusCode).json(vercelRes.data);
    } catch (error) {
      console.error('Handler error:', error);
      res.status(500).json({ 
        ok: false, 
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
};

// Mount existing API routes using the actual Vercel handlers
const anchorHandler = importHandler('./api/anchor');
const attestHandler = importHandler('./api/attest');
const computeHandler = importHandler('./api/compute');
const computeHealthHandler = importHandler('./api/compute-health');
const daHandler = importHandler('./api/da');
const storageUtilsHandler = importHandler('./api/storage-utils');

// Route all methods to handlers
if (anchorHandler) {
  app.all('/api/anchor', adaptVercelHandler(anchorHandler));
}

if (attestHandler) {
  app.all('/api/attest', adaptVercelHandler(attestHandler));
}

if (computeHandler) {
  app.all('/api/compute', adaptVercelHandler(computeHandler));
}

if (computeHealthHandler) {
  app.all('/api/compute-health', adaptVercelHandler(computeHealthHandler));
}

if (daHandler) {
  app.all('/api/da', adaptVercelHandler(daHandler));
}

if (storageUtilsHandler) {
  app.all('/api/storage-utils', adaptVercelHandler(storageUtilsHandler));
}

// Handle subdirectory routes by importing and adapting them
const fs = require('fs');

// Compute routes
if (fs.existsSync('./api/compute')) {
  const computeFiles = fs.readdirSync('./api/compute');
  computeFiles.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const routeName = path.parse(file).name;
      const handler = importHandler(`./api/compute/${file}`);
      if (handler) {
        app.all(`/api/compute/${routeName}`, adaptVercelHandler(handler));
      }
    }
  });
}

// DA routes
if (fs.existsSync('./api/da')) {
  const daFiles = fs.readdirSync('./api/da');
  daFiles.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const routeName = path.parse(file).name;
      const handler = importHandler(`./api/da/${file}`);
      if (handler) {
        app.all(`/api/da/${routeName}`, adaptVercelHandler(handler));
      }
    }
  });
}

// Storage routes
if (fs.existsSync('./api/storage')) {
  const storageFiles = fs.readdirSync('./api/storage');
  storageFiles.forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const routeName = path.parse(file).name;
      const handler = importHandler(`./api/storage/${file}`);
      if (handler) {
        app.all(`/api/storage/${routeName}`, adaptVercelHandler(handler));
      }
    }
  });
}

// Catch-all for unhandled routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    ok: false,
    message: `API endpoint not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 DARA API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base: http://localhost:${PORT}/api`);
});