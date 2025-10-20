// Minimal server.js for testing
import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();

// Simple CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
});