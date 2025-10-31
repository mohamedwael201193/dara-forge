import { motion } from "framer-motion";
import {
  Brain,
  Clock,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  Heart,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useAccount } from "wagmi";

interface NFTMetadata {
  tokenId: string;
  name: string;
  description: string;
  image: string;
  price: string;
  owner: string;
  ownerENS?: string;
  researchTopic: string;
  verificationScore: number;
  citationCount: number;
  timestamp: string;
  attributes: {
    storageCID: string;
    anchorHash: string;
    daCommitment: string;
    computeAttestation: string;
    fileName: string;
    fileSize: string;
    aiAnalysis: {
      wordCount: number;
      sentiment: number;
      topics: string[];
      quality: number;
    };
  };
  stats: {
    views: number;
    likes: number;
    downloads: number;
  };
  category:
    | "AI"
    | "Blockchain"
    | "Biology"
    | "Physics"
    | "Chemistry"
    | "Mathematics";
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
}

// Mock NFT data (in production, fetch from blockchain/API)
const mockNFTs: NFTMetadata[] = [
  {
    tokenId: "1761849189960",
    name: "Zero-Knowledge AI Consensus Protocol",
    description:
      "Research on combining ZK-SNARKs with distributed AI training for privacy-preserving machine learning on blockchain networks.",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    price: "2.5",
    owner: "0x1dF8e57ea7A6A3bB554E13412b27d4d26BBA851B",
    ownerENS: "researcher.eth",
    researchTopic: "AI & Blockchain Convergence",
    verificationScore: 98,
    citationCount: 47,
    timestamp: "2025-10-30T17:52:39.915Z",
    category: "AI",
    rarity: "Legendary",
    attributes: {
      storageCID:
        "0xda25a5f5ea40e210db0a66280164b7b65dd2d1030ab8929285441c74ced3e2945",
      anchorHash:
        "0xf3cd91ef610c041581fe2854ebca490d9dcb3ff4a7b6d90ebc0c59f6ad0bc46d",
      daCommitment:
        "0x91a3a9f4a91844e27712ff28455d88c9cdbe859fa1bd13cc0a9a4e33ccde0fe7",
      computeAttestation:
        "0x7f8e9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
      fileName: "zk_ai_consensus.pdf",
      fileSize: "3.2 MB",
      aiAnalysis: {
        wordCount: 8432,
        sentiment: 0.92,
        topics: [
          "Zero-Knowledge Proofs",
          "AI Training",
          "Blockchain Consensus",
        ],
        quality: 98,
      },
    },
    stats: {
      views: 1247,
      likes: 342,
      downloads: 89,
    },
  },
  {
    tokenId: "1761849189961",
    name: "Decentralized Storage Optimization",
    description:
      "Novel sharding algorithm for 0G Storage Network achieving 10x throughput improvement with cryptographic verification.",
    image:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&q=80",
    price: "1.8",
    owner: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    ownerENS: "storage.eth",
    researchTopic: "Distributed Systems",
    verificationScore: 95,
    citationCount: 31,
    timestamp: "2025-10-29T14:23:12.345Z",
    category: "Blockchain",
    rarity: "Epic",
    attributes: {
      storageCID:
        "0x8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
      anchorHash:
        "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f",
      daCommitment:
        "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
      computeAttestation:
        "0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b",
      fileName: "storage_optimization.pdf",
      fileSize: "2.1 MB",
      aiAnalysis: {
        wordCount: 6234,
        sentiment: 0.88,
        topics: ["Sharding", "Storage Networks", "Performance Optimization"],
        quality: 95,
      },
    },
    stats: {
      views: 892,
      likes: 234,
      downloads: 67,
    },
  },
  {
    tokenId: "1761849189962",
    name: "Quantum-Resistant Blockchain Signatures",
    description:
      "Implementation of post-quantum cryptographic signatures for long-term blockchain security against quantum computing threats.",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    price: "3.2",
    owner: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
    researchTopic: "Quantum Cryptography",
    verificationScore: 99,
    citationCount: 62,
    timestamp: "2025-10-28T09:45:22.678Z",
    category: "Physics",
    rarity: "Legendary",
    attributes: {
      storageCID:
        "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
      anchorHash:
        "0x9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f",
      daCommitment:
        "0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
      computeAttestation:
        "0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b",
      fileName: "quantum_signatures.pdf",
      fileSize: "4.8 MB",
      aiAnalysis: {
        wordCount: 12543,
        sentiment: 0.94,
        topics: ["Quantum Computing", "Cryptography", "Post-Quantum"],
        quality: 99,
      },
    },
    stats: {
      views: 2341,
      likes: 678,
      downloads: 145,
    },
  },
  {
    tokenId: "1761849189963",
    name: "Bio-Inspired Consensus Mechanisms",
    description:
      "Novel consensus protocol based on ant colony optimization for energy-efficient blockchain validation.",
    image:
      "https://images.unsplash.com/photo-1576319155264-99536e0be1ee?w=800&q=80",
    price: "1.5",
    owner: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    ownerENS: "bio.eth",
    researchTopic: "Bio-Computing",
    verificationScore: 91,
    citationCount: 23,
    timestamp: "2025-10-27T16:12:45.234Z",
    category: "Biology",
    rarity: "Rare",
    attributes: {
      storageCID:
        "0x6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e",
      anchorHash:
        "0x4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
      daCommitment:
        "0x2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
      computeAttestation:
        "0x0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
      fileName: "bio_consensus.pdf",
      fileSize: "1.9 MB",
      aiAnalysis: {
        wordCount: 4567,
        sentiment: 0.85,
        topics: ["Ant Colony", "Consensus", "Energy Efficiency"],
        quality: 91,
      },
    },
    stats: {
      views: 567,
      likes: 145,
      downloads: 34,
    },
  },
  {
    tokenId: "WELCOME-001",
    name: "🎁 Welcome to DARA Research iNFTs",
    description:
      "Your first research passport! This FREE welcome iNFT demonstrates the power of verifiable research credentials. Claim it now and start your journey into decentralized science.",
    image:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
    price: "0",
    owner: "0x0000000000000000000000000000000000000000",
    ownerENS: "dara.protocol",
    researchTopic: "Getting Started with DARA",
    verificationScore: 100,
    citationCount: 1234,
    timestamp: "2025-10-30T00:00:00.000Z",
    category: "AI",
    rarity: "Legendary",
    attributes: {
      storageCID:
        "0xWELCOME000000000000000000000000000000000000000000000000000000001",
      anchorHash:
        "0xFREE0000000000000000000000000000000000000000000000000000000000001",
      daCommitment:
        "0xCLAIM000000000000000000000000000000000000000000000000000000000001",
      computeAttestation:
        "0xSTART000000000000000000000000000000000000000000000000000000000001",
      fileName: "welcome_guide.pdf",
      fileSize: "1.2 MB",
      aiAnalysis: {
        wordCount: 2500,
        sentiment: 1.0,
        topics: ["Getting Started", "DARA Platform", "Research iNFTs"],
        quality: 100,
      },
    },
    stats: {
      views: 15234,
      likes: 8942,
      downloads: 4521,
    },
  },
];

const rarityColors = {
  Common: "from-slate-500 to-slate-600",
  Rare: "from-blue-500 to-blue-600",
  Epic: "from-purple-500 to-purple-600",
  Legendary: "from-amber-500 to-orange-600",
};

const rarityGlow = {
  Common: "shadow-slate-500/20",
  Rare: "shadow-blue-500/40",
  Epic: "shadow-purple-500/50",
  Legendary: "shadow-amber-500/60 animate-pulse",
};

export default function NFTMarketplace() {
  const { address } = useAccount();
  const [selectedNFT, setSelectedNFT] = useState<NFTMetadata | null>(null);
  const [filter, setFilter] = useState<"all" | "legendary" | "epic" | "rare">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"latest" | "price" | "popular">(
    "latest"
  );

  const filteredNFTs = mockNFTs.filter((nft) => {
    if (filter === "all") return true;
    return nft.rarity.toLowerCase() === filter;
  });

  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    if (sortBy === "price") return parseFloat(b.price) - parseFloat(a.price);
    if (sortBy === "popular") return b.stats.views - a.stats.views;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handleBuy = async (nft: NFTMetadata) => {
    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    // Handle FREE welcome NFT claim
    if (nft.price === "0") {
      alert(
        `🎉 Claiming FREE Welcome iNFT!\n\n` +
          `${nft.name}\n\n` +
          `This is your first research passport - completely FREE! ✨\n\n` +
          `In production, this would:\n` +
          `• Mint the NFT to your wallet (0 gas cost)\n` +
          `• Grant you access to all marketplace features\n` +
          `• Welcome you to the DARA community\n\n` +
          `Transaction would be processed on 0G Mainnet.`
      );
      return;
    }

    // Handle paid NFT purchase
    alert(
      `Purchasing ${nft.name} for ${nft.price} OG...\n\n` +
        `This will be implemented with smart contract integration.\n\n` +
        `Transaction will:\n` +
        `• Transfer ${nft.price} OG from your wallet\n` +
        `• Transfer NFT ownership to you\n` +
        `• Grant access to encrypted research data\n` +
        `• Record on 0G Mainnet blockchain`
    );
  };

  return (
    <div className="py-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-6">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-sm font-semibold text-purple-300">
              Live Marketplace • {mockNFTs.length} iNFTs Available
            </span>
          </div>

          <h2 className="text-5xl font-bold text-white mb-4">
            Discover Research{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              iNFTs
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Own verified research with encrypted AI intelligence. Each iNFT
            carries complete 0G proofs and evolves with citations.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex gap-3">
            {[
              { value: "all", label: "All iNFTs", icon: Sparkles },
              { value: "legendary", label: "Legendary", icon: Star },
              { value: "epic", label: "Epic", icon: Zap },
              { value: "rare", label: "Rare", icon: TrendingUp },
            ].map((f) => (
              <motion.button
                key={f.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f.value as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  filter === f.value
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
                }`}
              >
                <f.icon className="w-4 h-4" />
                {f.label}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="latest">Latest</option>
              <option value="price">Highest Price</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedNFTs.map((nft, index) => (
            <motion.div
              key={nft.tokenId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative"
            >
              {/* Glow effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${
                  rarityColors[nft.rarity]
                } rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
                  rarityGlow[nft.rarity]
                }`}
              />

              {/* Card */}
              <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Rarity badge */}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 bg-gradient-to-r ${
                      rarityColors[nft.rarity]
                    } rounded-full text-xs font-bold text-white shadow-lg`}
                  >
                    {nft.rarity}
                  </div>

                  {/* FREE badge for welcome NFT */}
                  {nft.price === "0" && (
                    <div className="absolute top-16 right-4 px-3 py-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full text-xs font-bold text-white shadow-lg animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      FREE
                    </div>
                  )}

                  {/* Category badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-full text-xs font-semibold text-purple-300 border border-purple-500/30">
                    {nft.category}
                  </div>

                  {/* Stats overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4">
                    <div className="flex items-center gap-4 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {nft.stats.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-red-400" />
                        {nft.stats.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-emerald-400" />
                        {nft.stats.downloads}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {nft.name}
                  </h3>

                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                    {nft.description}
                  </p>

                  {/* Research topic */}
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-300">
                      {nft.researchTopic}
                    </span>
                  </div>

                  {/* Verification score */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-300">
                        Verification
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${nft.verificationScore}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        {nft.verificationScore}%
                      </span>
                    </div>
                  </div>

                  {/* AI Analysis preview */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                      <div className="text-xs text-slate-400 mb-1">Quality</div>
                      <div className="text-lg font-bold text-purple-400">
                        {nft.attributes.aiAnalysis.quality}/100
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                      <div className="text-xs text-slate-400 mb-1">
                        Citations
                      </div>
                      <div className="text-lg font-bold text-blue-400">
                        {nft.citationCount}
                      </div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {nft.ownerENS
                        ? nft.ownerENS[0].toUpperCase()
                        : nft.owner.slice(2, 4)}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Owned by</div>
                      <div className="text-xs font-mono text-slate-300">
                        {nft.ownerENS ||
                          `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Price</div>
                      {nft.price === "0" ? (
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent flex items-baseline gap-1">
                          FREE
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                          {nft.price}
                          <span className="text-sm text-slate-400">OG</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedNFT(nft)}
                        className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5 text-purple-400" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBuy(nft)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-white transition-all shadow-lg ${
                          nft.price === "0"
                            ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                        }`}
                      >
                        {nft.price === "0" ? (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Claim Free
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Buy Now
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 overflow-y-auto"
          onClick={() => setSelectedNFT(null)}
        >
          <div className="min-h-screen flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl"
            >
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: Image */}
                <div className="relative h-[500px] md:h-auto">
                  <img
                    src={selectedNFT.image}
                    alt={selectedNFT.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className={`absolute top-6 left-6 px-4 py-2 bg-gradient-to-r ${
                      rarityColors[selectedNFT.rarity]
                    } rounded-full text-sm font-bold text-white shadow-lg`}
                  >
                    {selectedNFT.rarity}
                  </div>
                </div>

                {/* Right: Details */}
                <div className="p-8 overflow-y-auto max-h-[600px]">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {selectedNFT.name}
                      </h2>
                      <p className="text-slate-400">
                        Token ID: #{selectedNFT.tokenId}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedNFT(null)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-slate-300 mb-6">
                    {selectedNFT.description}
                  </p>

                  {/* Verification Proofs */}
                  <div className="space-y-3 mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-400" />
                      Verification Proofs
                    </h3>

                    {[
                      {
                        label: "Storage CID",
                        value: selectedNFT.attributes.storageCID,
                        icon: Database,
                      },
                      {
                        label: "Anchor Hash",
                        value: selectedNFT.attributes.anchorHash,
                        icon: Shield,
                      },
                      {
                        label: "DA Commitment",
                        value: selectedNFT.attributes.daCommitment,
                        icon: FileText,
                      },
                      {
                        label: "Compute Attestation",
                        value: selectedNFT.attributes.computeAttestation,
                        icon: Zap,
                      },
                    ].map((proof) => (
                      <div
                        key={proof.label}
                        className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <proof.icon className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-semibold text-slate-400">
                            {proof.label}
                          </span>
                        </div>
                        <div className="font-mono text-xs text-slate-300 break-all">
                          {proof.value.slice(0, 20)}...{proof.value.slice(-20)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/30 mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-purple-400" />
                      AI Analysis Results
                    </h3>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">
                          Word Count
                        </div>
                        <div className="text-xl font-bold text-white">
                          {selectedNFT.attributes.aiAnalysis.wordCount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">
                          Quality Score
                        </div>
                        <div className="text-xl font-bold text-emerald-400">
                          {selectedNFT.attributes.aiAnalysis.quality}/100
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">
                          Sentiment
                        </div>
                        <div className="text-xl font-bold text-blue-400">
                          {(
                            selectedNFT.attributes.aiAnalysis.sentiment * 100
                          ).toFixed(0)}
                          %
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">
                          Citations
                        </div>
                        <div className="text-xl font-bold text-purple-400">
                          {selectedNFT.citationCount}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-slate-400 mb-2">
                        Key Topics
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedNFT.attributes.aiAnalysis.topics.map(
                          (topic) => (
                            <span
                              key={topic}
                              className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300"
                            >
                              {topic}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-300">
                        {selectedNFT.stats.views} views
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-slate-300">
                        {selectedNFT.stats.likes} likes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-slate-300">
                        {new Date(selectedNFT.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Purchase Section */}
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">
                          Current Price
                        </div>
                        {selectedNFT.price === "0" ? (
                          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent flex items-baseline gap-2">
                            FREE
                            <Sparkles className="w-6 h-6 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                            {selectedNFT.price}
                            <span className="text-lg text-slate-400">OG</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 mb-1">Owner</div>
                        <div className="text-sm font-mono text-slate-300">
                          {selectedNFT.ownerENS ||
                            `${selectedNFT.owner.slice(
                              0,
                              6
                            )}...${selectedNFT.owner.slice(-4)}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBuy(selectedNFT)}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                          selectedNFT.price === "0"
                            ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                        }`}
                      >
                        {selectedNFT.price === "0" ? (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Claim FREE Welcome iNFT
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Buy Now for {selectedNFT.price} OG
                          </>
                        )}
                      </motion.button>

                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={`https://chainscan.0g.ai/token/0x3156F6E761D7c9dA0a88A6165864995f2b58854f/instance/${selectedNFT.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-4 py-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 text-purple-400" />
                      </motion.a>
                    </div>

                    <p className="text-xs text-slate-400 text-center mt-4">
                      {selectedNFT.price === "0" ? (
                        <>
                          🎁 <strong>FREE</strong> welcome iNFT for new users •
                          No gas fees • Instant claim
                        </>
                      ) : (
                        <>
                          🔒 Secure purchase via 0G smart contract • Full
                          verification proofs included
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
