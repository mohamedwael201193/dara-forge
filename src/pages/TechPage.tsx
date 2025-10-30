import { DemoApp } from "@/components/DemoApp";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const TechPage = () => {
  const navigate = useNavigate();

  const handleEndToEndDemo = () => {
    navigate("/pipeline?demo=sample-dataset");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 pt-24">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-h1 text-white mb-6">
              0G Technology{" "}
              <span className="text-gradient-professional">Stack</span>
            </h1>
            <p className="text-lead max-w-3xl mx-auto mb-8">
              Complete decentralized infrastructure for research verification,
              storage, and ownership. Live on 0G Mainnet with split
              architecture: Storage/Anchor/iNFTs on mainnet, Compute/DA on
              Galileo testnet.
            </p>

            {/* Action Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={handleEndToEndDemo}
                className="btn-primary px-8 py-4 text-lg hover:scale-105 transition-transform duration-300"
              >
                <ExternalLink className="w-6 h-6 mr-3" />
                Try Full Pipeline Demo
              </button>
            </div>

            {/* Status Indicators */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "Storage", status: "operational" },
                { label: "Compute", status: "operational" },
                { label: "DA Layer", status: "operational" },
                { label: "Chain", status: "operational" },
              ].map((service) => (
                <div
                  key={service.label}
                  className="flex items-center space-x-2 card-professional px-3 py-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-verified" />
                  <span className="text-sm text-slate-300">
                    {service.label}
                  </span>
                  <div className="w-2 h-2 bg-emerald-verified rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Architecture Overview */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Research Pipeline Flow
            </h2>
          </motion.div>

          {/* Simplified Flow */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            {[
              {
                icon: Database,
                label: "Storage",
                color: "text-blue-400",
                desc: "Upload data",
              },
              { icon: ArrowRight, label: "", color: "text-slate-500" },
              {
                icon: Shield,
                label: "DA",
                color: "text-amber-400",
                desc: "Publish availability",
              },
              { icon: ArrowRight, label: "", color: "text-slate-500" },
              {
                icon: Zap,
                label: "Chain",
                color: "text-purple-400",
                desc: "Anchor on blockchain",
              },
              { icon: ArrowRight, label: "", color: "text-slate-500" },
              {
                icon: Cpu,
                label: "Compute",
                color: "text-emerald-400",
                desc: "Process & verify",
              },
              { icon: ArrowRight, label: "", color: "text-slate-500" },
              {
                icon: FileText,
                label: "Passport",
                color: "text-cyan-400",
                desc: "Download proof",
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return step.label ? (
                <motion.div
                  key={index}
                  className="flex flex-col items-center max-w-[100px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div
                    className={`p-3 rounded-xl bg-slate-800 border border-slate-700 mb-2`}
                  >
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">
                    {step.label}
                  </span>
                  <span className="text-xs text-slate-500 text-center">
                    {step.desc}
                  </span>
                </motion.div>
              ) : (
                <Icon key={index} className={`w-5 h-5 ${step.color}`} />
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Technology Components
            </h2>
            <p className="text-lg text-slate-400">
              Decentralized infrastructure powering research verification
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Storage Component */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-500/30 rounded-3xl p-8 hover:border-blue-400/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <Database className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      0G Storage
                    </h3>
                    <p className="text-blue-300">Decentralized Data Layer</p>
                  </div>
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Immutable data storage with cryptographic proof generation.
                  Every file receives a Merkle tree root for verification.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    {
                      text: "Merkle tree verification",
                      color: "text-blue-400",
                    },
                    { text: "Cryptographic proofs", color: "text-cyan-400" },
                    { text: "Immutable storage", color: "text-blue-300" },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${feature.color.replace(
                          "text-",
                          "bg-"
                        )} animate-pulse`}
                      />
                      <span className="text-slate-300 text-sm">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full btn-secondary group"
                  onClick={() => navigate("/pipeline")}
                >
                  <span>Try Storage</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            {/* Compute Component */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/30 rounded-3xl p-8 hover:border-emerald-400/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                    <Cpu className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      0G Compute
                    </h3>
                    <p className="text-emerald-300">TEE Verification Layer</p>
                  </div>
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Trusted execution environment for AI analysis with
                  cryptographic attestation of compute integrity.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    {
                      text: "TEE attestation signatures",
                      color: "text-emerald-400",
                    },
                    { text: "AI model execution", color: "text-teal-400" },
                    {
                      text: "Verifiable compute proofs",
                      color: "text-emerald-300",
                    },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${feature.color.replace(
                          "text-",
                          "bg-"
                        )} animate-pulse`}
                      />
                      <span className="text-slate-300 text-sm">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full btn-secondary group"
                  onClick={() => navigate("/pipeline")}
                >
                  <span>Try Compute</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            {/* DA Layer Component */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/30 rounded-3xl p-8 hover:border-amber-400/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">0G DA</h3>
                    <p className="text-amber-300">Data Availability</p>
                  </div>
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Ensures data availability across multiple endpoints with
                  cryptographic commitments and proofs.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    {
                      text: "Multi-endpoint availability",
                      color: "text-amber-400",
                    },
                    { text: "Blob hash commitments", color: "text-orange-400" },
                    { text: "KZG proof verification", color: "text-amber-300" },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${feature.color.replace(
                          "text-",
                          "bg-"
                        )} animate-pulse`}
                      />
                      <span className="text-slate-300 text-sm">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full btn-secondary group"
                  onClick={() => navigate("/pipeline")}
                >
                  <span>Try DA Layer</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            {/* Chain Anchoring Component */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-purple-500/10 to-violet-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Chain Anchor
                    </h3>
                    <p className="text-purple-300">Blockchain Registry</p>
                  </div>
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Smart contract anchoring on 0G Galileo network for immutable
                  research record keeping.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    {
                      text: "Smart contract registry",
                      color: "text-purple-400",
                    },
                    { text: "Transaction proof", color: "text-violet-400" },
                    { text: "Immutable timestamps", color: "text-purple-300" },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${feature.color.replace(
                          "text-",
                          "bg-"
                        )} animate-pulse`}
                      />
                      <span className="text-slate-300 text-sm">
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full btn-secondary group"
                  onClick={() => navigate("/pipeline")}
                >
                  <span>Try Chain Anchor</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>

            {/* Research iNFTs Component */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative group md:col-span-2 lg:col-span-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center relative"
                  >
                    <motion.div
                      className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <span className="text-xs font-bold text-slate-900">
                        i
                      </span>
                    </motion.div>
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Research iNFTs
                    </h3>
                    <p className="text-purple-300">
                      ERC-7857 • Intelligent NFTs
                    </p>
                  </div>
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">
                  Revolutionary NFTs that carry encrypted AI intelligence and
                  complete research verification. Unlike static NFTs, Research
                  iNFTs evolve with new analysis and transfer actual AI
                  capabilities.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    {
                      text: "Encrypted intelligence on 0G Storage",
                      color: "text-purple-400",
                    },
                    {
                      text: "Secure re-encryption on transfer",
                      color: "text-blue-400",
                    },
                    {
                      text: "Authorized usage control",
                      color: "text-emerald-400",
                    },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${feature.color.replace(
                          "text-",
                          "bg-"
                        )} animate-pulse`}
                      />
                      <span className="text-slate-300 text-sm">
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full btn-secondary group"
                  onClick={() => navigate("/infts")}
                >
                  <span>Explore Research iNFTs</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Full DARA Platform Interface */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              DARA Research Platform
            </h2>
            <p className="text-lg text-slate-400">
              Complete 0G integration - All components live and operational
            </p>
          </motion.div>

          {/* Full Height Demo Platform */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/50">
              <h4 className="text-lg font-semibold text-white mb-2">
                Live 0G Technology Stack
              </h4>
              <p className="text-sm text-slate-400">
                Full-featured interface with Storage, Compute, DA Layer, and
                Chain - Production deployment on 0G Mainnet (Chain ID: 16661)
                and Galileo Testnet (Chain ID: 16602)
              </p>
            </div>

            {/* Full Height DemoApp - No Scroll Constraints */}
            <div className="bg-slate-900/20">
              <div className="p-4">
                <DemoApp />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TechPage;
