import { AnimatePresence, motion } from 'framer-motion'
import {
    ArrowRight,
    Brain,
    Check,
    Copy,
    ExternalLink,
    FileText,
    Lock,
    Sparkles,
    Star,
    Trophy,
    Unlock,
    Zap
} from 'lucide-react'
import React, { useState } from 'react'

interface NFTTemplate {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  color: string
  bgGradient: string
  features: string[]
}

export default function ResearchNFTSection() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const nftTemplates: NFTTemplate[] = [
    {
      id: 'research-paper',
      title: 'Research Paper NFT',
      description: 'Transform your academic research into verifiable NFTs',
      icon: FileText,
      rarity: 'Common',
      color: 'text-electric-blue',
      bgGradient: 'from-electric-blue/10 to-cyan-400/10',
      features: ['Academic Verification', 'Citation Tracking', 'Peer Review History', 'Impact Metrics']
    },
    {
      id: 'ai-model',
      title: 'AI Model NFT',
      description: 'Mint trained AI models with provenance and licensing',
      icon: Brain,
      rarity: 'Rare',
      color: 'text-verified-green',
      bgGradient: 'from-verified-green/10 to-emerald-400/10',
      features: ['Model Weights', 'Training Data Hash', 'Performance Metrics', 'Usage License']
    },
    {
      id: 'dataset',
      title: 'Dataset NFT',
      description: 'Tokenize research datasets with attribution tracking',
      icon: Zap,
      rarity: 'Epic',
      color: 'text-gold-accent',
      bgGradient: 'from-gold-accent/10 to-yellow-400/10',
      features: ['Data Provenance', 'Quality Metrics', 'Usage Analytics', 'Derivative Tracking']
    },
    {
      id: 'achievement',
      title: 'Achievement Badge',
      description: 'Milestone accomplishments and certifications',
      icon: Trophy,
      rarity: 'Legendary',
      color: 'text-purple-400',
      bgGradient: 'from-purple-400/10 to-pink-400/10',
      features: ['Skill Verification', 'Institution Backing', 'Transferable Credits', 'Career Tracking']
    }
  ]

  const rarityStyles = {
    Common: 'border-electric-blue/30 bg-electric-blue/5',
    Rare: 'border-verified-green/30 bg-verified-green/5',
    Epic: 'border-gold-accent/30 bg-gold-accent/5',
    Legendary: 'border-purple-400/30 bg-purple-400/5'
  }

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText('0x1234...abcd')
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  return (
    <section id="nfts" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-space-blue via-slate-900 to-space-blue" />
      <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
      
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
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
            <Sparkles className="w-4 h-4 text-gold-accent mr-2" />
            <span className="text-sm font-medium text-gold-accent">Wave 4 Preview</span>
          </motion.div>

          <h2 className="font-display text-4xl md:text-6xl font-black mb-6">
            <span className="text-gradient">Research NFTs</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Transform your research into valuable, verifiable NFTs on the 0G blockchain. 
            From academic papers to AI models, preserve your intellectual property forever.
          </p>

          {/* Smart Contract Info */}
          <motion.div
            className="inline-flex items-center space-x-4 glass-card px-6 py-3 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-verified-green rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">Smart Contract:</span>
            </div>
            <code className="text-sm font-mono text-electric-blue">0x1234...abcd</code>
            <motion.button
              className="p-1 hover:bg-white/10 rounded"
              onClick={handleCopyAddress}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {copiedAddress ? (
                <Check className="w-4 h-4 text-verified-green" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* NFT Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {nftTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 card-3d ${rarityStyles[template.rarity]} ${
                selectedTemplate === template.id ? 'ring-2 ring-white/20' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5 }}
              onClick={() => setSelectedTemplate(template.id)}
            >
              {/* Rarity Badge */}
              <div className="absolute -top-3 -right-3">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${template.color} bg-black/80 border border-current/20`}>
                  {template.rarity}
                </div>
              </div>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${template.bgGradient} mb-4`}>
                <template.icon className={`w-6 h-6 ${template.color}`} />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {template.title}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                {template.description}
              </p>

              {/* Features */}
              <div className="space-y-2">
                {template.features.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Star className="w-3 h-3 text-gold-accent" />
                    <span className="text-xs text-muted-foreground">{feature}</span>
                  </div>
                ))}
                {template.features.length > 2 && (
                  <div className="text-xs text-electric-blue">
                    +{template.features.length - 2} more features
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              <AnimatePresence>
                {selectedTemplate === template.id && (
                  <motion.div
                    className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Minting Interface Preview */}
        <motion.div
          className="glass-card rounded-2xl p-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Column */}
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Ready to Mint Your Research?
              </h3>
              
              <p className="text-muted-foreground mb-6">
                Join the future of research publication. Create tamper-proof, verifiable 
                records of your work that can be cited, traded, and preserved forever.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Lock, text: 'Immutable Publication Record' },
                  { icon: Unlock, text: 'Decentralized Ownership' },
                  { icon: Zap, text: 'Instant Global Access' },
                  { icon: Trophy, text: 'Verified Authorship' }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  >
                    <div className="p-2 rounded-lg bg-electric-blue/10">
                      <item.icon className="w-4 h-4 text-electric-blue" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  className="btn-3d px-6 py-3 bg-gradient-to-r from-electric-blue to-cyan-gradient text-space-blue font-bold rounded-xl flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled
                >
                  <span>Start Minting</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                
                <motion.button
                  className="btn-3d px-6 py-3 glass-morphism text-foreground font-semibold rounded-xl border border-electric-blue/30 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Learn More</span>
                  <ExternalLink className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="relative">
              <motion.div
                className="glass-card p-6 rounded-xl transform-3d"
                whileHover={{ rotateY: 10, rotateX: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-6 h-6 text-electric-blue" />
                  <span className="font-semibold text-foreground">Sample Research NFT</span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="h-3 bg-gradient-to-r from-electric-blue/20 to-transparent rounded" />
                  <div className="h-3 bg-gradient-to-r from-verified-green/20 to-transparent rounded w-3/4" />
                  <div className="h-3 bg-gradient-to-r from-gold-accent/20 to-transparent rounded w-1/2" />
                </div>
                
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Token ID: #2024001</span>
                  <span>Verified ✓</span>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-electric-blue to-cyan-gradient rounded-full opacity-60"
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
              
              <motion.div
                className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-verified-green to-gold-accent rounded-full opacity-60"
                animate={{
                  y: [5, -5, 5],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Coming Soon Notice */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <p className="text-muted-foreground">
            Research NFT minting will be available in Wave 4. 
            <span className="text-electric-blue font-semibold"> Stay tuned for updates!</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}