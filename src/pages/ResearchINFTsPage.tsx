import RealNFTMarketplace from "@/components/RealNFTMarketplace";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Check,
  Database,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ResearchINFTsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Research iNFTs - DARA Forge";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Create intelligent NFTs with encrypted AI and complete 0G verification proofs. Revolutionary ERC-7857 standard."
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Animated Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-20 pb-16">
        {/* Dynamic Background Animation */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-500/30 rounded-full blur-2xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/2 w-48 h-48 bg-emerald-500/30 rounded-full blur-xl"
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Main Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-4 mb-6">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-xs font-bold text-slate-900">i</span>
                </motion.div>
              </motion.div>

              <div className="text-left">
                <h1 className="text-6xl font-bold text-white mb-2">
                  Research{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    iNFTs
                  </span>
                </h1>
                <p className="text-purple-300 text-lg">
                  Intelligent NFTs • ERC-7857 Standard
                </p>
              </div>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              The first NFTs that carry{" "}
              <span className="text-purple-400 font-semibold">
                encrypted AI intelligence
              </span>{" "}
              and evolve with your research. Unlike static pointer NFTs,
              Research iNFTs transfer the actual
              <span className="text-blue-400 font-semibold">
                {" "}
                AI capabilities and verification proofs
              </span>{" "}
              with ownership.
            </motion.p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[
                {
                  icon: Database,
                  text: "0G Storage Proofs",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  icon: Zap,
                  text: "TEE Attestation",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: Shield,
                  text: "Cryptographic Verification",
                  color: "from-emerald-500 to-emerald-600",
                },
                {
                  icon: Brain,
                  text: "Encrypted Intelligence",
                  color: "from-violet-500 to-violet-600",
                },
              ].map((pill, i) => (
                <motion.div
                  key={pill.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${pill.color} text-white text-sm font-medium shadow-lg`}
                >
                  <pill.icon className="w-4 h-4" />
                  {pill.text}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Comparison Cards */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          >
            {/* Traditional NFTs */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-60" />
              <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-3xl p-8 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-slate-600/50 rounded-2xl flex items-center justify-center">
                    <X className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-300">
                      Traditional NFTs
                    </h3>
                    <p className="text-slate-500">Static Metadata Pointers</p>
                  </div>
                </div>

                <ul className="space-y-4">
                  {[
                    "Just links to external metadata",
                    "No verifiable intelligence",
                    "Cannot evolve or update",
                    "Vulnerable to link rot",
                    "No cryptographic proofs",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="flex items-start gap-3 text-slate-400"
                    >
                      <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Research iNFTs */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Research iNFTs
                    </h3>
                    <p className="text-purple-300">ERC-7857 Intelligence</p>
                  </div>
                </div>

                <ul className="space-y-4">
                  {[
                    "Encrypted AI intelligence on-chain",
                    "Complete 0G verification proofs",
                    "Evolves with new analysis",
                    "Immutable storage + DA proofs",
                    "TEE-verified computations",
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + i * 0.1 }}
                      className="flex items-start gap-3 text-white"
                    >
                      <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Live iNFT Minting Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 rounded-3xl blur-xl" />
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-emerald-500/30 rounded-3xl p-12 text-center">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity },
              }}
              className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
            >
              <Check className="w-12 h-12 text-white" />
            </motion.div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-6">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-emerald-300">
                Live on 0G Mainnet
              </span>
            </div>

            <h2 className="text-4xl font-bold text-white mb-6">
              Research iNFT Minting
              <span className="block text-2xl text-emerald-300 font-normal mt-2">
                Now Available! 🎉
              </span>
            </h2>

            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Complete your research pipeline and mint intelligent NFTs with
              encrypted AI analysis, complete verification proofs, and evolving
              capabilities.{" "}
              <strong className="text-emerald-300">Gasless minting</strong> -
              DARA covers all transaction fees!
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                {
                  icon: Database,
                  label: "Storage Verified",
                  color: "text-emerald-400",
                  status: "✓",
                },
                {
                  icon: Zap,
                  label: "DA Confirmed",
                  color: "text-emerald-400",
                  status: "✓",
                },
                {
                  icon: Shield,
                  label: "Chain Anchored",
                  color: "text-emerald-400",
                  status: "✓",
                },
                {
                  icon: Brain,
                  label: "AI Analyzed",
                  color: "text-emerald-400",
                  status: "✓",
                },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="relative w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                    <step.icon className={`w-8 h-8 ${step.color}`} />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {step.status}
                    </div>
                  </div>
                  <span className="text-sm text-slate-300">{step.label}</span>
                </motion.div>
              ))}
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="text-emerald-400 text-lg font-semibold mb-2">
                  🎁 Zero Gas Fees
                </div>
                <p className="text-sm text-slate-300">
                  DARA covers all minting costs. Focus on research, not
                  transactions.
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="text-blue-400 text-lg font-semibold mb-2">
                  🔒 ERC-7857 Standard
                </div>
                <p className="text-sm text-slate-300">
                  Production-grade intelligent NFTs with encrypted capabilities.
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
                <div className="text-purple-400 text-lg font-semibold mb-2">
                  ⚡ Instant Minting
                </div>
                <p className="text-sm text-slate-300">
                  One-click minting after pipeline completion. No wallet
                  approval needed.
                </p>
              </div>
            </div>

            {/* Contract Info */}
            <div className="bg-slate-900/50 rounded-xl p-4 mb-8 border border-slate-600/50">
              <div className="text-xs text-slate-400 mb-2">
                Deployed Contract (0G Mainnet)
              </div>
              <div className="font-mono text-sm text-purple-300">
                0x3156F6E761D7c9dA0a88A6165864995f2b58854f
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
              onClick={() => navigate("/pipeline")}
            >
              <ArrowRight className="w-5 h-5" />
              Start Minting Research iNFTs
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* NFT Marketplace Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Browse & Collect{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Research iNFTs
            </span>
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Discover groundbreaking research verified on 0G blockchain. Each
            iNFT includes complete verification proofs, encrypted AI analysis,
            and full ownership rights.
          </p>

          {/* Live Blockchain Badge */}
          <div className="mt-4 bg-green-900/20 border border-green-500/50 rounded-lg p-3 max-w-2xl mx-auto">
            <p className="text-sm text-green-400">
              🔥 <strong>Live Marketplace:</strong> Real transactions with OG
              tokens on 0G Mainnet. NFTs transfer directly to your wallet!
            </p>
          </div>
        </motion.div>

        <RealNFTMarketplace />
      </div>
    </div>
  );
}
