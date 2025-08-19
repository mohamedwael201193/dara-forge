# DARA Forge: Decentralized AI Research Assistant

## Accelerating Scientific Discovery with Verifiable On-Chain AI

🌟 **Live Demo:** [https://dara-forge.vercel.app/](https://dara-forge.vercel.app/)

--- 

## Project Overview

DARA Forge is a breakthrough platform that transforms how researchers conduct AI-powered analysis on large datasets. By leveraging 0G's blockchain infrastructure, DARA Forge creates a trustless environment where dataset integrity is cryptographically verifiable and permanently anchored on-chain.

**Key Problems Solved:**

*   ✅ Ensures data integrity through cryptographic verification.
*   ✅ Makes AI research results auditable and reproducible.
*   ✅ Provides transparent provenance tracking for datasets.
*   ✅ Democratizes access to decentralized storage for research data.

## Core Features (Implemented in Wave 1)

| Feature                   | Description                                                                | Status        |
| :----------------------- | :------------------------------------------------------------------- | :------------ |
| **0G Storage Integration**     | Upload research datasets to decentralized storage with Merkle root verification | ✅ Implemented       |
| **Dataset Verification** | Cryptographically verify dataset integrity using Merkle proofs        | ✅ Implemented       |
| **0G Chain Anchoring**       | Permanently commit dataset roots to 0G Galileo blockchain         | ✅ Implemented       |
| **Wallet Connection**         | Connect to MetaMask for blockchain transactions                               | ✅ Implemented       |
| **Proof-Based Downloads** | Download datasets with cryptographic proof of integrity                       | ✅ Implemented       |

---



## Technical Implementation

### 0G Integration Architecture

```mermaid
graph TD
    A[User Interface] --> B(API Endpoints)
    B --> C(0G Storage API)
    B --> D(0G Chain (Galileo))
    A --> D
```

### 0G Technology Stack Utilization

#### 0G Storage

```typescript
// Dataset upload to 0G Storage
const uploadResponse = await 0gSdk.storage.uploadDirectory(
  files,
  { token: process.env.OG_API_KEY }
);
const datasetRoot = uploadResponse.root;
```

#### 0G Verification

```typescript
// Verify dataset integrity
const verificationResult = await 0gSdk.storage.verify(
  datasetRoot,
  { token: process.env.OG_API_KEY }
);
```

#### 0G Chain (Galileo Testnet)

```typescript
// Commit dataset root to 0G Chain
const contract = new ethers.Contract(
  ANCHOR_CONTRACT_ADDRESS,
  ANCHOR_CONTRACT_ABI,
  signer
);
const tx = await contract.anchorData(datasetRoot);
await tx.wait();
```

---



## 0G Network Details

| Parameter         | Value                               |
| :-------------- | :------------------------------------ |
| **Network Name**  | `0G-Galileo-Testnet`                  |
| **Chain ID**      | `16601`                               |
| **RPC URL**       | `https://16601.rpc.thirdweb.com`      |
| **Block Explorer**| `https://chainscan-galileo.0g.ai`     |
| **Native Token**  | `OG`                                  |
| **0G Storage API**| `https://api.0g.ai/storage/v1`        |

---



## Installation & Setup

### Prerequisites

*   Node.js 18+
*   MetaMask wallet with 0G Galileo network configured
*   Some OG tokens for transaction fees

### Local Development

```bash
# Clone the repository
git clone https://github.com/mohamedwael201193/dara-forge.git

# Navigate to project directory
cd dara-forge

# Install dependencies
npm install

# Create .env file with required variables
echo "VITE_WC_PROJECT_ID=your_project_id_here" > .env

# Start development server
npm run dev
```

### Connecting to 0G Galileo Testnet

Add the following network to MetaMask:

*   Network Name: `0G-Galileo-Testnet`
*   RPC URL: `https://16601.rpc.thirdweb.com`
*   Chain ID: `16601`
*   Symbol: `OG`
*   Block Explorer: `https://chainscan-galileo.0g.ai`

---



## Using DARA Forge

1.  **Connect Wallet:** Click "Connect Wallet" and select MetaMask
2.  **Upload Dataset:** Use the "Upload Dataset" feature to store your research data on 0G Storage
3.  **Verify Integrity:** Check dataset integrity with cryptographic verification
4.  **Commit to 0G Chain:** Anchor your dataset root to the blockchain for permanent proof
5.  **Download with Proof:** Retrieve your dataset with cryptographic proof of integrity

---



## Future Roadmap (Post Wave 1)

| Phase   | Features                                                                                             |
| :------ | :--------------------------------------------------------------------------------------------------- |
| Wave 2  | • Multi-wallet support (WalletConnect, Coinbase Wallet, etc.)<br>• SIWE authentication<br>• Dataset search & discovery<br>• User profiles & dataset management |
| Wave 3  | • AI model execution on 0G Compute<br>• Advanced analytics visualization<br>• Collaborative research spaces<br>• Tokenized incentive system       |

---



## Why This Project Is Wave‑1 Ready (Mapped to Judging Criteria)

**Working Demo & Functionality (30%)** — The live demo demonstrates the full flow end‑to‑end: upload to 0G Storage, compute dataset and manifest roots, verify integrity via Merkle proofs, anchor on 0G Chain (Galileo), handle propagation gracefully, and allow proof‑verified downloads. The happy path is clear and reproducible for judges.

**0G Tech Stack Integration (30%)** — The app integrates multiple 0G services in concert: Storage (upload/verify), Chain (on‑chain anchoring and explorer linking), and the Indexer (propagation and retrieval). The README documents exact endpoints and chain parameters so judges can follow along.

**Creativity & UX (15%)** — The UI is intentionally simple and focused, with clear states during propagation ("Propagating…" instead of false negatives), visible verification badges, and a proof‑aware download button that only enables when ready. Copy actions reduce friction when sharing roots or tx hashes.

**Real Use Case & Scalability (10%)** — The flow generalizes to any domain that requires verifiable datasets (research, compliance, ML benchmarks). The architecture is modular and can scale by adding multi‑wallet support, SIWE authentication, or 0G Compute jobs in the next waves.

**Vision & Roadmap (10%)** — A concrete roadmap is included below for Wave‑2/3 that adds authentication, multi‑wallet, discovery, and compute, with minimal churn to the current code.

---



## Technical Innovations

*   **Merkle Tree Verification:** Ensures dataset integrity with cryptographic proofs
*   **On-chain Anchoring:** Permanent record of dataset existence and integrity
*   **Proof-based Downloads:** Verifiable retrieval of research datasets
*   **Chain-agnostic Design:** Architecture supports future cross-chain compatibility

---



## Technologies Used

*   **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui
*   **Build Tools:** Vite, PostCSS
*   **Blockchain:** ethers.js, MetaMask
*   **0G Integration:** 0G SDK, 0G Storage API

---



## Important Links

*   [Live Demo](https://dara-forge.vercel.app/)
*   [GitHub Repository](https://github.com/mohamedwael201193/dara-forge)
*   [0G Documentation](https://docs.0g.ai/developer-hub/building-on-0g/introduction)
*   [WaveHack Details](https://app.akindo.io/wave-hacks/xKOgjd91kCmrN3ORz)

## License
This project is licensed under the MIT License - see the LICENSE file for details.

---

