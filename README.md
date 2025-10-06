# 🚀 **DARA Forge**

### _The First Complete 0G Blockchain Ecosystem Integration for Scientific Research_

<div align="center">

![DARA Forge Banner](https://img.shields.io/badge/DARA%20Forge-0G%20Integration-blue?style=for-the-badge&logo=blockchain&logoColor=white)
[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-dara--forge.vercel.app-green?style=for-the-badge)](https://dara-forge.vercel.app)
[![Smart Contract](https://img.shields.io/badge/⛓️%20Contract-0x9E527...c00f-purple?style=for-the-badge)](https://chainscan-galileo.0g.ai/address/0x9E527D6a3ee4CB6B7671fa19B4f94c89Ca59c00f)

**Revolutionizing Scientific Research Through Blockchain-Verified Data & AI**

</div>

---

## 🎯 **Mission Statement**

> **Transform scientific research from trust-based to cryptographically verifiable through complete decentralization.**

DARA Forge solves the **70% research reproducibility crisis** by providing the first platform where every dataset, computation, and analysis is permanently verifiable on blockchain infrastructure.

---

## 🏆 **Wave 3 Achievement: Complete 0G Stack Integration**

### 🗄️ **0G Storage Integration — ✅ OPERATIONAL**

```typescript
// Real storage operations with cryptographic proofs
const uploadResult = await storageService.uploadFile(file);
// Returns: { rootHash: "0x9fd82c20...", datasetId: "...", merkleProof: [...] }
```

**Features:**

- ✅ Direct 0G Storage node connectivity
- ✅ Real-time Merkle root generation
- ✅ Cryptographic file integrity verification
- ✅ Instant content-addressable retrieval
- ✅ Drag-and-drop interface with progress tracking

### 🤖 **0G Compute Integration — ✅ OPERATIONAL**

```typescript
// Verifiable AI analysis with TEE protection
const analysis = await computeBroker.analyzeDataset(rootHash, prompt);
// Returns: { answer: "...", provider: "phala", verified: true, chatID: "..." }
```

**Breakthrough Features:**

- ✅ **Real AI analysis** (NO MOCKS) via 0G Compute network
- ✅ **4 AI Models:** GPT-OSS-120B, DeepSeek-V3, Qwen2.5-VL, OpenAI
- ✅ **TEE Verification** for trusted computation environments
- ✅ **Multi-provider failover** with automatic fund management
- ✅ **Live wallet funding** (10+ OG tokens allocated per provider)

### 📡 **0G Data Availability — ✅ OPERATIONAL**

```typescript
// Permanent data availability with mathematical guarantees
const daResult = await daClient.submitBlob(data, metadata);
// Returns: { blobHash: "0xe36a027...", epoch: 1759723584, verified: true }
```

**Innovation:**

- ✅ **Automatic DA publishing** after every upload
- ✅ **32MB blob support** with redundant encoding
- ✅ **On-chain commitment recording** for immutable proofs
- ✅ **Network-wide availability verification**
- ✅ **Permanent accessibility guarantees**

### ⛓️ **0G Blockchain — ✅ OPERATIONAL**

```solidity
// Smart contract deployed on 0G Galileo testnet
contract DaraAnchor {
    mapping(bytes32 => DatasetInfo) public datasets;
    event DatasetAnchored(bytes32 indexed rootHash, address indexed researcher);
}
```

**Deployment:**

- ✅ **Smart Contract:** `0x9E527D6a3ee4CB6B7671fa19B4f94c89Ca59c00f`
- ✅ **Immutable dataset anchoring** with timestamps
- ✅ **Public transaction verification** on block explorer
- ✅ **MetaMask integration** with gas optimization

---

## 🔧 **Architecture Overview**

### **Backend Services Structure**

```
src/server/
├── 📁 storage/
│   ├── storageService.ts      # Main 0G Storage operations
│   ├── merkleTree.ts          # Cryptographic proof generation
│   └── uploadHandler.ts       # File processing & validation
├── 📁 compute/
│   ├── computeBroker.ts       # Multi-provider AI routing
│   ├── providers/             # phala/, flashpay/, openai/
│   │   ├── phalaProvider.ts   # TEE-verified computation
│   │   ├── flashpayProvider.ts # High-performance inference
│   │   └── openaiProvider.ts  # Fallback AI provider
│   └── teeVerification.ts     # Trusted execution validation
├── 📁 da/
│   ├── daClient.ts           # 0G DA blob submission
│   ├── daService.ts          # High-level DA operations
│   └── availabilityProof.ts  # Network verification
└── 📁 chain/
    ├── chainService.ts       # Smart contract interactions
    ├── anchorContract.ts     # Dataset anchoring logic
    └── transactionManager.ts # Gas optimization
```

### **API Endpoints**

```
api/
├── storage.ts               # Upload & Merkle root generation
├── compute.ts               # AI analysis requests
├── da.ts                   # Data availability operations
└── chain.ts                # Blockchain anchoring
```

### **Frontend Components**

```
src/
├── 📁 sections/
│   ├── StorageUploadSection.tsx    # File upload with real-time progress
│   ├── AISummarizeSection.tsx      # AI analysis interface
│   └── DAPublish.tsx               # Educational DA hub
├── 📁 components/
│   ├── ActivityHistory.tsx         # Complete action tracking
│   ├── NFTsComingSoon.tsx          # Wave 4 preview
│   └── ui/                        # Shadcn UI components
└── 📁 store/
    └── dataStore.ts               # Zustand state management
```

---

## 🚀 **Getting Started**

### **Prerequisites**

```bash
Node.js 18+
npm or yarn
MetaMask wallet
0G Galileo testnet tokens
```

### **Installation**

```bash
# Clone the repository
git clone https://github.com/mohamedwael201193/dara-forge.git
cd dara-forge

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your 0G private keys and endpoints

# Start development server
npm run dev
```

### **Environment Variables**

```env
# 0G Network Configuration
OG_RPC=https://evmrpc-testnet.0g.ai/
OG_CHAIN_ID=16602
OG_INDEXER_RPC=https://indexer-storage-testnet-turbo.0g.ai/

# 0G Services Private Keys
OG_STORAGE_PRIVATE_KEY=0x...
OG_COMPUTE_PRIVATE_KEY=0x...
OG_DA_PRIVATE_KEY=0x...

# Smart Contract Addresses
VITE_DARA_CONTRACT=0x9E527D6a3ee4CB6B7671fa19B4f94c89Ca59c00f
```

---

## 💡 **Real-World Usage Example**

**Live Example:**

1. **Upload:** `analysis_options.yaml` (1.4KB)
2. **Merkle Root:** `0x9fd82c20b34c66323e4a1b3ad27377bc...`
3. **AI Analysis:** 15,380 characters from `phala/gpt-oss-120b`
4. **DA Published:** Blob `0xe36a027660ce9c...` (Epoch 1759723584)
5. **Chain Anchor:** TX `0xa489340a7c361d767dd0cd247195988dfb50014...`
6. **Verification:** Public on [0G Explorer](https://chainscan-galileo.0g.ai)

---

## 🧪 **Testing & Development**

### **Test Scripts**

```bash
# Test 0G Storage integration
npm run test:storage

# Test 0G Compute with real AI
npm run test:compute

# Test 0G DA availability
npm run test:da

# Test complete workflow
npm run test:integration
```

### **Development Tools**

```bash
# Start development API server
npm run dev:api

# Set up 0G Storage nodes
npm run setup:storage

# Fund compute providers
npm run setup:compute
```

---

## 🌟 **Wave 4 Roadmap: Research NFTs & DAO Governance**

### 🎨 **Research Achievement NFTs**

- [ ] **Dataset Ownership NFTs** - Tokenize research datasets
- [ ] **Milestone Achievement Badges** - Verify research contributions
- [ ] **Peer Review Credentials** - Reward quality reviews
- [ ] **Collaboration Tokens** - Joint research participation

### 🏛️ **Decentralized Research DAO**

- [ ] **Governance Token Distribution** - Community decision making
- [ ] **Research Grant Funding** - Decentralized grant allocation
- [ ] **Reputation Scoring System** - Trustless researcher credentials
- [ ] **Cross-Institution Collaboration** - Global research networks

### 📱 **Platform Enhancement**

- [ ] **Mobile Application** - iOS/Android native apps
- [ ] **Advanced Analytics Dashboard** - Research insights & metrics
- [ ] **Real-time Collaboration Tools** - Live research sharing
- [ ] **Cross-chain Integration** - Multi-blockchain support

### 🔐 **Enterprise Features**

- [ ] **Institution Dashboards** - University-wide research tracking
- [ ] **API Marketplace** - Third-party integrations
- [ ] **Advanced Privacy Controls** - Selective data sharing
- [ ] **Compliance Reporting** - Regulatory requirement tools

---

## 📊 **Platform Impact Metrics**

| Metric                       | Traditional Research     | DARA Forge                          |
| ---------------------------- | ------------------------ | ----------------------------------- |
| **Reproducibility Rate**     | ~30%                     | 100% (cryptographically guaranteed) |
| **Data Verification**        | Trust-based              | Blockchain-proven                   |
| **AI Analysis Verification** | Unverifiable             | TEE-verified + on-chain             |
| **Storage Reliability**      | Single points of failure | Distributed + permanent             |
| **Access Control**           | Centralized gatekeepers  | Decentralized + transparent         |
| **Audit Trail**              | Manual/incomplete        | Complete + immutable                |

---

## 🔗 **Platform Access & Resources**

- 🌐 **Live Platform:** [dara-forge.vercel.app](https://dara-forge.vercel.app)
- ⛓️ **Smart Contract:** [`0x9E527D6a3ee4CB6B7671fa19B4f94c89Ca59c00f`](https://chainscan-galileo.0g.ai/address/0x9E527D6a3ee4CB6B7671fa19B4f94c89Ca59c00f)
- 🔍 **Block Explorer:** [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai)
- 📚 **Documentation:** [Wiki](./docs/README.md)
- 🎥 **Video Demos:** Coming Soon

---

## 👨‍💻 **Development Team**

**Created by Mohamed Wael** — _Solo Full-Stack Blockchain Developer_

### **Technical Expertise:**

- ✅ **Blockchain Integration:** Complete 0G ecosystem implementation
- ✅ **AI/ML Systems:** Multi-provider routing with TEE verification
- ✅ **Full-Stack Development:** Next.js, TypeScript, Smart Contracts
- ✅ **DevOps & Infrastructure:** Vercel deployment, CI/CD pipelines

> _"DARA Forge represents the culmination of months of deep integration work with cutting-edge blockchain technology. We've proven that decentralized science isn't just possible — it's superior to traditional centralized methods."_

---

## 🤝 **Contributing**

We welcome contributions from researchers, developers, and blockchain enthusiasts!

### **How to Contribute:**

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### **Contribution Areas:**

- 🔬 **Research Integration:** New data formats and analysis tools
- 🤖 **AI Models:** Additional compute providers and models
- 🎨 **UI/UX:** Interface improvements and accessibility
- 🔐 **Security:** Smart contract audits and penetration testing
- 📚 **Documentation:** Tutorials, guides, and API documentation

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---