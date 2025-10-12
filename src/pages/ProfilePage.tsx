import ConnectWalletButton from '@/components/ConnectWalletButton'
import { useDataStore } from '@/store/dataStore'
import { useAppKitAccount } from '@reown/appkit/react'
import { motion } from 'framer-motion'
import {
    Activity,
    Award,
    Brain,
    Check,
    Clock,
    Copy,
    Download,
    ExternalLink,
    Shield,
    Upload,
    User,
    Wallet
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ProfilePage = () => {
  const navigate = useNavigate()
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const { address, isConnected } = useAppKitAccount()
  const { uploadedDatasets, daPublications, computeResults } = useDataStore()

  // Combine all activities with timestamps
  const allActivities = [
    ...uploadedDatasets.map((item, index) => ({
      type: 'storage',
      id: item.datasetId || `storage-${index}`,
      title: item.fileName,
      timestamp: item.uploadTime || new Date().toISOString(),
      hash: item.rootHash,
      status: 'completed',
      icon: Upload
    })),
    ...computeResults.map((item, index) => ({
      type: 'compute',
      id: item.chatID || `compute-${index}`,
      title: `AI Analysis: ${item.provider}`,
      timestamp: item.timestamp || new Date().toISOString(),
      hash: item.answer?.substring(0, 32) + '...' || 'N/A',
      status: 'completed',
      icon: Brain
    })),
    ...daPublications.map((item, index) => ({
      type: 'da',
      id: item.blobHash || `da-${index}`,
      title: 'Data Availability Publication',
      timestamp: item.timestamp || new Date().toISOString(),
      hash: item.blobHash || 'N/A',
      status: 'completed',
      icon: Shield
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const filteredActivities = filterType === 'all' 
    ? allActivities 
    : allActivities.filter(activity => activity.type === filterType)

  const achievements = [
    {
      id: 1,
      title: 'First Upload',
      description: 'Successfully uploaded your first dataset to 0G Storage',
      icon: Upload,
      unlocked: uploadedDatasets.length > 0,
      progress: Math.min(uploadedDatasets.length, 1),
      maxProgress: 1,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'AI Researcher',
      description: 'Completed 3 AI analyses using 0G Compute',
      icon: Brain,
      unlocked: computeResults.length >= 3,
      progress: Math.min(computeResults.length, 3),
      maxProgress: 3,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 3,
      title: 'Data Publisher',
      description: 'Published 5 datasets to 0G Data Availability',
      icon: Shield,
      unlocked: daPublications.length >= 5,
      progress: Math.min(daPublications.length, 5),
      maxProgress: 5,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      id: 4,
      title: 'Power User',
      description: 'Complete 10 total operations across all 0G services',
      icon: Award,
      unlocked: allActivities.length >= 10,
      progress: Math.min(allActivities.length, 10),
      maxProgress: 10,
      color: 'from-amber-500 to-orange-500'
    }
  ]

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const exportActivities = () => {
    const data = {
      address,
      exportDate: new Date().toISOString(),
      activities: allActivities,
      summary: {
        totalActivities: allActivities.length,
        storageUploads: uploadedDatasets.length,
        computeAnalyses: computeResults.length,
        daPublications: daPublications.length
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dara-forge-activity-${address?.substring(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 pt-20 flex items-center justify-center">
        <motion.div
          className="text-center max-w-md mx-auto px-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">
            Connect your wallet to view your profile, activity history, and achievements
          </p>
          <ConnectWalletButton />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 pt-20">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white mb-1">Research Profile</h1>
                  <div className="flex items-center space-x-3">
                    <code className="text-xs font-mono text-blue-400 bg-slate-700/50 px-2 py-1 rounded">
                      {address?.substring(0, 6)}...{address?.substring(-4)}
                    </code>
                    <motion.button
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      onClick={handleCopyAddress}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copiedAddress ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </motion.button>
                    <a
                      href={`https://explorer.galileo.web3q.io/address/${address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Activities', value: allActivities.length, icon: Activity },
                  { label: 'Files Uploaded', value: uploadedDatasets.length, icon: Upload },
                  { label: 'AI Analyses', value: computeResults.length, icon: Brain },
                  { label: 'Publications', value: daPublications.length, icon: Shield }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="text-center bg-slate-700/30 rounded-xl p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <stat.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity History */}
            <motion.div
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Activity History</h2>
                  <p className="text-gray-400 text-xs">Your complete research journey on DARA Forge</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <select 
                    className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-400/50 focus:outline-none"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Activities</option>
                    <option value="storage">Storage</option>
                    <option value="compute">Compute</option>
                    <option value="da">DA Layer</option>
                  </select>
                  
                  <motion.button
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors"
                    onClick={exportActivities}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </motion.button>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((activity, index) => (
                    <motion.div
                      key={`${activity.type}-${activity.id}`}
                      className="flex items-start space-x-4 p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'storage' ? 'bg-blue-500/20 text-blue-400' :
                        activity.type === 'compute' ? 'bg-purple-500/20 text-purple-400' :
                        activity.type === 'da' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-white font-medium truncate">{activity.title}</h3>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="font-mono text-xs truncate">{activity.hash}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            activity.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No activities found for the selected filter</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Achievements */}
            <motion.div
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">Achievements</h2>
              </div>

              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      achievement.unlocked 
                        ? 'bg-slate-800/50 border-blue-500/30 relative overflow-hidden' 
                        : 'bg-slate-700/20 border-slate-600/30'
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: achievement.unlocked ? 1.02 : 1 }}
                  >
                    {/* Gradient Overlay for Unlocked Achievements */}
                    {achievement.unlocked && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${achievement.color} opacity-5 rounded-xl`} />
                    )}
                    
                    <div className="relative flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${
                        achievement.unlocked 
                          ? `bg-gradient-to-r ${achievement.color} bg-opacity-20` 
                          : 'bg-slate-600/30'
                      }`}>
                        <achievement.icon className={`w-4 h-4 ${
                          achievement.unlocked ? 'text-white' : 'text-gray-400'
                        }`} />
                      </div>
                      {achievement.unlocked && (
                        <Check className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>
                    
                    <div className="relative">
                      <h3 className={`font-semibold mb-1 text-sm ${
                        achievement.unlocked ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.title}
                      </h3>
                      
                      <p className="text-xs text-slate-300 mb-3 leading-tight">{achievement.description}</p>
                      
                      <div className="w-full bg-slate-600/30 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full bg-gradient-to-r ${achievement.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                      </div>
                      
                      <div className="text-xs text-slate-400 mt-2 font-medium">
                        {achievement.progress}/{achievement.maxProgress}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <h2 className="text-base font-bold text-white mb-4">Quick Actions</h2>
              
              <div className="space-y-3">
                {[
                  { label: 'Upload New Dataset', href: '/tech', icon: Upload, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Run AI Analysis', href: '/tech', icon: Brain, color: 'from-purple-500 to-pink-500' },
                  { label: 'Mint Research NFT', href: '/nfts', icon: Award, color: 'from-amber-500 to-orange-500' }
                ].map((action, index) => (
                  <motion.button
                    key={action.label}
                    className={`w-full flex items-center space-x-3 p-3 bg-gradient-to-r ${action.color} bg-opacity-10 border border-opacity-20 rounded-xl hover:bg-opacity-20 transition-all duration-300`}
                    onClick={() => navigate(action.href)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <action.icon className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage