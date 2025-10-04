// api/compute.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';
import { getBroker } from '../src/lib/brokerService.js';

// Official 0G Services from the documentation
const OFFICIAL_PROVIDERS = {
  "gpt-oss-120b": "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
  "deepseek-r1-70b": "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3"
};

interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Health check endpoint
  if (req.method === 'GET') {
    try {
      const broker = await getBroker();
      
      // Try to list services to verify connection
      const services = await broker.inference.listService();
      
      // Check ledger status
      let ledgerStatus = 'unknown';
      try {
        const account = await broker.ledger.getLedger();
        ledgerStatus = `Available: ${ethers.formatEther(account.totalBalance - account.locked)} OG`;
      } catch {
        ledgerStatus = 'No ledger found - needs funding';
      }
      
      return res.status(200).json({
        status: 'healthy',
        services: services.length,
        ledger: ledgerStatus,
        providers: OFFICIAL_PROVIDERS
      });
    } catch (error: any) {
      return res.status(500).json({
        status: 'unhealthy',
        error: error.message,
        providers: OFFICIAL_PROVIDERS
      });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { analysisContext, rootHash, model = "gpt-oss-120b" } = req.body;
  if (!analysisContext) {
    return res.status(400).json({ message: 'Missing analysisContext in request body.' });
  }

  // Get provider address for the requested model
  const providerAddress = OFFICIAL_PROVIDERS[model as keyof typeof OFFICIAL_PROVIDERS] || OFFICIAL_PROVIDERS["gpt-oss-120b"];

  try {
    const broker = await getBroker();

    // Step 1: Acknowledge the provider (required before first use)
    console.log(`Acknowledging provider: ${providerAddress}`);
    await broker.inference.acknowledgeProviderSigner(providerAddress);

    // Step 2: Get service metadata
    console.log(`Getting service metadata for ${model}...`);
    const { endpoint, model: serviceModel } = await broker.inference.getServiceMetadata(providerAddress);
    
    // Step 3: Prepare the prompt
    const prompt = rootHash 
      ? `Based on the research document at 0G Storage root hash ${rootHash}, please answer the following: "${analysisContext}"`
      : analysisContext;
    const messages = [{ role: "user", content: prompt }];

    // Step 4: Generate authenticated request headers
    console.log(`Generating request headers...`);
    const headers = await broker.inference.getRequestHeaders(providerAddress, JSON.stringify(messages));

    // Step 5: Send request to the service
    console.log(`Sending request to endpoint: ${endpoint}`);
    const providerResponse = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: serviceModel,
        stream: false
      }),
    });

    if (!providerResponse.ok) {
      const errorBody = await providerResponse.text();
      throw new Error(`Provider request failed with status: ${providerResponse.status}. Body: ${errorBody}`);
    }

    // Step 6: Process the response
    const resultJson = await providerResponse.json() as OpenAIResponse;
    const aiContent = resultJson.choices[0].message.content;
    const chatID = resultJson.id;

    // Step 7: Verify the response
    console.log(`Verifying response...`);
    const isValid = await broker.inference.processResponse(
      providerAddress,
      JSON.stringify(resultJson),
      chatID
    );

    res.status(200).json({
      id: chatID,
      result: aiContent,
      verified: isValid,
      provider: providerAddress,
      model: serviceModel,
      duration: 'N/A'
    });
  } catch (error: any) {
    console.error("AI analysis failed:", error);
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'An error occurred during AI analysis.';
    
    if (error.message?.includes('BAD_DATA')) {
      errorMessage = 'Service provider not available. Please check if the provider is registered on the network.';
    } else if (error.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds in compute ledger. Please add funds to your account.';
    }
    
    res.status(500).json({ 
      message: errorMessage,
      details: error.message 
    });
  }
}