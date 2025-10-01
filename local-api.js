const express = require('express');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Mock upload endpoint
app.post('/api/storage/upload', upload.single('file'), (req, res) => {
  console.log('Received upload request:', {
    name: req.body.name,
    fileSize: req.file?.size,
    fileName: req.file?.originalname
  });

  // Mock successful response
  res.json({
    ok: true,
    tx: '0x' + Math.random().toString(16).substr(2, 64),
    root: '0x' + Math.random().toString(16).substr(2, 64),
    message: 'File uploaded successfully (mock response)'
  });
});

// Health check endpoint
app.get('/api/storage/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local API server is running' });
});

app.listen(port, () => {
  console.log(`Local API server running at http://localhost:${port}`);
  console.log(`Upload endpoint: http://localhost:${port}/api/storage/upload`);
});
