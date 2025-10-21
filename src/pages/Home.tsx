import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Brain,
  CheckCircle,
  Lock,
  Share2,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConnectWalletButton from "../components/ConnectWalletButton";
import HeroBackground from "../components/HeroBackground";

const Home = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* DARA Scientific Research Animated Background */}
        <HeroBackground />

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.h1
              className="text-h1 text-white leading-tight"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Decentralized{" "}
              <span className="text-gradient-professional">
                Research Platform
              </span>
            </motion.h1>

            <motion.h2
              className="text-h3 text-slate-300 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Secure, Verify, and Own Your Scientific Discoveries
            </motion.h2>

            <motion.p
              className="text-lead max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              The first platform to turn research into blockchain-verified NFTs
              using 0G technology. Upload, analyze, publish, and mint your
              discoveries with complete decentralized infrastructure.
            </motion.p>

            {/* Wallet Connect - Shows BELOW hero text */}
            <motion.div
              className="flex justify-center pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <ConnectWalletButton />
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 w-full max-w-md sm:max-w-none mx-auto"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button
                className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-4 w-full sm:w-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/tech")}
              >
                <span>Start Research Journey</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/nfts")}
              >
                Explore NFTs
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => scrollToSection("how-it-works")}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* 3D AI Brain Model Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full glass-morphism mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-2 h-2 bg-emerald-verified rounded-full animate-pulse mr-2" />
              <span className="text-sm font-medium text-emerald-verified">
                AI Neural Network Active
              </span>
            </motion.div>

            <h2 className="text-h2 text-white mb-6">
              DARA AI{" "}
              <span className="text-gradient-professional">Neural Engine</span>
            </h2>
            <p className="text-lead max-w-4xl mx-auto mb-4">
              Our advanced AI neural network processes and verifies research
              data with unprecedented accuracy. Built on cutting-edge machine
              learning algorithms, DARA's brain ensures every piece of research
              meets the highest standards of scientific rigor.
            </p>
            <p className="text-body text-slate-400 max-w-3xl mx-auto">
              From data validation to citation analysis, our AI provides
              comprehensive insights that empower researchers to make
              breakthrough discoveries.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - 3D Model */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* 3D Model Container */}
              <div className="relative aspect-square max-w-lg mx-auto card-professional overflow-hidden">
                {/* 3D Brain Model */}
                <iframe
                  src="https://my.spline.design/aibrain-hNVzjbkagK93x3tVcApbnLuG/"
                  frameBorder="0"
                  width="100%"
                  height="100%"
                  className="w-full h-full rounded-2xl"
                  title="DARA AI Neural Engine"
                  style={{ border: "none" }}
                />

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-bright-blue/10 to-purple-gradient/10 rounded-2xl blur-3xl -z-10 animate-glow-pulse" />

                {/* Fallback Loading */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-blue-900/50 rounded-2xl"
                  style={{ zIndex: -1 }}
                >
                  <motion.div
                    className="w-20 h-20 border-3 border-slate-600 border-t-bright-blue rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
              </div>

              {/* Floating Status Indicators */}
              <motion.div
                className="absolute -top-6 -right-6 glass-morphism rounded-xl p-3"
                whileHover={{ scale: 1.05 }}
                animate={{ y: [-5, 5, -5] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Brain className="w-8 h-8 text-bright-blue" />
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -left-6 glass-morphism rounded-xl p-3"
                whileHover={{ scale: 1.05 }}
                animate={{ y: [5, -5, 5] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <CheckCircle className="w-8 h-8 text-emerald-verified" />
              </motion.div>
            </motion.div>

            {/* Right Column - Stats and Features */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Real DARA Capabilities */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="card-professional text-center hover-lift"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-3xl font-bold text-bright-blue mb-2">
                    4
                  </div>
                  <div className="text-small">Technologies Integrated</div>
                  <div className="text-caption text-slate-500">
                    Storage • Compute • DA • Chain
                  </div>
                </motion.div>

                <motion.div
                  className="card-professional text-center hover-lift"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-3xl font-bold text-emerald-verified mb-2">
                    100%
                  </div>
                  <div className="text-small">Data Integrity</div>
                  <div className="text-caption text-slate-500">
                    Cryptographic verification
                  </div>
                </motion.div>
              </div>

              {/* Verification Status */}
              <motion.div
                className="card-professional"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-h4 text-white">Verification Status</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-verified rounded-full animate-pulse" />
                    <span className="text-emerald-verified font-semibold">
                      FULLY VERIFIED
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-body">Merkle Root Verification</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-verified" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body">TEE Attestation</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-verified" />
                    </motion.div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-body">Immutable Anchoring</span>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-verified" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* 0G Technology Stack */}
              <motion.div
                className="card-professional"
                whileHover={{ scale: 1.02 }}
              >
                <h4 className="text-h4 text-white mb-4">0G Technology Stack</h4>
                <div className="space-y-4">
                  {[
                    {
                      label: "0G Storage",
                      description: "Permanent Availability",
                      verified: true,
                    },
                    {
                      label: "0G Compute",
                      description: "Verifiable AI Processing",
                      verified: true,
                    },
                    {
                      label: "0G DA",
                      description: "Data Availability Guarantee",
                      verified: true,
                    },
                    {
                      label: "0G Chain",
                      description: "Immutable Anchoring",
                      verified: true,
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div>
                        <div className="text-small font-semibold text-white">
                          {item.label}
                        </div>
                        <div className="text-caption text-slate-400">
                          {item.description}
                        </div>
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.3,
                        }}
                        className="flex items-center space-x-2"
                      >
                        <CheckCircle className="w-5 h-5 text-emerald-verified" />
                        <span className="text-emerald-verified font-semibold text-sm">
                          VERIFIED
                        </span>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* DARA Neural Network Features */}
          <motion.div
            className="mt-20 text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <h3 className="text-h3 text-white mb-12">
              Built on{" "}
              <span className="text-gradient-professional">
                0G Blockchain Infrastructure
              </span>
            </h3>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: "🗄️",
                  title: "0G Storage",
                  description:
                    "Decentralized permanent storage with cryptographic proof of data integrity",
                },
                {
                  icon: "⚙️",
                  title: "0G Compute",
                  description:
                    "Verifiable AI computations using TEE (Trusted Execution Environment)",
                },
                {
                  icon: "📡",
                  title: "0G Data Availability",
                  description:
                    "Guaranteed data availability through decentralized consensus mechanisms",
                },
                {
                  icon: "🔗",
                  title: "0G Chain",
                  description:
                    "Immutable blockchain anchoring ensuring research data permanence",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="card-interactive text-center group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.7 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h4 className="text-h4 text-white mb-3">{feature.title}</h4>
                  <p className="text-body text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How DARA Works Section */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-h2 text-white mb-6">
              How DARA <span className="text-bright-blue">Works</span>
            </h2>
            <p className="text-lead max-w-3xl mx-auto">
              Four simple steps to transform your research into verified,
              ownable NFTs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                step: 1,
                icon: Upload,
                title: "Upload & Secure",
                description:
                  "Upload your research to 0G decentralized storage with cryptographic verification",
                color: "from-blue-500 to-cyan-500",
                iconBg: "bg-blue-500/20 border-blue-500/30",
              },
              {
                step: 2,
                icon: Brain,
                title: "Verify & Analyze",
                description:
                  "AI analysis with cryptographic verification ensures authenticity and quality",
                color: "from-purple-500 to-pink-500",
                iconBg: "bg-purple-500/20 border-purple-500/30",
              },
              {
                step: 3,
                icon: Share2,
                title: "Publish & Preserve",
                description:
                  "Publish to 0G Data Availability for permanent, censorship-resistant access",
                color: "from-emerald-500 to-teal-500",
                iconBg: "bg-emerald-500/20 border-emerald-500/30",
              },
              {
                step: 4,
                icon: Award,
                title: "Own & Mint",
                description:
                  "Mint Research NFTs to own your discoveries and enable decentralized citation",
                color: "from-amber-500 to-orange-500",
                iconBg: "bg-amber-500/20 border-amber-500/30",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="card-interactive group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-professional rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {item.step}
                </div>

                {/* Icon */}
                <div
                  className={`w-16 h-16 ${item.iconBg} rounded-2xl flex items-center justify-center mb-6 border-2 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-h4 text-white mb-4">{item.title}</h3>
                <p className="text-body text-slate-400">{item.description}</p>

                {/* Animated Progress Bar */}
                <motion.div
                  className={`mt-6 h-1 bg-gradient-to-r ${item.color} rounded-full`}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: index * 0.3 + 0.5 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What DARA Solves Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 to-blue-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-h2 text-white mb-6">
              Problems We <span className="text-emerald-verified">Solve</span>
            </h2>
            <p className="text-lead max-w-3xl mx-auto">
              Addressing the critical challenges in modern scientific research
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                problem: "Reproducibility Crisis",
                solution: "Blockchain Verification",
                icon: CheckCircle,
                description:
                  "Every research step is cryptographically verified and permanently recorded",
                gradient: "from-red-500 to-emerald-500",
              },
              {
                problem: "Data Loss & Censorship",
                solution: "Decentralized Storage",
                icon: Lock,
                description:
                  "Research data stored permanently on decentralized networks, immune to censorship",
                gradient: "from-orange-500 to-blue-500",
              },
              {
                problem: "No Ownership Rights",
                solution: "Research NFTs",
                icon: Award,
                description:
                  "Mint your discoveries as NFTs to establish permanent ownership and enable fair attribution",
                gradient: "from-purple-500 to-cyan-500",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative p-8 bg-slate-800/30 backdrop-blur-sm border border-slate-700/30 rounded-2xl hover:border-slate-600/50 transition-all duration-500 group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-slate-700/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-emerald-400" />
                </div>

                {/* Problem → Solution */}
                <div className="space-y-4 mb-6">
                  <div className="text-red-400 font-semibold">
                    ❌ {item.problem}
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    ✅ {item.solution}
                  </div>
                </div>

                <p className="text-gray-400 leading-relaxed">
                  {item.description}
                </p>

                {/* Gradient Line */}
                <div
                  className={`mt-6 h-1 bg-gradient-to-r ${item.gradient} rounded-full`}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-h2 text-white mb-6">
              Ready to Transform Your Research?
            </h2>
            <p className="text-lead mb-8">
              Join the future of scientific publishing with complete
              decentralized infrastructure
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="btn-primary text-lg px-10 py-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/tech")}
              >
                Start Your Research Journey
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
