import { motion } from 'framer-motion'
import React from 'react'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', children }) => {
  return (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className}`}>
      {children}
    </div>
  )
}

// Card Skeleton
export const CardSkeleton: React.FC = () => (
  <div className="card-professional animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <Skeleton className="h-20 w-full mb-4" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  </div>
)

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4 border border-slate-700 rounded-lg animate-pulse">
    <Skeleton className="w-10 h-10 rounded-full" />
    <div className="space-y-2 flex-1">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
    <Skeleton className="w-20 h-8 rounded" />
  </div>
)

// Text Skeleton
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
      />
    ))}
  </div>
)

// Button Skeleton
export const ButtonSkeleton: React.FC = () => (
  <Skeleton className="h-11 w-32 rounded-xl" />
)

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-deep-navy p-4">
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
      </div>
      
      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
)

// Loading Spinner with Professional Design
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className={`border-2 border-slate-600 border-t-bright-blue rounded-full ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <motion.p
          className="text-slate-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Page Transition Loading
export const PageTransitionLoader: React.FC = () => (
  <motion.div
    className="fixed inset-0 bg-deep-navy/90 backdrop-blur-sm z-50 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <div className="text-center">
      <LoadingSpinner size="large" />
      <motion.div
        className="mt-4 text-slate-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Loading...
      </motion.div>
    </div>
  </motion.div>
)

export default Skeleton