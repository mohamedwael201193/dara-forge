# 🚀 WAVE 5 MAINNET DEPLOYMENT GUIDE

**Date:** October 30, 2025  
**Version:** Wave 5 - Mainnet Production  
**Status:** Ready for Deployment ✅

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Code Changes Complete

- [x] All contracts deployed to 0G mainnet
- [x] Backend mint API implemented (`api/mint.ts`)
- [x] Frontend updated (gasless minting UI)
- [x] Network configuration updated (split mainnet/testnet)
- [x] Website content updated (removed "Coming Soon")
- [x] WalletStatus component fixed (dynamic network detection)
- [x] All TypeScript errors resolved
- [x] .env.example updated with Wave 5 configuration

### ✅ Files Ready for Deployment

- [x] `.gitignore` - Properly configured
- [x] `.vercelignore` - Excludes API/backend files
- [x] `.renderignore` - Excludes frontend files
- [x] `.env.example` - Complete with all variables

---

## 🌐 DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│           0G MAINNET (Chain ID: 16661)          │
│                                                 │
│  ├─ Storage (indexer-storage-turbo.0g.ai)     │
│  ├─ Chain Anchor (DaraAnchor contract)        │
│  └─ iNFT Minting (ERC7857 contract)           │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│      VERCEL (Frontend)                          │
│      https://dara-forge.vercel.app              │
│                                                 │
│  ├─ React + Vite                               │
│  ├─ Wagmi for wallet connection                │
│  └─ Calls Render API for backend operations    │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│      RENDER (Backend API)                       │
│      https://dara-api.onrender.com              │
│                                                 │
│  ├─ Express API server                         │
│  ├─ Gasless minting endpoint                   │
│  ├─ Storage/Anchor/Compute/DA handlers         │
│  └─ Uses mainnet/testnet wallets               │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│        0G GALILEO TESTNET (Chain ID: 16602)     │
│                                                 │
│  ├─ Compute Network                            │
│  └─ DA Layer                                   │
└─────────────────────────────────────────────────┘
```

---

## 📦 STEP 1: PREPARE FOR GIT PUSH

### Check Git Status

```powershell
git status
```

### Add All Changes

```powershell
git add .
```

### Commit with Descriptive Message

```powershell
git commit -m "Wave 5 Mainnet Deployment - Complete

- Deployed contracts to 0G mainnet (DaraAnchor, ERC7857, Oracle)
- Implemented gasless iNFT minting API (api/mint.ts)
- Updated frontend to call backend mint API
- Fixed network configuration (mainnet/testnet split)
- Updated all website content (removed Coming Soon)
- Fixed WalletStatus to recognize mainnet dynamically
- Updated .env.example with Wave 5 config
- Ready for production deployment"
```

### Push to GitHub

```powershell
git push origin main
```

---

## 🎨 STEP 2: DEPLOY TO VERCEL (Frontend)

### A. Update Environment Variables in Vercel Dashboard

Go to: https://vercel.com/your-project/settings/environment-variables

**REQUIRED Variables:**

```bash
# API Endpoint
VITE_API_BASE_URL=https://dara-api.onrender.com

# Contract Addresses (0G Mainnet)
VITE_RESEARCH_PASSPORT_CONTRACT=0x3156F6E761D7c9dA0a88A6165864995f2b58854f
VITE_DARA_CONTRACT=0xB0324Dd39875185658f48aB78473d288d8f9B52e
VITE_ORACLE_VERIFIER_CONTRACT=0xa4e554b54cF94BfBca0682c34877ee7C96aC9261

# RPC Endpoint (Optional - has defaults)
VITE_OG_RPC=https://evmrpc.0g.ai
```

**Apply to:** Production, Preview, and Development

### B. Trigger Redeployment

**Option 1: Automatic (after git push)**

- Vercel auto-deploys when you push to GitHub

**Option 2: Manual**

1. Go to Vercel Dashboard
2. Click "Redeploy" button
3. Select "Use existing Build Cache: No"
4. Click "Redeploy"

### C. Verify Deployment

1. Wait for build to complete (~2-3 minutes)
2. Visit: https://dara-forge.vercel.app
3. Test:
   - ✅ Homepage loads correctly
   - ✅ "Now Available" shown for iNFTs
   - ✅ Network status shows mainnet info
   - ✅ Pipeline page accessible

---

## 🖥️ STEP 3: DEPLOY TO RENDER (Backend API)

### A. Update Environment Variables in Render Dashboard

Go to: https://dashboard.render.com/web/YOUR_SERVICE/environment

**REQUIRED Variables:**

```bash
# =============================================================================
# MAINNET CONFIGURATION (for Storage, Anchor, iNFT Minting)
# =============================================================================

OG_RPC_URL_MAINNET=https://evmrpc.0g.ai
OG_CHAIN_ID_MAINNET=16661
OG_STORAGE_INDEXER_MAINNET=https://indexer-storage-turbo.0g.ai
OG_EXPLORER_MAINNET=https://chainscan.0g.ai

# CRITICAL: Your mainnet private key (backend wallet for gasless minting)
OG_MAINNET_PRIVATE_KEY=0xYOUR_ACTUAL_MAINNET_PRIVATE_KEY

# Storage key (can be same as mainnet key)
OG_STORAGE_PRIVATE_KEY=0xYOUR_ACTUAL_MAINNET_PRIVATE_KEY

# =============================================================================
# TESTNET CONFIGURATION (for Compute, DA)
# =============================================================================

OG_RPC_URL_TESTNET=https://evmrpc-galileo.0g.ai
OG_CHAIN_ID_TESTNET=16602
OG_STORAGE_URL_TESTNET=https://indexer-storage-galileo-turbo.0g.ai
OG_COMPUTE_URL_TESTNET=https://evmrpc-galileo.0g.ai
OG_DA_URL_TESTNET=https://evmrpc-galileo.0g.ai
OG_EXPLORER_TESTNET=https://chainscan-galileo.0g.ai

# CRITICAL: Your testnet private key (for Compute/DA operations)
OG_TESTNET_PRIVATE_KEY=0xYOUR_ACTUAL_TESTNET_PRIVATE_KEY

# Compute/DA keys (can be same as testnet key)
OG_COMPUTE_PRIVATE_KEY=0xYOUR_ACTUAL_TESTNET_PRIVATE_KEY
OG_DA_PRIVATE_KEY=0xYOUR_ACTUAL_TESTNET_PRIVATE_KEY

# =============================================================================
# CONTRACT ADDRESSES (0G Mainnet)
# =============================================================================

RESEARCH_PASSPORT_CONTRACT=0x3156F6E761D7c9dA0a88A6165864995f2b58854f
DARA_CONTRACT=0xB0324Dd39875185658f48aB78473d288d8f9B52e
ORACLE_VERIFIER_CONTRACT=0xa4e554b54cF94BfBca0682c34877ee7C96aC9261

# =============================================================================
# BACKWARDS COMPATIBILITY
# =============================================================================

OG_RPC_URL=https://evmrpc.0g.ai
OG_CHAIN_ID=16661
OG_INDEXER_RPC=https://indexer-storage-turbo.0g.ai
OG_COMPUTE_RPC=https://evmrpc-galileo.0g.ai
```

### B. Trigger Manual Deployment

**Option 1: Automatic (after git push)**

- Render auto-deploys when you push to GitHub

**Option 2: Manual Redeploy**

1. Go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for build to complete (~5-7 minutes)

### C. Verify Deployment

1. Check logs for errors:

   ```
   [0G DA] Client initialized for wallet: 0xDE84a47a744165B5123D428321F541fD524c4435
   [Mint API] Server ready
   Dev API server listening on http://localhost:3000
   ```

2. Test API endpoints:

   ```powershell
   # Test health endpoint
   curl https://dara-api.onrender.com/health

   # Should return: {"status":"ok","timestamp":"2025-10-30T..."}
   ```

---

## 🧪 STEP 4: END-TO-END TESTING

### A. Test Frontend

1. **Visit:** https://dara-forge.vercel.app
2. **Connect Wallet** (MetaMask)
3. **Check Network Status:**
   - If on mainnet (16661): Should show "Connected to 0G Chain ✅"
   - If on testnet (16602): Should show "Wrong Network" with switch button

### B. Test Complete Pipeline

1. **Upload Dataset** (Storage - mainnet)
2. **AI Summarize** (Compute - testnet)
3. **DA Publish** (DA - testnet)
4. **Chain Anchor** (Anchor - mainnet)
5. **Mint iNFT** (Minting - mainnet via backend)

### C. Test Gasless Minting

1. Go to Pipeline page
2. Complete all steps
3. Click "Mint Research Passport"
4. **Expected:**
   - ✅ No wallet approval popup
   - ✅ "Minting iNFT..." spinner
   - ✅ Success message with token ID
   - ✅ Transaction link works
   - ✅ Contract link works

---

## 🔍 STEP 5: VERIFY DEPLOYMENT

### Check Contract Interactions

**DaraAnchor:**

- https://chainscan.0g.ai/address/0xB0324Dd39875185658f48aB78473d288d8f9B52e

**ERC7857 Research Passport:**

- https://chainscan.0g.ai/address/0x3156F6E761D7c9dA0a88A6165864995f2b58854f

**MockOracleVerifier:**

- https://chainscan.0g.ai/address/0xa4e554b54cF94BfBca0682c34877ee7C96aC9261

### Check Minted iNFTs

1. After minting, check your wallet on 0G Explorer
2. Verify token ownership
3. Check metadata hash matches

---

## 🐛 TROUBLESHOOTING

### Frontend Issues

**Problem:** "Cannot connect to API"

- **Fix:** Check VITE_API_BASE_URL in Vercel
- **Should be:** `https://dara-api.onrender.com`

**Problem:** "Wrong contract address"

- **Fix:** Update contract addresses in Vercel environment variables
- Redeploy frontend

### Backend Issues

**Problem:** "Mint API returns 500 error"

- **Check:** OG_MAINNET_PRIVATE_KEY is set correctly in Render
- **Check:** Wallet has enough OG for gas fees
- **View Logs:** Render Dashboard → Logs

**Problem:** "DA operations failing"

- **Check:** OG_TESTNET_PRIVATE_KEY is set correctly
- **Check:** Testnet wallet has OG tokens (need 4.6+ OG)

### Network Issues

**Problem:** "Wrong Network" showing on mainnet

- **Fix:** Clear browser cache
- **Check:** VITE_OG_RPC is set to mainnet RPC

---

## 📊 DEPLOYMENT SUMMARY

### Deployed Services

| Service     | URL                                        | Status     |
| ----------- | ------------------------------------------ | ---------- |
| Frontend    | https://dara-forge.vercel.app              | ✅ Live    |
| Backend API | https://dara-api.onrender.com              | ✅ Live    |
| DaraAnchor  | 0xB0324Dd39875185658f48aB78473d288d8f9B52e | ✅ Mainnet |
| ERC7857     | 0x3156F6E761D7c9dA0a88A6165864995f2b58854f | ✅ Mainnet |
| Oracle      | 0xa4e554b54cF94BfBca0682c34877ee7C96aC9261 | ✅ Mainnet |

### Network Configuration

| Component    | Network | Chain ID | RPC                  |
| ------------ | ------- | -------- | -------------------- |
| Storage      | Mainnet | 16661    | evmrpc.0g.ai         |
| Anchor       | Mainnet | 16661    | evmrpc.0g.ai         |
| iNFT Minting | Mainnet | 16661    | evmrpc.0g.ai         |
| Compute      | Testnet | 16602    | evmrpc-galileo.0g.ai |
| DA Layer     | Testnet | 16602    | evmrpc-galileo.0g.ai |

---

## ✅ POST-DEPLOYMENT TASKS

### 1. Update README.md

- Add Wave 5 deployment section
- List contract addresses with explorer links
- Document split architecture
- Add gasless minting info

### 2. Social Media Announcement

- Tweet about Wave 5 launch
- Share on Discord/Telegram
- Highlight gasless minting feature

### 3. Monitor Performance

- Check Vercel analytics
- Monitor Render logs for errors
- Track minting transactions

### 4. Backup Private Keys

- Securely store mainnet private key
- Securely store testnet private key
- Document recovery process

---

## 🎉 CONGRATULATIONS!

Your Wave 5 deployment is complete! 🚀

**What's Live:**

- ✅ Complete 0G mainnet deployment
- ✅ Gasless iNFT minting
- ✅ Split architecture (mainnet + testnet)
- ✅ Production-ready website
- ✅ Professional UX

**Next Steps:**

- Test everything thoroughly
- Share with the community
- Prepare for Wave 6 (if applicable)

---

**Document Version:** 1.0  
**Last Updated:** October 30, 2025  
**Author:** GitHub Copilot + User (mohamed-wael)
