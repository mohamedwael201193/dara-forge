import { AnimatePresence, motion } from 'framer-motion'
import { Brain, Cpu, Database, ExternalLink, Menu, Settings, Shield, X, Zap } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import ConnectWalletButton from './ConnectWalletButton'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
}

export default function GlassNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      label: "Storage",
      href: "#storage",
      icon: Database,
      description: "Decentralized file storage on 0G",
      color: "text-electric-blue"
    },
    {
      label: "Compute", 
      href: "#compute",
      icon: Cpu,
      description: "AI processing and analysis",
      color: "text-verified-green"
    },
    {
      label: "DA Layer",
      href: "#da",
      icon: Shield,
      description: "Data availability proofs",
      color: "text-gold-accent"
    },
    {
      label: "Chain",
      href: "#chain",
      icon: Zap,
      description: "Blockchain transactions",
      color: "text-purple-400"
    },
    {
      label: "NFTs",
      href: "#nfts",
      icon: Brain,
      description: "Research NFT marketplace",
      color: "text-cyan-400"
    }
  ]

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.mobile-menu') && !target.closest('.menu-toggle')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'glass-nav shadow-2xl' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToSection('#hero')}
            >
              <div className="relative">
                <Brain className="w-8 h-8 lg:w-10 lg:h-10 text-electric-blue" />
                <div className="absolute inset-0 bg-electric-blue/20 rounded-full blur-md animate-pulse" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-xl lg:text-2xl font-bold text-gradient">
                  DARA Forge
                </h1>
                <p className="text-xs text-muted-foreground">Research NFTs</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  className="group relative px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/5"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection(item.href)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className={`w-4 h-4 ${item.color} transition-colors`} />
                    <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {item.description}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45" />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Right Side - Wallet & Settings */}
            <div className="flex items-center space-x-3">
              {/* Connect Wallet */}
              <div className="hidden sm:block">
                <ConnectWalletButton />
              </div>

              {/* Settings (Desktop) */}
              <motion.button
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg glass-morphism hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05, rotateZ: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                className="lg:hidden menu-toggle flex items-center justify-center w-10 h-10 rounded-lg glass-morphism"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5 text-foreground" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5 text-foreground" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              className="mobile-menu fixed top-16 right-4 w-80 max-w-[calc(100vw-2rem)] glass-card rounded-2xl shadow-2xl z-50 lg:hidden overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="w-6 h-6 text-electric-blue" />
                  <span className="font-display text-lg font-bold text-gradient">DARA Forge</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete 0G blockchain integration for research NFTs
                </p>
              </div>

              {/* Navigation Items */}
              <div className="p-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                    onClick={() => scrollToSection(item.href)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className={`p-2 rounded-lg bg-white/5 ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-foreground group-hover:text-white transition-colors">
                        {item.label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 space-y-3">
                <div className="sm:hidden">
                  <ConnectWalletButton />
                </div>
                
                <motion.button
                  className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl glass-morphism hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Settings</span>
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}