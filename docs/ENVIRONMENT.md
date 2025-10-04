# Environment Variables Security Guide

## Server-Only Variables (NEVER expose to browser)

These variables contain sensitive data and must ONLY be used on the server-side:

- `OG_COMPUTE_PRIVATE_KEY` - Private key for 0G compute account (server-only)
- `OG_COMPUTE_RPC` - 0G network RPC endpoint (server-only)
- `OG_DA_PRIVATE_KEY` - Private key for data availability (server-only)
- `OG_STORAGE_PRIVATE_KEY` - Private key for storage operations (server-only)

## Public Variables (Safe for browser)

These variables are safe to expose to the client-side with `VITE_` prefix:

- `VITE_OG_RPC` - Public RPC endpoint for read-only operations
- `VITE_OG_EXPLORER` - Blockchain explorer URL
- `VITE_DARA_CONTRACT` - Contract address (public)
- `VITE_WC_PROJECT_ID` - WalletConnect project ID

## Security Rules

1. **Never use `VITE_` prefix with private keys** - This exposes them to the browser
2. **Server-only variables** must only be accessed in:

   - API routes (`/api/*`)
   - Server-side functions
   - Node.js runtime environments

3. **Check .gitignore** - Ensure `.env` files are not committed to version control
4. **Vercel deployment** - Set environment variables in Vercel dashboard, not in code

## Current Environment Setup

### Local Development (.env)

```bash
# Server-only (secure)
OG_COMPUTE_PRIVATE_KEY=0x...
OG_COMPUTE_RPC=https://evmrpc-testnet.0g.ai
OG_DA_PRIVATE_KEY=0x...
OG_STORAGE_PRIVATE_KEY=0x...

# Public (safe for browser)
VITE_OG_RPC=https://evmrpc-testnet.0g.ai/
VITE_OG_EXPLORER=https://chainscan-galileo.0g.ai
VITE_DARA_CONTRACT=0x9E527D6a3ee4CB6B7671fa19B4f94c89Ca59c00f
```

### Vercel Production

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

- `OG_COMPUTE_PRIVATE_KEY`
- `OG_COMPUTE_RPC`
- `ROLLUP_DISABLE_NATIVE=1`

## Verification Checklist

- [ ] No private keys in `VITE_*` variables
- [ ] `.env` in `.gitignore`
- [ ] Server-only variables only used in `/api/*` routes
- [ ] Production environment variables set in Vercel dashboard
- [ ] No sensitive data exposed to browser console or network tab
