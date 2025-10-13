import { DemoApp } from '@/components/DemoApp'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  Cpu,
  Database,
  ExternalLink,
  FileText,
  Shield,
  Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TechPage = () => {
  const navigate = useNavigate()

  const handleEndToEndDemo = () => {
    navigate('/pipeline?demo=sample-dataset')
  }

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
              0G Technology <span className="text-gradient-professional">Stack</span>
            </h1>
            <p className="text-lead max-w-3xl mx-auto mb-8">
              Complete decentralized infrastructure for research verification, storage, and ownership. 
              Every component is live and functional on the 0G Galileo testnet.
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
                { label: 'Storage', status: 'operational' },
                { label: 'Compute', status: 'operational' },
                { label: 'DA Layer', status: 'operational' },
                { label: 'Chain', status: 'operational' }
              ].map((service) => (
                <div key={service.label} className="flex items-center space-x-2 card-professional px-3 py-2">
                  <CheckCircle className="w-4 h-4 text-emerald-verified" />
                  <span className="text-sm text-slate-300">{service.label}</span>
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
            <h2 className="text-2xl font-bold text-white mb-4">Research Pipeline Flow</h2>
          </motion.div>

          {/* Simplified Flow */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            {[
              { icon: Database, label: 'Storage', color: 'text-blue-400', desc: 'Upload data' },
              { icon: ArrowRight, label: '', color: 'text-slate-500' },
              { icon: Shield, label: 'DA', color: 'text-amber-400', desc: 'Publish availability' },
              { icon: ArrowRight, label: '', color: 'text-slate-500' },
              { icon: Zap, label: 'Chain', color: 'text-purple-400', desc: 'Anchor on blockchain' },
              { icon: ArrowRight, label: '', color: 'text-slate-500' },
              { icon: Cpu, label: 'Compute', color: 'text-emerald-400', desc: 'Process & verify' },
              { icon: ArrowRight, label: '', color: 'text-slate-500' },
              { icon: FileText, label: 'Passport', color: 'text-cyan-400', desc: 'Download proof' }
            ].map((step, index) => {
              const Icon = step.icon
              return step.label ? (
                <motion.div
                  key={index}
                  className="flex flex-col items-center max-w-[100px]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <div className={`p-3 rounded-xl bg-slate-800 border border-slate-700 mb-2`}>
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{step.label}</span>
                  <span className="text-xs text-slate-500 text-center">{step.desc}</span>
                </motion.div>
              ) : (
                <Icon key={index} className={`w-5 h-5 ${step.color}`} />
              )
            })}
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
            <h2 className="text-3xl font-bold text-white mb-4">DARA Research Platform</h2>
            <p className="text-lg text-slate-400">Complete 0G integration - All components live and operational</p>
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
                Full-featured interface with Storage, Compute, DA Layer, and Chain - Every operation connects to 0G Galileo testnet
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
  )
}

export default TechPage