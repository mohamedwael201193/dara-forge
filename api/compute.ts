import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getBroker } from '../src/lib/brokerService.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, type } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt' });
    }

    console.log('Processing 0G Compute request...');

    // Get the broker instance
    const broker = await getBroker();
    
    // Get service details 
    const providerAddress = process.env.ZG_COMPUTE_PROVIDER || "0xf07240Efa67755B5311bc75784a061eDB47165Dd";
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      // Mock response for development
      console.log('Using mock 0G Compute response for development');
      
      return res.status(200).json({
        success: true,
        requestId: `mock-${Date.now()}`,
        response: `**Development Mode - Mock AI Analysis**

This is a simulated response demonstrating the 0G Compute integration. In production, this will be processed by real decentralized AI providers with cryptographic verification.

**Your Input:** "${prompt.substring(0, 150)}${prompt.length > 150 ? '...' : ''}"

**Mock Analysis:**
• Data Quality Assessment: High-quality structured input detected
• Processing Method: Decentralized AI computation via 0G Network
• Verification Status: Cryptographically verified (simulated)
• Response Time: <2 seconds (typical 0G Compute performance)

**Next Steps:**
- Deploy to production to enable real 0G Compute
- Configure provider credentials for live verification
- Experience true decentralized AI with on-chain proofs

*This integration is ready for Wave 3 deployment!*`,
        metadata: {
          model: 'llama-3.3-70b-instruct',
          timestamp: new Date().toISOString(),
          verified: true,
          provider: providerAddress,
          mode: 'development',
          note: 'Mock response - production will use real 0G Compute'
        }
      });
    }
    
    // Production 0G Compute logic
    const endpoint = process.env.ZG_COMPUTE_ENDPOINT || `https://evmrpc-testnet.0g.ai`;
    const model = 'llama-3.3-70b-instruct';
    
    // Get request headers for billing
    const headers = await broker.inference.getRequestHeaders(providerAddress, prompt);
    
    // Prepare OpenAI-compatible request
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: type === 'summarize' 
            ? 'You are a data analysis expert. Analyze the provided dataset and provide insights about data quality, patterns, and potential research applications. Focus on actionable insights.'
            : 'You are a helpful AI assistant. Provide a clear and informative response to the user query.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: model,
      max_tokens: 1000,
      temperature: 0.7
    };

    console.log('Submitting request to 0G Compute provider...');
    
    // Make request to the 0G provider
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`0G Compute request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from 0G Compute');
    }

    const responseContent = data.choices[0].message.content;
    const chatId = data.id; // For verifiable services

    console.log('Processing 0G Compute response...');
    
    // Process and verify the response (for verifiable services)
    let verified = false;
    try {
      const verifyResult = await broker.inference.processResponse(
        providerAddress,
        responseContent,
        chatId
      );
      verified = verifyResult === true;
    } catch (verifyError) {
      console.warn('Response verification failed:', verifyError);
      // Continue without verification for now
    }

    return res.status(200).json({
      success: true,
      requestId: chatId,
      response: responseContent,
      metadata: {
        model: model,
        timestamp: new Date().toISOString(),
        verified: verified,
        provider: providerAddress
      }
    });

  } catch (error) {
    console.error('Compute API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Provide more specific error messages
    if (errorMessage.includes('insufficient balance')) {
      return res.status(402).json({
        error: 'Insufficient balance',
        message: 'Not enough tokens to process this request. Please add funds to your account.'
      });
    }
    
    if (errorMessage.includes('network')) {
      return res.status(503).json({
        error: 'Network error',
        message: 'Unable to connect to 0G Compute network. Please try again later.'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process compute request',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
