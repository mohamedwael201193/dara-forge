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

## � **Acknowledgments**

- **0G Labs** for providing the revolutionary blockchain infrastructure
- **The Scientific Community** for inspiring the mission to solve reproducibility
- **Open Source Contributors** who make decentralized development possible
- **Early Adopters** helping test and improve the platform

---

## 🔮 **Vision Statement**

**DARA Forge is building the infrastructure for humanity's greatest discoveries.**

_Where every breakthrough is verifiable, every dataset is permanent, and every researcher can build upon cryptographically proven foundations._

---

<div align="center">

### 🌟 **Transforming Science Through Blockchain Technology**

[![Star this repo](https://img.shields.io/github/stars/mohamedwael201193/dara-forge?style=social)](https://github.com/mohamedwael201193/dara-forge)
[![Follow on Twitter](https://img.shields.io/twitter/follow/dara_forge?style=social)](https://twitter.com/dara_forge)

**Ready to revolutionize your research?**  
[🚀 **Start Building on DARA Forge Today**](https://dara-forge.vercel.app)

</div>
    E -->|Smart Contract| F[0G Galileo Chain]
    A --> G[Dataset Download]
    G -->|With Proof| C
    C -.->|Verify Integrity| D
    F -.->|Query Anchored Roots| A
```

### 0G Storage Integration

```typescript
// Upload files to 0G Storage with Merkle root generation.
const uploadResponse = await 0gSdk.storage.uploadDirectory(files, {
  token: process.env.OG_API_KEY
});

// Verify uploaded data integrity
const verifyResponse = await 0gSdk.storage.verify(root, {
  token: process.env.OG_API_KEY
});

// Download files with cryptographic proof
const downloadResponse = await 0gSdk.storage.downloadWithProof(root, filePath, {
  token: process.env.OG_API_KEY
});
```

### 0G Chain Integration

```typescript
// Connect to 0G Galileo testnet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Log dataset root to 0G Chain using DaraLogger contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, DARA_ABI, signer);
const tx = await contract.logData(datasetRoot);
const receipt = await tx.wait();

console.log(`Dataset logged on 0G Chain: ${receipt.hash}`);
```

---

## 📊 0G Galileo Testnet Details

| Parameter         | Value                                                              |
| ----------------- | ------------------------------------------------------------------ |
| Network Name      | Galileo (Testnet)                                                  |
| Chain ID          | 16602                                                              |
| RPC URL           | [https://evmrpc-testnet.0g.ai](https://evmrpc-testnet.0g.ai)       |
| Block Explorer    | [https://chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai) |
| Currency Symbol   | 0G                                                                 |
| Currency Decimals | 18                                                                 |

---

## 💻 Getting Started

### Prerequisites

- Node.js (v18 or later)
- MetaMask wallet extension
- 0G Galileo testnet configured in MetaMask

### Local Development

```bash
# Clone the repository
git clone https://github.com/mohamedwael201193/dara-forge.git

# Navigate to project directory
cd dara-forge

# Install dependencies
npm install

# Start development server
npm run dev
```

### Setting Up MetaMask for 0G Galileo

1. Open MetaMask and go to **Networks**
2. Click **Add Network**
3. Enter the following details:

```
Network Name: Galileo (Testnet)
RPC URL: https://evmrpc-testnet.0g.ai
Chain ID: 16602
Currency Symbol: 0G
Block Explorer URL: https://chainscan-galileo.0g.ai
```

---

## 🧪 How It Works

1. **Upload Dataset** → Researchers upload datasets to 0G Storage
2. **Generate Merkle Root** → The system computes a cryptographic root
3. **Verify Integrity** → Dataset integrity is verified via Merkle proofs
4. **Anchor On-Chain** → Dataset root is permanently committed to 0G Chain
5. **Download with Proof** → Anyone can download with cryptographic proof

---

## 🔜 Roadmap

### Wave 1 (Current)

- ✅ 0G Storage integration
- ✅ Merkle root verification
- ✅ 0G Chain anchoring
- ✅ Basic MetaMask wallet connection
- ✅ User-friendly interface
- ✅ Multi-wallet support
- ✅ SIWE authentication
- ✅ Real-time Balance Display

### Wave 2 (Completed)

- ✅ Dataset search & discovery
- ✅ Researcher profiles
- ✅ Enhanced metadata support
- ✅ Versioning, batch uploads, rich metadata (as groundwork for collaborative research ecosystem)
- ✅ Smart contract-enabled role-based project management (as groundwork for collaborative research ecosystem)

### Wave 3 (Future)

- 🔲 0G Compute integration
- 🔲 Collaborative research spaces
- 🔲 Advanced analytics visualization
- 🔲 Cross-chain dataset verification
- 🔲 Academic publishing workflows

---

## 💡 Innovation Highlights

- **Cryptographic Verification** via Merkle trees
- **On-chain Provenance** for permanent dataset history
- **Verifiable Downloads** to ensure data consistency
- **Decentralized Storage** resistant to censorship
- **Research-First Design** optimized for scientists

---

## 👨‍💻 Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Blockchain**: ethers.js, MetaMask
- **Build Tools**: Vite, PostCSS
- **0G Integration**: 0G SDK, 0G Storage API, 0G Chain

---

## 🔗 Important Links

- [Live Demo](https://dara-forge.vercel.app)
- [GitHub Repository](https://github.com/mohamedwael201193/dara-forge)
- [0G Documentation](https://docs.0g.ai)
- [WaveHack Details](https://app.akindo.io/wave-hacks)

---

## 👥 Developer

- **Mohamed Wael**

  - GitHub: [@mohamedwael201193](https://github.com/mohamedwael201193)
  - Twitter: [@Mowael777](https://twitter.com/Mowael777)
  - Telegram: [@Mowael77](https://t.me/Mowael77)

---

## 📜 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

### Environment Variables

To enable 0G Compute functionality, the following environment variables are required:

- `OG_RPC_URL`: RPC URL for the 0G network.
- `OG_COMPUTE_PRIVATE_KEY`: Private key for the wallet used by the compute service.
- `OG_MIN_LEDGER_BALANCE` (Optional): Minimum ledger balance required (default: 0.01).
- `OG_BOOTSTRAP_LEDGER` (Optional): Initial ledger amount to add if balance is zero (default: 0.05).
- `OG_REFILL_AMOUNT` (Optional): Amount to refill the ledger if balance falls below minimum (default: 0.05).

These variables should be set in your Vercel project settings or in a `.env.local` file for local development.

## 🚀 Updates in Wave 2

🚀 **DARA Forge Wave 2: From Vision to Verified Reality on 0G**

We've achieved a significant breakthrough with DARA now LIVE, featuring robust integration with 0G Storage. This enables the processing of real research data with cryptographic verification, ensuring data integrity and trustworthiness. Our focus for Wave 2 has been on expanding DARA into a truly collaborative research ecosystem.

**Key Updates & Deliverables:**

- **Full 0G Storage Integration:** Implemented comprehensive 0G Storage capabilities, allowing for secure and verifiable storage of research datasets. This includes handling of file uploads, generation of root hashes, and tracking of storage transactions, all verifiable on the 0G Storage Explorer (e.g., [https://storagescan-galileo.0g.ai/history](https://storagescan-galileo.0g.ai/history)).

- **Enhanced Wallet Integration & Authentication:** We've significantly improved user accessibility and security by integrating multi-wallet support. Users can now seamlessly connect their wallets via Reown, WalletConnect, Coinbase, and SIWE (Sign-In with Ethereum). This provides a flexible and secure authentication mechanism for researchers.

- **Real-time Balance Display:** The application now prominently displays wallet balances, offering users immediate visibility into their assets and facilitating smoother interactions within the DARA ecosystem.

- **Collaborative Research Ecosystem Foundation:** By focusing on robust 0G Storage and advanced authentication, DARA is evolving beyond a data verification tool into a platform that fosters collaboration. This wave lays the groundwork for future features like versioning, batch uploads, rich metadata, and smart contract-enabled role-based project management.

**Vision for the Future:**

By the end of Wave 2, DARA has transformed into a collaborative research ecosystem powered by 0G, setting the stage for deeper integration with 0G Compute and 0G DA in subsequent waves. Our aim is to provide a definitive, trustless infrastructure for reproducible science, ensuring that every piece of research data is verifiable, secure, and accessible.
