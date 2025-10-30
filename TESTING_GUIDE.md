# Wave 5 End-to-End Testing Guide

## Overview

This guide walks through testing the complete DARA Forge pipeline with Wave 5 mainnet deployment.

## Test Environment

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **0G Mainnet**: Chain ID 16661 (Storage + Chain + iNFT)
- **0G Testnet Galileo**: Chain ID 16602 (Compute + DA)

## Deployed Contracts (Mainnet)

- **DaraAnchor**: `0xB0324Dd39875185658f48aB78473d288d8f9B52e`
- **ERC7857ResearchPassport**: `0x3156F6E761D7c9dA0a88A6165864995f2b58854f`
- **MockOracleVerifier**: `0xa4e554b54cF94BfBca0682c34877ee7C96aC9261`

## Pre-Test Checklist

- [ ] Backend server running on port 3000
- [ ] Frontend running on port 5173
- [ ] Wallet connected to 0G Mainnet (Chain ID 16661)
- [ ] Wallet has sufficient OG tokens (~0.1 OG for testing)
- [ ] Test file prepared (e.g., `samples/sample.txt`)

## Test Flow

### Step 1: File Upload to 0G Storage (Mainnet)

**Expected Behavior**:

- Upload a research file (e.g., sample.txt)
- Backend calls 0G Storage SDK with mainnet indexer
- Returns: `{ cid: "...", merkleRoot: "0x...", storageUrl: "..." }`

**API Endpoint**: `POST http://localhost:3000/api/storage/upload`

**Verification**:

- Check storage indexer: https://indexer-storage-turbo.0g.ai
- CID should be retrievable

**UI Steps**:

1. Navigate to Pipeline page
2. Click "Upload Research Data"
3. Select file from `samples/sample.txt`
4. Wait for upload completion
5. Verify success message with CID

---

### Step 2: Anchor to Blockchain (Mainnet)

**Expected Behavior**:

- Submit merkle root from storage to DaraAnchor contract
- Transaction signed with mainnet wallet
- Returns: `{ txHash: "0x...", explorerUrl: "https://chainscan.0g.ai/tx/0x..." }`

**API Endpoint**: `POST http://localhost:3000/api/anchor`
**Request Body**:

```json
{
  "merkleRoot": "0x...",
  "metadata": "ipfs://..."
}
```

**Verification**:

- View transaction on https://chainscan.0g.ai/tx/[txHash]
- Confirm contract interaction with DaraAnchor
- Check `recordAnchored` event emission

**UI Steps**:

1. After upload success, click "Anchor to Chain"
2. Wait for blockchain confirmation
3. Verify transaction link appears
4. Click link to view on explorer

---

### Step 3: Compute Analysis (Testnet)

**Expected Behavior**:

- Submit compute job to 0G Compute Network (testnet)
- Uses testnet private key from `OG_COMPUTE_PRIVATE_KEY`
- Returns: `{ responseId: "...", status: "pending" }`

**API Endpoint**: `POST http://localhost:3000/api/compute/analyze`
**Request Body**:

```json
{
  "cid": "..."
}
```

**Verification**:

- Poll compute status endpoint
- Wait for status change: `pending` → `processing` → `completed`
- Response contains analysis results

**UI Steps**:

1. After anchoring, click "Run AI Analysis"
2. Watch compute status updates
3. Wait for analysis results (30-60 seconds)
4. Verify analysis summary appears

---

### Step 4: DA Publication (Testnet)

**Expected Behavior**:

- Publish analysis results to 0G DA layer (testnet)
- Returns: `{ batchId: "...", commitment: "0x..." }`

**API Endpoint**: `POST http://localhost:3000/api/da/publish`
**Request Body**:

```json
{
  "data": "...",
  "metadata": {...}
}
```

**Verification**:

- Check DA commitment returned
- Verify data retrievable via DA verify endpoint

**UI Steps**:

1. After compute completes, click "Publish to DA"
2. Wait for DA confirmation
3. Verify commitment hash appears

---

### Step 5: Mint Research iNFT (Mainnet)

**Expected Behavior**:

- Connect wallet to 0G Mainnet
- Call `mint()` on ERC7857ResearchPassport contract
- Metadata includes: CID, merkle root, anchor tx, compute response, DA commitment
- Returns NFT tokenId

**Contract Address**: `0x3156F6E761D7c9dA0a88A6165864995f2b58854f`

**Verification**:

- View mint transaction on https://chainscan.0g.ai
- Check wallet for new NFT (tokenId should increment)
- Verify NFT metadata contains research data

**UI Steps**:

1. After all steps complete, see "Mint Research iNFT" button
2. Click to initiate minting
3. Confirm wallet transaction
4. Wait for confirmation (~10 seconds)
5. View NFT link on explorer

---

## Expected Results

### Success Criteria

✅ **Storage**: File uploaded to mainnet storage, CID generated  
✅ **Chain**: Merkle root anchored on mainnet, transaction confirmed  
✅ **Compute**: Analysis completed on testnet, results returned  
✅ **DA**: Data published to testnet DA layer, commitment received  
✅ **iNFT**: NFT minted on mainnet with complete metadata

### Transaction Links

All transactions should be viewable on respective explorers:

- **Mainnet**: https://chainscan.0g.ai (storage, anchor, iNFT)
- **Testnet**: https://chainscan-testnet.0g.ai (compute, DA)

---

## Troubleshooting

### Issue: "Wallet not connected"

**Solution**: Click "Connect Wallet" and ensure you're on 0G Mainnet (Chain ID 16661)

### Issue: "Insufficient funds"

**Solution**: Get OG tokens from faucet or bridge

- Faucet: https://faucet.0g.ai
- Minimum required: ~0.1 OG for testing

### Issue: "Storage upload fails"

**Solution**:

- Check backend logs for indexer connection
- Verify `OG_STORAGE_INDEXER_MAINNET` in .env
- Ensure file size < 100MB

### Issue: "Anchor transaction reverts"

**Solution**:

- Verify DaraAnchor contract address in .env
- Check merkle root format (32 bytes, 0x-prefixed)
- Ensure wallet has OG for gas

### Issue: "Compute job stuck"

**Solution**:

- Check compute network status
- Verify `OG_COMPUTE_PRIVATE_KEY` has testnet tokens
- Poll status endpoint for error messages

### Issue: "iNFT minting fails"

**Solution**:

- Verify wallet on mainnet (not testnet)
- Check ERC7857 contract address
- Ensure metadata format is valid JSON string

---

## Test Data

### Sample Research File

Location: `samples/sample.txt`
Content: Research paper or dataset (text format)

### Expected Metadata Structure

```json
{
  "title": "Research Title",
  "description": "Research description",
  "storageCID": "bafybeiabc123...",
  "merkleRoot": "0xabc123...",
  "anchorTxHash": "0xdef456...",
  "computeResponseId": "response_789",
  "daCommitment": "0xghi789...",
  "timestamp": 1730304000
}
```

---

## Performance Benchmarks

| Step               | Expected Duration            | Network |
| ------------------ | ---------------------------- | ------- |
| Storage Upload     | 5-30s (depends on file size) | Mainnet |
| Anchor Transaction | 10-15s                       | Mainnet |
| Compute Analysis   | 30-60s                       | Testnet |
| DA Publication     | 10-20s                       | Testnet |
| iNFT Minting       | 10-15s                       | Mainnet |
| **Total**          | **~2-3 minutes**             | Both    |

---

## Post-Test Validation

### 1. Check All Transaction Links

- [ ] Storage upload successful with valid CID
- [ ] Anchor transaction confirmed on mainnet explorer
- [ ] Compute response received with analysis results
- [ ] DA commitment available
- [ ] iNFT minted with correct tokenId

### 2. Verify Contract States

```javascript
// Check DaraAnchor
const anchor = await contract.anchors(merkleRoot);
console.log(anchor); // Should show stored data

// Check ERC7857 ownership
const owner = await passport.ownerOf(tokenId);
console.log(owner); // Should be your wallet address

// Check NFT metadata
const tokenURI = await passport.tokenURI(tokenId);
console.log(tokenURI); // Should return metadata URI
```

### 3. Wave 5 Judging Criteria

✅ **40%**: Deployed to mainnet (DaraAnchor + ERC7857)  
✅ **30%**: Documentation (this guide + WAVE5_IMPLEMENTATION.md)  
✅ **30%**: Functionality (end-to-end pipeline working)

---

## Next Steps After Successful Test

1. **Document Results**: Update README.md with test results
2. **Capture Screenshots**: Pipeline flow, transactions, minted NFT
3. **Create Demo Video**: Record full pipeline execution
4. **Update WAVE5_IMPLEMENTATION.md**: Add test results section
5. **Prepare Submission**: Ensure all contracts verified (manual if needed)

---

## Support Resources

- **0G Documentation**: https://docs.0g.ai
- **Wave 5 Guidelines**: https://0g-ai.notion.site/Wave-5-Submission-Guidelines
- **DARA Forge Docs**: See README.md and docs/ folder
- **Block Explorers**:
  - Mainnet: https://chainscan.0g.ai
  - Testnet: https://chainscan-testnet.0g.ai
