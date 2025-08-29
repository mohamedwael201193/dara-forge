import React from 'react';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'gradient' | 'particles' | 'neural';
  className?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'default',
  className = ''
}) => {
  const renderDefault = () => (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.1),transparent_50%)]"></div>
    </div>
  );

  const renderGradient = () => (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/20"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/5 to-blue-500/5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.15),transparent_50%)]"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.15),transparent_50%)]"></div>
    </div>
  );

  const renderParticles = () => (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800"></div>
      
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        ></div>
      ))}
      
      {/* Larger glowing orbs */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute w-32 h-32 rounded-full opacity-10 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${
              ['rgb(59,130,246)', 'rgb(168,85,247)', 'rgb(34,197,94)', 'rgb(251,191,36)', 'rgb(239,68,68)'][i]
            }, transparent)`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 3}s`
          }}
        ></div>
      ))}
    </div>
  );

  const renderNeural = () => (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      
      {/* Neural network nodes */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={`node-${i}`}
          className="absolute w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 1}s`
          }}
        ></div>
      ))}
      
      {/* Neural network connections */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        {Array.from({ length: 10 }).map((_, i) => {
          const x1 = Math.random() * 100;
          const y1 = Math.random() * 100;
          const x2 = Math.random() * 100;
          const y2 = Math.random() * 100;
          
          return (
            <line
              key={`line-${i}`}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="rgb(59,130,246)"
              strokeWidth="1"
              className="animate-pulse"
              style={{
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          );
        })}
      </svg>
      
      {/* Glowing center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full animate-pulse"></div>
    </div>
  );

  switch (variant) {
    case 'gradient':
      return renderGradient();
    case 'particles':
      return renderParticles();
    case 'neural':
      return renderNeural();
    default:
      return renderDefault();
  }
};

// CSS animations for enhanced effects
export const AnimatedBackgroundStyles = () => (
  <style>{`
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    @keyframes glow {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }
    
    @keyframes drift {
      0% { transform: translateX(-100px) translateY(-100px); }
      100% { transform: translateX(100vw) translateY(100vh); }
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
    
    .animate-glow {
      animation: glow 4s ease-in-out infinite;
    }
    
    .animate-drift {
      animation: drift 20s linear infinite;
    }
  `}</style>
);

