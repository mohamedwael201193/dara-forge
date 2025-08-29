import React from 'react';
import { Card } from './card';

interface GlowingCardProps {
  glowColor?: 'blue' | 'purple' | 'green' | 'pink' | 'yellow' | 'red';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const GlowingCard: React.FC<GlowingCardProps> = ({
  glowColor = 'blue',
  intensity = 'medium',
  animated = false,
  className = '',
  children,
  ...props
}) => {
  const getGlowClasses = () => {
    const baseClasses = 'relative overflow-hidden backdrop-blur-sm transition-all duration-300';
    
    const colorClasses = {
      blue: 'border-blue-500/30 hover:border-blue-400/50',
      purple: 'border-purple-500/30 hover:border-purple-400/50',
      green: 'border-green-500/30 hover:border-green-400/50',
      pink: 'border-pink-500/30 hover:border-pink-400/50',
      yellow: 'border-yellow-500/30 hover:border-yellow-400/50',
      red: 'border-red-500/30 hover:border-red-400/50'
    };

    const intensityClasses = {
      low: 'shadow-lg',
      medium: 'shadow-xl',
      high: 'shadow-2xl'
    };

    const glowClasses = {
      blue: {
        low: 'hover:shadow-blue-500/10',
        medium: 'hover:shadow-blue-500/20',
        high: 'hover:shadow-blue-500/30'
      },
      purple: {
        low: 'hover:shadow-purple-500/10',
        medium: 'hover:shadow-purple-500/20',
        high: 'hover:shadow-purple-500/30'
      },
      green: {
        low: 'hover:shadow-green-500/10',
        medium: 'hover:shadow-green-500/20',
        high: 'hover:shadow-green-500/30'
      },
      pink: {
        low: 'hover:shadow-pink-500/10',
        medium: 'hover:shadow-pink-500/20',
        high: 'hover:shadow-pink-500/30'
      },
      yellow: {
        low: 'hover:shadow-yellow-500/10',
        medium: 'hover:shadow-yellow-500/20',
        high: 'hover:shadow-yellow-500/30'
      },
      red: {
        low: 'hover:shadow-red-500/10',
        medium: 'hover:shadow-red-500/20',
        high: 'hover:shadow-red-500/30'
      }
    };

    const animationClasses = animated ? 'animate-pulse' : '';

    return `${baseClasses} ${colorClasses[glowColor]} ${intensityClasses[intensity]} ${glowClasses[glowColor][intensity]} ${animationClasses}`;
  };

  const getGlowOverlay = () => {
    const overlayColors = {
      blue: 'from-blue-500/5 to-transparent',
      purple: 'from-purple-500/5 to-transparent',
      green: 'from-green-500/5 to-transparent',
      pink: 'from-pink-500/5 to-transparent',
      yellow: 'from-yellow-500/5 to-transparent',
      red: 'from-red-500/5 to-transparent'
    };

    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${overlayColors[glowColor]} pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300`} />
    );
  };

  return (
    <Card 
      className={`${getGlowClasses()} ${className}`}
      {...props}
    >
      {getGlowOverlay()}
      <div className="relative z-10">
        {children}
      </div>
    </Card>
  );
};

