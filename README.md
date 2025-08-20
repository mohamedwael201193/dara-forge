
# DARA Forge: Decentralized AI Research Assistant

---

## 🚀 Project Overview
DARA Forge revolutionizes scientific research by providing a decentralized platform for storing, verifying, and sharing research datasets with cryptographic integrity guarantees. Built on 0G's modular blockchain infrastructure, DARA Forge ensures that research data remains tamper-proof, verifiable, and permanently accessible.

---

## 🎯 Key Problems Solved
- **Data Integrity**: Research data can be cryptographically verified against tampering  
- **Transparent Provenance**: Clear lineage of dataset origins and modifications  
- **Permanent Record**: Dataset proofs anchored on-chain for immutable references  
- **Open Science**: Promotes reproducibility and verification in scientific research  

---

## ⚡ Live Demo
👉 [Experience DARA Forge](https://dara-forge.vercel.app)

---

## 🔍 Core Features

| Feature | Description |
|---------|-------------|
| **0G Integration** | Secure dataset upload with cryptographic guarantees |
| **Merkle Root Verification** | Verify dataset integrity using cryptographic Merkle proofs |
| **On-Chain Anchoring** | Permanently commit dataset proofs to the blockchain |
| **Proof-Based Downloads** | Download datasets with cryptographic proof of integrity |
| **Propagation Verification** | Ensure dataset availability across the 0G network |

---

## 🔧 Technical Implementation

### How DARA Forge Integrates with 0G Stack

```mermaid
graph TD
    A[User Interface] --> B[Dataset Upload]
    B -->|0G Storage SDK| C[0G Storage]
    A --> D[Dataset Verification]
    D -->|Merkle Proofs| C
    A --> E[Chain Anchoring]
    E -->|Smart Contract| F[0G Galileo Chain]
    A --> G[Dataset Download]
    G -->|With Proof| C
    C -.->|Verify Integrity| D
    F -.->|Query Anchored Roots| A
````

### 0G Storage Integration

```typescript
// Upload files to 0G Storage with Merkle root generation
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

// Commit dataset root to 0G Chain
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
const tx = await contract.anchorData(datasetRoot);
const receipt = await tx.wait();

console.log(`Dataset anchored on 0G Chain: ${receipt.hash}`);
```

---

## 📊 0G Galileo Testnet Details

| Parameter         | Value                                                              |
| ----------------- | ------------------------------------------------------------------ |
| Network Name      | 0G-Galileo-Testnet                                                 |
| Chain ID          | 16601                                                              |
| RPC URL           | [https://16601.rpc.thirdweb.com](https://16601.rpc.thirdweb.com)   |
| Block Explorer    | [https://chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai) |
| Currency Symbol   | OG                                                                 |
| Currency Decimals | 18                                                                 |

---

## 💻 Getting Started

### Prerequisites

* Node.js (v18 or later)
* MetaMask wallet extension
* 0G Galileo testnet configured in MetaMask

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
Network Name: 0G-Galileo-Testnet  
RPC URL: https://16601.rpc.thirdweb.com  
Chain ID: 16601  
Currency Symbol: OG  
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

* ✅ 0G Storage integration
* ✅ Merkle root verification
* ✅ 0G Chain anchoring
* ✅ Basic MetaMask wallet connection
* ✅ User-friendly interface

### Wave 2 (Planned)

* 🔲 Multi-wallet support
* 🔲 SIWE authentication
* 🔲 Dataset search & discovery
* 🔲 Researcher profiles
* 🔲 Enhanced metadata support

### Wave 3 (Future)

* 🔲 0G Compute integration
* 🔲 Collaborative research spaces
* 🔲 Advanced analytics visualization
* 🔲 Cross-chain dataset verification
* 🔲 Academic publishing workflows

---

## 💡 Innovation Highlights

* **Cryptographic Verification** via Merkle trees
* **On-chain Provenance** for permanent dataset history
* **Verifiable Downloads** to ensure data consistency
* **Decentralized Storage** resistant to censorship
* **Research-First Design** optimized for scientists

---

## 👨‍💻 Technologies Used

* **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
* **Blockchain**: ethers.js, MetaMask
* **Build Tools**: Vite, PostCSS
* **0G Integration**: 0G SDK, 0G Storage API, 0G Chain

---

## 🔗 Important Links

* [Live Demo](https://dara-forge.vercel.app)
* [GitHub Repository](https://github.com/mohamedwael201193/dara-forge)
* [0G Documentation](https://docs.0g.ai)
* [WaveHack Details](https://app.akindo.io/wave-hacks)

---

## 👥 Developer

* **Mohamed Wael** 

  * GitHub: [@mohamedwael201193](https://github.com/mohamedwael201193)
  * Twitter: [@Mowael777](https://twitter.com/Mowael777)
  * Telegram: [@Mowael77](https://t.me/Mowael77)

---

## 📜 License

This project is licensed under the **MIT License** - see the LICENSE file for details.


