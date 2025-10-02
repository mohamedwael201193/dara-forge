# Security Incident Response: Compromised Keys

⚠️ **CRITICAL**: The following private keys were exposed in git history and must be considered compromised:

## Compromised Keys (REVOKE IMMEDIATELY)

- `OG_STORAGE_PRIVATE_KEY=0xe7db771abed2bdb3cbfd995708087890006046098688409238d180d7e897ca8e`
- `OG_DA_PRIVATE_KEY=0xe7db771abed2bdb3cbfd995708087890006046098688409238d180d7e897ca8e`
- `OG_COMPUTE_API_KEY=0xe7db771abed2bdb3cbfd995708087890006046098688409238d180d7e897ca8e`

## Immediate Actions Required

### 1. Key Rotation

Generate new keys for all compromised values:

```bash
# Generate new wallet private key
# Move any funds from compromised wallets to new wallets
# Update 0G services with new keys
```

### 2. Vercel Environment Variables

Set these in **Vercel Project Settings → Environment Variables** (server-side only):

**Server-only variables (NO VITE\_ prefix):**

- `OG_CHAIN_ID=16602`
- `OG_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai/`
- `OG_RPC=https://evmrpc-testnet.0g.ai/`
- `OG_COMPUTE_API_KEY=[NEW_KEY]`
- `OG_DA_PRIVATE_KEY=[NEW_KEY]`
- `OG_COMPUTE_PRIVATE_KEY=[NEW_KEY]`
- `OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai/`
- `OG_INDEXER=https://indexer-storage-testnet-standard.0g.ai/`
- `OG_STORAGE_PRIVATE_KEY=[NEW_KEY]`
- `DARA_CONTRACT=0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9`

**Client-side variables (VITE\_ prefix exposed to browser):**

- `VITE_OG_RPC=https://evmrpc-testnet.0g.ai/`
- `VITE_TEST_DATASETS_ENABLED=true`
- `VITE_DEBUG_MODE=true`
- `VITE_REAL_TIME_MONITORING=true`
- `VITE_ADVANCED_ANALYTICS=true`
- `VITE_COLLABORATION_ENABLED=true`
- `VITE_DEFAULT_AI_MODEL=research-analyzer-v1`
- `VITE_AI_PROCESSING_ENABLED=true`
- `VITE_OG_INFT_AI_MODEL=gpt-4-turbo`
- `VITE_OG_INFT_ENABLED=true`
- `VITE_OG_DA_RPC=https://da-rpc-testnet.0g.ai`
- `VITE_OG_DA_ENDPOINT=https://da-testnet.0g.ai`
- `VITE_OG_COMPUTE_WS=wss://compute-testnet.0g.ai/ws`
- `VITE_OG_COMPUTE_ENDPOINT=https://compute-testnet.0g.ai`
- `VITE_DARA_RESEARCH_CONTRACT=0x1a8c31b7c93bDaC2951E1E80774e19679Ce4571d`
- `VITE_OG_USE_SERVER_UPLOAD=1`
- `VITE_OG_RPC_ALT=https://evmrpc-testnet.0g.ai/`
- `VITE_OG_FLOW_CONTRACT=0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628`
- `VITE_OG_EXPLORER=https://chainscan-galileo.0g.ai`
- `VITE_WC_PROJECT_ID=383710c855108ec5713394a649cb6eea`
- `VITE_DARA_CONTRACT=0xC2Ee75BFe89eAA01706e09d8722A0C8a6E849FC9`
- `VITE_OG_INDEXER=https://indexer-storage-testnet-turbo.0g.ai/`

### 3. Git History Cleanup (Optional but Recommended)

To completely remove sensitive data from git history:

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove .env from entire git history
git filter-repo --path .env --invert-paths

# Force push (WARNING: destructive operation)
git push origin --force --all
git push origin --force --tags
```

### 4. Additional Security Measures

- [ ] Review wallet balances and transaction history for unauthorized activity
- [ ] Update any services/APIs using the compromised keys
- [ ] Monitor for unusual activity on associated accounts
- [ ] Consider rotating any related credentials (database passwords, etc.)

### 5. Prevention

- ✅ `.env` now in `.gitignore` with comprehensive secret patterns
- ✅ `.env` removed from git tracking
- ✅ Only `.env.example` should be committed going forward
- Use environment variables in production/Vercel instead of `.env` files

## Current Status

- [x] `.env` removed from git tracking
- [x] `.gitignore` updated with comprehensive secret patterns
- [ ] Keys rotated and services updated
- [ ] Vercel environment variables configured
- [ ] Git history cleaned (optional)
