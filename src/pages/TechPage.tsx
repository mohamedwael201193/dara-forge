import { DemoApp } from '@/components/DemoApp'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, Cpu, Database, Shield, Zap } from 'lucide-react'
import { useState } from 'react'

const TechPage = () => {
  const [activeTab, setActiveTab] = useState('storage')

  const tabs = [
    {
      id: 'storage',
      label: '0G Storage',
      icon: Database,
      color: 'text-blue-400',
      description: 'Decentralized file storage with cryptographic verification'
    },
    {
      id: 'compute',
      label: '0G Compute',
      icon: Cpu,
      color: 'text-emerald-400',
      description: 'AI processing and analysis with verifiable results'
    },
    {
      id: 'da',
      label: 'Data Availability',
      icon: Shield,
      color: 'text-amber-400',
      description: 'Permanent data availability and integrity proofs'
    },
    {
      id: 'chain',
      label: '0G Chain',
      icon: Zap,
      color: 'text-purple-400',
      description: 'Blockchain anchoring and transaction management'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 pt-20">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-h1 text-white mb-6">
              0G Technology <span className="text-gradient-professional">Stack</span>
            </h1>
            <p className="text-lead max-w-3xl mx-auto mb-8">
              Complete decentralized infrastructure for research verification, storage, and ownership. 
              Every component is live and functional on the 0G Galileo testnet.
            </p>

            {/* Status Indicators */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { label: 'Storage', status: 'operational' },
                { label: 'Compute', status: 'operational' },
                { label: 'DA Layer', status: 'operational' },
                { label: 'Chain', status: 'operational' }
              ].map((service) => (
                <div key={service.label} className="flex items-center space-x-2 card-professional px-4 py-2 hover-glow">
                  <CheckCircle className="w-4 h-4 text-emerald-verified" />
                  <span className="text-small text-slate-300">{service.label}</span>
                  <div className="w-2 h-2 bg-emerald-verified rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-4 sm:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-slate-800 border-2 border-blue-400/50 shadow-lg shadow-blue-400/20'
                    : 'bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600'
                }`}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`p-2 rounded-lg bg-slate-700/50 ${activeTab === tab.id ? 'bg-slate-600' : ''}`}>
                  <tab.icon className={`w-5 h-5 ${tab.color}`} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-white">{tab.label}</div>
                  <div className="text-sm text-gray-400 hidden sm:block">{tab.description}</div>
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content - All 0G Functionality */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
            >
              {/* Technology Overview */}
              <div className="mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  {(() => {
                    const currentTab = tabs.find(tab => tab.id === activeTab)
                    return currentTab ? (
                      <>
                        <div className="p-3 bg-slate-700/50 rounded-xl">
                          <currentTab.icon className={`w-8 h-8 ${currentTab.color}`} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{currentTab.label}</h2>
                          <p className="text-gray-400">{currentTab.description}</p>
                        </div>
                      </>
                    ) : null
                  })()}
                </div>
              </div>

              {/* Full DemoApp Integration */}
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Interactive Platform
                  </h3>
                  <p className="text-gray-400">
                    All 0G services are fully operational. Upload files, run AI analysis, publish to DA layer, 
                    and anchor on blockchain. Every operation is live on the 0G Galileo testnet.
                  </p>
                </div>

                {/* This preserves ALL existing functionality */}
                <DemoApp />
              </div>

              {/* Technology Details */}
              <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'storage' && [
                  {
                    title: 'Decentralized Storage',
                    description: 'Files stored across distributed nodes with cryptographic verification',
                    features: ['Merkle Root Verification', 'Redundant Storage', 'Cryptographic Proofs']
                  },
                  {
                    title: 'File Integrity',
                    description: 'Every uploaded file gets a unique hash for tamper detection',
                    features: ['SHA-256 Hashing', 'Integrity Checks', 'Version Control']
                  },
                  {
                    title: 'Global Access',
                    description: 'Access your files from anywhere with permanent availability',
                    features: ['CDN Distribution', 'Fast Retrieval', 'Global Nodes']
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                    <ul className="space-y-1">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}

                {activeTab === 'compute' && [
                  {
                    title: 'AI Processing',
                    description: 'Run AI models on decentralized compute infrastructure',
                    features: ['Multiple Providers', 'Verifiable Results', 'Cost Optimization']
                  },
                  {
                    title: 'Research Analysis',
                    description: 'Specialized AI models for scientific data analysis',
                    features: ['Data Summarization', 'Pattern Recognition', 'Insight Generation']
                  },
                  {
                    title: 'Compute Verification',
                    description: 'Cryptographic proofs ensure computation integrity',
                    features: ['Result Verification', 'Audit Trails', 'Quality Assurance']
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                    <ul className="space-y-1">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}

                {activeTab === 'da' && [
                  {
                    title: 'Data Availability',
                    description: 'Ensure permanent access to published research data',
                    features: ['Blob Storage', 'Availability Proofs', 'Redundancy']
                  },
                  {
                    title: 'Integrity Verification',
                    description: 'Cryptographic proofs ensure data hasn\'t been tampered with',
                    features: ['Hash Verification', 'Merkle Proofs', 'Audit Trails']
                  },
                  {
                    title: 'Censorship Resistance',
                    description: 'No single point of failure or control over your data',
                    features: ['Distributed Storage', 'Permissionless Access', 'Global Network']
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                    <ul className="space-y-1">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}

                {activeTab === 'chain' && [
                  {
                    title: 'Blockchain Anchoring',
                    description: 'Anchor research metadata on 0G Chain for immutable records',
                    features: ['Transaction Finality', 'Immutable Records', 'Global Consensus']
                  },
                  {
                    title: 'Smart Contracts',
                    description: 'Automated verification and ownership management',
                    features: ['Ownership Tracking', 'Automated Verification', 'Royalty Distribution']
                  },
                  {
                    title: 'Network Security',
                    description: 'Secured by validator network with economic incentives',
                    features: ['Validator Network', 'Economic Security', 'Slashing Conditions']
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/30"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                    <ul className="space-y-1">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}

export default TechPage