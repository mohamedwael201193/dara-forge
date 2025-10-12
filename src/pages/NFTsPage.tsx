import { motion } from 'framer-motion'
import {
    Award,
    Brain,
    Check,
    Copy,
    Database,
    ExternalLink,
    FileText,
    Filter,
    Lock,
    Search,
    Sparkles,
    Star,
    TrendingUp
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const NFTsPage = () => {
  const navigate = useNavigate()
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedAddress, setCopiedAddress] = useState(false)

  const nftTypes = [
    {
      id: 'research-paper',
      title: 'Research Paper NFT',
      description: 'Academic publications with peer review history and citation tracking',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      rarity: 'Common',
      features: ['Peer Review History', 'Citation Tracking', 'Impact Metrics', 'Version Control']
    },
    {
      id: 'ai-model',
      title: 'AI Model NFT',
      description: 'Trained models with performance metrics and licensing terms',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      rarity: 'Rare',
      features: ['Model Weights', 'Training Data Hash', 'Performance Metrics', 'Usage License']
    },
    {
      id: 'dataset',
      title: 'Dataset NFT',
      description: 'Curated datasets with provenance and quality verification',
      icon: Database,
      color: 'from-emerald-500 to-teal-500',
      rarity: 'Epic',
      features: ['Data Provenance', 'Quality Metrics', 'Schema Definition', 'Usage Analytics']
    },
    {
      id: 'achievement',
      title: 'Achievement Badge',
      description: 'Research milestones and professional certifications',
      icon: Award,
      color: 'from-amber-500 to-orange-500',
      rarity: 'Legendary',
      features: ['Skill Verification', 'Institution Backing', 'Transferable Credits', 'Reputation Score']
    }
  ]

  const sampleNFTs = [
    {
      id: 1,
      title: 'Neural Network Architecture Study',
      type: 'research-paper',
      author: '0x1234...abcd',
      date: '2024-10-10',
      citations: 23,
      verified: true,
      rarity: 'Rare'
    },
    {
      id: 2,
      title: 'Climate Data Model v2.1',
      type: 'ai-model',
      author: '0x5678...efgh',
      date: '2024-10-08',
      citations: 45,
      verified: true,
      rarity: 'Epic'
    },
    {
      id: 3,
      title: 'Genomic Sequencing Dataset',
      type: 'dataset',
      author: '0x9abc...def0',
      date: '2024-10-05',
      citations: 12,
      verified: true,
      rarity: 'Common'
    }
  ]

  const handleCopyContract = async () => {
    await navigator.clipboard.writeText('0x742d35Cc6634C0532925a3b8D404fBaBdcF03227')
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 pt-20">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400 mr-2" />
              <span className="text-sm font-medium text-amber-400">Research NFT Platform</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              Research <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">NFTs</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              Transform your scientific discoveries into verifiable, ownable NFTs. 
              Establish permanent authorship and enable decentralized citation networks.
            </p>

            {/* Smart Contract Info */}
            <div className="inline-flex items-center space-x-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 px-6 py-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">Smart Contract:</span>
              </div>
              <code className="text-sm font-mono text-blue-400">0x742d...3227</code>
              <motion.button
                className="p-1 hover:bg-white/10 rounded transition-colors"
                onClick={handleCopyContract}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {copiedAddress ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* NFT Types */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              NFT Types & Rarities
            </h2>
            <p className="text-gray-400">
              Different types of research can be minted as NFTs with varying rarity levels
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nftTypes.map((type, index) => (
              <motion.div
                key={type.id}
                className="relative p-6 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:border-slate-600/50 transition-all duration-300 group cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Rarity Badge */}
                <div className="absolute -top-3 -right-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${type.color} text-white`}>
                    {type.rarity}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${type.color} bg-opacity-20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <type.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">{type.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{type.description}</p>

                {/* Features */}
                <div className="space-y-2">
                  {type.features.slice(0, 2).map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-gray-300">{feature}</span>
                    </div>
                  ))}
                  <div className="text-xs text-blue-400">
                    +{type.features.length - 2} more features
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Minting Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left Column */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Mint Your Research NFT
                  </h2>
                  
                  <p className="text-gray-400 mb-6">
                    After successfully completing the 0G verification process (Storage → Compute → DA → Chain), 
                    you can mint your research as an NFT to establish permanent ownership.
                  </p>

                  <div className="space-y-4 mb-8">
                    {[
                      { icon: Lock, text: 'Complete 0G Verification First', status: 'required' },
                      { icon: Brain, text: 'AI Analysis & Quality Check', status: 'required' },
                      { icon: Award, text: 'Mint Research NFT', status: 'available' },
                      { icon: TrendingUp, text: 'Track Citations & Impact', status: 'future' }
                    ].map((step, index) => (
                      <motion.div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          step.status === 'required' ? 'bg-amber-500/10 border border-amber-500/20' :
                          step.status === 'available' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                          'bg-slate-700/30 border border-slate-600/30'
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <div className={`p-2 rounded-lg ${
                          step.status === 'required' ? 'bg-amber-500/20' :
                          step.status === 'available' ? 'bg-emerald-500/20' :
                          'bg-slate-600/30'
                        }`}>
                          <step.icon className={`w-4 h-4 ${
                            step.status === 'required' ? 'text-amber-400' :
                            step.status === 'available' ? 'text-emerald-400' :
                            'text-gray-400'
                          }`} />
                        </div>
                        <span className="text-sm text-gray-300">{step.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 opacity-50 cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      disabled
                    >
                      Mint NFT (Complete 0G Process First)
                    </motion.button>
                    
                    <motion.button
                      className="px-6 py-3 border-2 border-purple-400/50 text-purple-400 font-semibold rounded-xl hover:bg-purple-400/10 transition-all duration-300"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => navigate('/tech')}
                    >
                      Start 0G Process
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* Right Column - NFT Preview */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <span className="font-semibold text-white">Research NFT Preview</span>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 mb-4">
                    <div className="h-32 bg-slate-700/30 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gradient-to-r from-purple-400/40 to-transparent rounded" />
                      <div className="h-3 bg-gradient-to-r from-pink-400/40 to-transparent rounded w-3/4" />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Token ID: #2024001</span>
                    <div className="flex items-center space-x-1">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60"
                  animate={{
                    y: [-5, 5, -5],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Research NFT <span className="text-emerald-400">Marketplace</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover, cite, and trade verified research NFTs from researchers worldwide
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search research NFTs..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-400/50 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select 
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:border-blue-400/50 focus:outline-none"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="research-paper">Research Papers</option>
                <option value="ai-model">AI Models</option>
                <option value="dataset">Datasets</option>
                <option value="achievement">Achievements</option>
              </select>
            </div>
          </div>

          {/* Sample NFTs Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sampleNFTs.map((nft, index) => (
              <motion.div
                key={nft.id}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-300 group cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* NFT Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-slate-700/50 to-slate-600/30 rounded-xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  {(() => {
                    const type = nftTypes.find(t => t.id === nft.type)
                    return type ? <type.icon className="w-12 h-12 text-gray-400" /> : null
                  })()}
                </div>

                {/* NFT Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      nft.rarity === 'Legendary' ? 'bg-amber-500/20 text-amber-400' :
                      nft.rarity === 'Epic' ? 'bg-purple-500/20 text-purple-400' :
                      nft.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {nft.rarity}
                    </span>
                    {nft.verified && (
                      <div className="flex items-center space-x-1">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-400">Verified</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{nft.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{nft.author}</span>
                    <span>{nft.citations} citations</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{nft.date}</span>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <motion.div
            className="text-center bg-slate-800/20 backdrop-blur-sm border border-slate-700/30 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Sparkles className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Full Marketplace Coming Soon</h3>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              The complete Research NFT marketplace with trading, licensing, and citation tracking 
              will be available in future updates. Start minting your research now to be ready!
            </p>
            
            <motion.button
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/tech')}
            >
              Start Your Research Journey
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default NFTsPage