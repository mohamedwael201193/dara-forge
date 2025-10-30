# Network Switching Fix - Wave 5

## Problem Identified

User tested the pipeline and found:

- ✅ **Storage**: Working on mainnet (visible at https://storagescan.0g.ai)
- ✅ **DA**: Working on testnet
- ✅ **Compute**: Working on testnet
- ❌ **Chain Anchor**: Transaction was sent to testnet instead of mainnet
- ❌ **Mint iNFT**: Transaction was sent to testnet instead of mainnet
- **Issue**: Wallet showed "Galileo (Testnet)" during transactions even though mainnet balance was visible

## Root Cause

The frontend wallet configuration defaulted to mainnet, but contract interactions (`useWriteContract`) and API calls were not explicitly specifying the chain ID. This caused transactions to be sent to whatever network the user's wallet was currently connected to.

## Fixes Applied

### 1. iNFT Minting Component (`src/components/iNFT/MintPassportButton.tsx`)

**Added**:

- `useChainId()` - Get current connected chain
- `useSwitchChain()` - Programmatically switch networks
- Explicit `chainId: 16661` in `writeContract()` call
- Explicit `chainId: 16661` in `useWaitForTransactionReceipt()`
- Network detection and auto-switching logic:
  ```typescript
  if (chainId !== MAINNET_CHAIN_ID) {
    await switchChain({ chainId: MAINNET_CHAIN_ID });
  }
  ```
- Warning alert when on wrong network
- Button text changes to "Switch to Mainnet & Mint" when on testnet

### 2. Anchor API (`api/anchor.ts`)

**Changed**:

```typescript
// Before
const OG_RPC_URL = process.env.OG_RPC_URL;
const PRIV = process.env.OG_STORAGE_PRIVATE_KEY;

// After
const OG_RPC_URL =
  process.env.OG_RPC_URL_MAINNET ||
  process.env.OG_RPC_URL ||
  "https://evmrpc.0g.ai";
const PRIV =
  process.env.OG_MAINNET_PRIVATE_KEY || process.env.OG_STORAGE_PRIVATE_KEY;
```

**Added**:

- Mainnet explorer URL fallback: `process.env.OG_EXPLORER_MAINNET || "https://chainscan.0g.ai"`
- Console logging for debugging:
  - RPC URL being used
  - Contract address
  - Transaction hash
  - Chain ID
  - Explorer URL

### 3. Environment Variables (`.env`)

Already configured correctly:

- `OG_RPC_URL_MAINNET=https://evmrpc.0g.ai`
- `OG_MAINNET_PRIVATE_KEY=0xa999...`
- `VITE_OG_RPC=https://evmrpc.0g.ai`
- `VITE_OG_CHAIN_ID=16661`

## Expected Behavior After Fix

### Chain Anchor

1. User clicks "Anchor to Chain"
2. Backend API uses `OG_RPC_URL_MAINNET` (https://evmrpc.0g.ai)
3. Transaction submits to **Chain ID 16661 (Mainnet)**
4. Transaction hash visible at: `https://chainscan.0g.ai/tx/[hash]`
5. ✅ Transaction should be found (not 404)

### Mint iNFT

1. User clicks "Mint Research Passport"
2. If on testnet, wallet prompts to switch to mainnet
3. User approves network switch
4. Wallet shows "0G Mainnet" (not "Galileo Testnet")
5. Transaction submits with `chainId: 16661`
6. NFT mints on mainnet contract `0x3156F6E761D7c9dA0a88A6165864995f2b58854f`
7. ✅ Transaction visible at `https://chainscan.0g.ai/tx/[hash]`

## Testing Instructions

### Step 1: Restart Dev Server

```powershell
# Stop current server (Ctrl+C)
npm run dev:full
```

### Step 2: Clear Browser Cache

- Open DevTools (F12)
- Right-click refresh button → "Empty Cache and Hard Reload"
- Or clear site data in browser settings

### Step 3: Reconnect Wallet

- Disconnect wallet in MetaMask
- Refresh page
- Connect wallet again
- Verify it shows "0G Mainnet" and correct balance

### Step 4: Test Anchor

1. Upload a file (should work - already tested ✅)
2. Click "Anchor to Chain"
3. **Check MetaMask popup**: Should say "0G Mainnet" (NOT "Galileo Testnet")
4. Confirm transaction
5. Wait for confirmation
6. Click the explorer link
7. **Verify**: Transaction should load at `https://chainscan.0g.ai/tx/[hash]` (NOT 404)

### Step 5: Test iNFT Minting

1. Complete compute analysis (should work - already tested ✅)
2. Scroll to "Mint Research Passport iNFT" section
3. **Check alert**: If you see warning about wrong network, that's expected
4. Click "Switch to Mainnet & Mint" or "Mint Research Passport"
5. **MetaMask will prompt**: "Switch network to 0G Mainnet" → Approve
6. **Second MetaMask prompt**: Transaction on "0G Mainnet" → Confirm
7. Wait for minting (might take 10-30 seconds)
8. **Verify**: Should show success with token ID
9. Click "View Transaction"
10. **Verify**: Transaction should load at `https://chainscan.0g.ai/tx/[hash]`

## Verification Checklist

After testing, verify these are TRUE:

- [ ] Storage upload shows on https://storagescan.0g.ai (already ✅)
- [ ] DA publish works on testnet (already ✅)
- [ ] Compute analysis works (already ✅)
- [ ] Anchor transaction appears at `https://chainscan.0g.ai/tx/[hash]` (NOT 404)
- [ ] Anchor shows chain ID 16661 in backend logs
- [ ] iNFT minting shows "0G Mainnet" in MetaMask
- [ ] iNFT transaction appears at `https://chainscan.0g.ai/tx/[hash]`
- [ ] NFT balance shows in wallet on mainnet
- [ ] All mainnet transactions use wallet `0x1dF8e57ea7A6A3bB554E13412b27d4d26BBA851B`

## Debugging

If issues persist:

### Check Backend Logs

```bash
# In terminal running npm run dev:full
# Look for:
[Anchor] Using mainnet RPC: https://evmrpc.0g.ai
[Anchor] Transaction successful: 0x...
[Anchor] Chain ID: 16661
```

### Check Browser Console

```javascript
// Should see:
Switching from chain 16602 to mainnet 16661
// Or:
Already on mainnet 16661
```

### Check MetaMask Network

- Open MetaMask
- Look at top of popup
- Should say: "0G Mainnet" (NOT "Galileo (Testnet)")
- Click network dropdown
- Verify current network is highlighted on "0G Mainnet"

## Fallback: Manual Network Switch

If auto-switching doesn't work:

1. Open MetaMask
2. Click network dropdown at top
3. Select "0G Mainnet" manually
4. Retry transaction

## Contract Addresses Reference

**Mainnet (Chain ID 16661)**:

- DaraAnchor: `0xB0324Dd39875185658f48aB78473d288d8f9B52e`
- ERC7857ResearchPassport: `0x3156F6E761D7c9dA0a88A6165864995f2b58854f`
- MockOracleVerifier: `0xa4e554b54cF94BfBca0682c34877ee7C96aC9261`

**Testnet (Chain ID 16602)** - Only for Compute/DA:

- Compute Ledger: `0x09D00A2B31067da09bf0e873E58746d1285174Cc`

## Success Indicators

✅ **Anchor working**: Transaction hash starting with `0x` visible at `https://chainscan.0g.ai/tx/[hash]`

✅ **iNFT working**:

- Success message with token ID
- Transaction link opens successfully
- Wallet shows NFT on "0G Mainnet" network (check NFTs tab)

✅ **Full pipeline**: All 5 steps complete without errors, all transactions on correct networks

---

**Status**: Fixes applied, ready for testing  
**Last Updated**: 2025-10-30  
**Next Step**: Restart dev server and test pipeline flow
