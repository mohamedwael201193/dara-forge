import { motion } from 'framer-motion'
import React from 'react'
import PageTransition from '../components/PageTransition'
import PipelineWizard from '../components/PipelineWizard'

const PipelinePage: React.FC = () => {
  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PipelineWizard />
      </motion.div>
    </PageTransition>
  )
}

export default PipelinePage