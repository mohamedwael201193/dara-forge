import { motion } from 'framer-motion'
import React from 'react'
import PageTransition from '../components/PageTransition'
import VerifyPanel from '../components/VerifyPanel'

const VerifyPage: React.FC = () => {
  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <VerifyPanel />
      </motion.div>
    </PageTransition>
  )
}

export default VerifyPage