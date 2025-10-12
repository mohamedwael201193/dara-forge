import { motion } from 'framer-motion'
import { Cpu, Database, Shield, Sparkles, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  color: string
}

export default function Hero3D() {
  const [particles, setParticles] = useState<Particle[]>([])

  // Generate floating particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles: Particle[] = []
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          speed: Math.random() * 2 + 0.5,
          color: `hsl(${195 + Math.random() * 75}, 100%, ${50 + Math.random() * 30}%)`
        })
      }
      setParticles(newParticles)
    }

    generateParticles()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const
      }
    }
  }

  const brainVariants = {
    animate: {
      rotateY: 360,
      transition: {
        duration: 20,
        ease: "linear" as const,
        repeat: Infinity
      }
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-space-blue via-slate-900 to-space-blue">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-grid-white/5 animate-pulse opacity-20" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full opacity-60"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              filter: `blur(${particle.size * 0.3}px)`
            }}
            animate={{
              y: [-20, -100] as [number, number],
              x: [0, Math.random() * 100 - 50] as [number, number],
              opacity: [0, 1, 0] as [number, number, number]
            }}
            transition={{
              duration: particle.speed * 4,
              repeat: Infinity,
              ease: "linear" as const
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div className="text-center lg:text-left space-y-8" variants={itemVariants}>
            {/* Achievement Badge */}
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full glass-morphism achievement-badge cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-4 h-4 text-gold-accent mr-2" />
              <span className="text-sm font-medium text-gold-accent">Wave 3 Complete</span>
              <div className="w-2 h-2 bg-verified-green rounded-full ml-2 animate-pulse" />
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={itemVariants} className="space-y-4">
              <h1 className="font-display text-5xl md:text-7xl font-black leading-tight">
                <span className="text-gradient bg-gradient-to-r from-electric-blue via-purple-gradient to-cyan-gradient bg-clip-text text-transparent">
                  DARA Forge
                </span>
              </h1>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground">
                Research NFT Platform
              </h2>
              <p className="font-body text-xl text-muted-foreground max-w-2xl">
                Mint your research as NFTs on the 0G blockchain. Complete decentralized infrastructure with 
                <span className="text-electric-blue font-semibold"> Storage</span>, 
                <span className="text-verified-green font-semibold"> Compute</span>, 
                <span className="text-gold-accent font-semibold"> DA</span>, and 
                <span className="text-purple-gradient font-semibold"> Chain</span> integration.
              </p>
            </motion.div>

            {/* Feature Icons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center lg:justify-start gap-4"
            >
              {[
                { icon: Database, label: "Storage", color: "text-electric-blue" },
                { icon: Cpu, label: "Compute", color: "text-verified-green" },
                { icon: Shield, label: "DA Layer", color: "text-gold-accent" },
                { icon: Zap, label: "Chain", color: "text-purple-400" }
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  className="flex items-center space-x-2 glass-card px-4 py-2 rounded-lg card-3d cursor-pointer"
                  whileHover={{ scale: 1.05, rotateX: 5 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  <span className="text-sm font-medium">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.button
                className="btn-3d px-8 py-4 bg-gradient-to-r from-electric-blue to-cyan-gradient text-space-blue font-bold rounded-xl transform-3d"
                whileHover={{ scale: 1.05, rotateX: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Minting NFTs
              </motion.button>
              
              <motion.button
                className="btn-3d px-8 py-4 glass-morphism text-foreground font-semibold rounded-xl border border-electric-blue/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Platform
              </motion.button>
            </motion.div>

            {/* Stats Counter */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              {[
                { value: "100%", label: "0G Integration" },
                { value: "4/4", label: "Services Active" },
                { value: "Wave 3", label: "Completed" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.2 }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-electric-blue">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - 3D Brain Model */}
          <motion.div
            className="flex justify-center lg:justify-end"
            variants={itemVariants}
          >
            <motion.div
              className="relative w-full max-w-lg aspect-square"
              variants={brainVariants}
              animate="animate"
            >
              {/* 3D Brain Container */}
              <div className="relative w-full h-full transform-3d brain-container">
                {/* Brain Model Iframe */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden glass-card brain-glow">
                  <iframe
                    src="https://my.spline.design/3dbrainmodelcopy-a096b2de802c30a1d11b6cb58f79e6d8/"
                    className="w-full h-full border-0"
                    title="3D Brain Model"
                  />
                </div>

                {/* Floating Orbs Around Brain */}
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-electric-blue to-cyan-gradient rounded-full blur-sm opacity-80"
                  animate={{
                    y: [-10, 10, -10] as [number, number, number],
                    rotate: [0, 360] as [number, number]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut" as const
                  }}
                />
                
                <motion.div
                  className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-verified-green to-gold-accent rounded-full blur-sm opacity-80"
                  animate={{
                    y: [10, -10, 10] as [number, number, number],
                    rotate: [360, 0] as [number, number]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut" as const
                  }}
                />
                
                <motion.div
                  className="absolute top-1/2 -left-8 w-4 h-4 bg-gradient-to-r from-purple-gradient to-electric-blue rounded-full blur-sm opacity-80"
                  animate={{
                    x: [-5, 5, -5] as [number, number, number],
                    scale: [1, 1.2, 1] as [number, number, number]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut" as const
                  }}
                />
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/20 to-purple-gradient/20 rounded-2xl blur-3xl -z-10 animate-glow-pulse" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}