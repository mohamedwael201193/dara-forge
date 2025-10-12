import React from 'react'
import HeroBackground from './HeroBackground'

// Test component to verify HeroBackground functionality
const HeroBackgroundTest: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <HeroBackground />
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        color: 'white',
        textAlign: 'center',
        padding: '2rem',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '1rem'
      }}>
        <h1>DARA Hero Background Test</h1>
        <p>Testing scientific research animation layers</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>✓ Gradient Background Animation</li>
          <li>✓ Scientific Particles</li>
          <li>✓ Network Connections</li>
          <li>✓ DNA Helix Pattern</li>
          <li>✓ Data Flow Streams</li>
          <li>✓ Neural Pulse Effects</li>
        </ul>
      </div>
    </div>
  )
}

export default HeroBackgroundTest