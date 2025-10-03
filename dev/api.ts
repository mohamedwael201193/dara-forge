import cors from 'cors';
import 'dotenv/config';
import express from 'express';

import anchorHandler from '../api/anchor';
import attestHandler from '../api/attest';
import computeHandler from '../api/compute';
import proxyHandler from '../api/storage/proxy';
import uploadHandler from '../api/storage/upload';

const app = express();

// generic middlewares (multipart routes parse in their own handler)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Bridge Express req/res to Vercel-style handlers
app.all('/api/storage/upload', (req, res) => uploadHandler(req as any, res as any));
app.all('/api/storage/proxy', (req, res) => proxyHandler(req as any, res as any));
app.all('/api/anchor', (req, res) => anchorHandler(req as any, res as any));
app.all('/api/attest', (req, res) => attestHandler(req as any, res as any));
app.all('/api/compute', (req, res) => computeHandler(req as any, res as any));

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Dev API server listening on http://localhost:${PORT}`);
});