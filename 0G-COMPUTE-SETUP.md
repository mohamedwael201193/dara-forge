# 0G Compute Integration Setup# 0G Compute Integration Setup

## Production Configuration## Development Mode (Current)

DARA Forge integrates with the 0G Compute Network for decentralized AI processing. This document provides setup instructions for production deployment.The application is currently running in development mode with mock 0G Compute responses. This allows for testing and development without requiring actual 0G provider credentials.

### Environment Variables## Production Deployment

Set these in your production environment (Vercel Environment Variables):To enable real 0G Compute in production, set these environment variables:

````bash### Required Environment Variables

OG_COMPUTE_PRIVATE_KEY=your_private_key_here

OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai```bash

OG_RPC=https://evmrpc-testnet.0g.ai# 0G Compute Configuration

```NODE_ENV=production

OG_COMPUTE_PRIVATE_KEY=your_private_key_here

**Security Note:** Never expose private keys in client-side code or version control.OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai

ZG_COMPUTE_PROVIDER=0xf07240Efa67755B5311bc75784a061eDB47165Dd

### 0G Compute: Live FlowZG_COMPUTE_ENDPOINT=https://your-0g-provider-endpoint

````

The implementation follows the official 0G SDK patterns:

### Setup Steps

1. **Broker Initialization**: Uses ethers v6 ESM with createZGComputeNetworkBroker

2. **Ledger Management**: Create/deposit prepaid ledger in OG units (not wei)1. **Get 0G Test Tokens**

3. **Service Discovery**: listService → acknowledgeProviderSigner → getServiceMetadata

4. **Request Processing**: getRequestHeaders → OpenAI-compatible request → processResponse verification - Visit the 0G testnet faucet

5. **Cryptographic Verification**: Real TEE providers return verified=true for authenticated responses - Fund your wallet with test A0GI tokens

### API Endpoints2. **Provider Setup**

- `GET /api/compute?action=health` - Service health check - The system uses the official 0G provider: `0xf07240Efa67755B5311bc75784a061eDB47165Dd`

- `GET /api/compute?action=diagnostics` - Detailed diagnostics - Ledger will be automatically created with 0.01 OG funding

- `POST /api/compute?action=topup` - Fund ledger - Provider acknowledgment happens automatically

- `POST /api/compute?action=analyze` - Submit analysis request

3. **Deploy to Production**

### Testing

````bash

Run the smoke test to verify the integration:   # Build for production

npm run build

```bash

npm run compute:smoke   # Deploy to Vercel

```   vercel deploy --prod

````

### References

## Features

- [0G Compute Network Documentation](https://docs.0g.ai)

- [Official 0G SDK Repository](https://github.com/0glabs/0g-serving-broker)### ✅ Implemented

- Secure client-server architecture
- Automatic ledger management
- Provider acknowledgment
- Response verification
- Error handling and fallbacks
- Development mock mode

### 🎯 Ready for Wave 3

- Real decentralized AI computation
- Cryptographic verification
- OpenAI-compatible API
- Production-ready serverless functions

## Architecture

```
Frontend (React)
    ↓
API Routes (Vercel Functions)
    ↓
Broker Service (Secure Backend)
    ↓
0G Compute Network
```

The integration follows official 0G documentation patterns and is ready for immediate production deployment.
