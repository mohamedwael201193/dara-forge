import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'green' | 'pink' | 'white';
  variant?: 'default' | 'dots' | 'pulse' | 'ring' | 'neural';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  variant = 'default',
  className = ''
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };
    return sizes[size];
  };

  const getColorClasses = () => {
    const colors = {
      blue: 'border-blue-500',
      purple: 'border-purple-500',
      green: 'border-green-500',
      pink: 'border-pink-500',
      white: 'border-white'
    };
    return colors[color];
  };

  const renderDefault = () => (
    <div className={`${getSizeClasses()} ${className}`}>
      <div className={`animate-spin rounded-full h-full w-full border-2 border-transparent ${getColorClasses()} border-t-transparent`}></div>
    </div>
  );

  const renderDots = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${getSizeClasses()} rounded-full bg-current animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        ></div>
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`${getSizeClasses()} ${className}`}>
      <div className={`animate-ping rounded-full h-full w-full bg-current opacity-75`}></div>
    </div>
  );

  const renderRing = () => (
    <div className={`${getSizeClasses()} ${className}`}>
      <div className="animate-spin rounded-full h-full w-full border-2 border-current border-t-transparent opacity-75"></div>
    </div>
  );

  const renderNeural = () => (
    <div className={`${getSizeClasses()} ${className} relative`}>
      <div className="absolute inset-0 animate-spin">
        <div className="h-full w-full rounded-full border-2 border-transparent border-t-current opacity-75"></div>
      </div>
      <div className="absolute inset-0 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}>
        <div className="h-full w-full rounded-full border-2 border-transparent border-b-current opacity-50"></div>
      </div>
      <div className="absolute inset-2 animate-pulse">
        <div className="h-full w-full rounded-full bg-current opacity-25"></div>
      </div>
    </div>
  );

  switch (variant) {
    case 'dots':
      return renderDots();
    case 'pulse':
      return renderPulse();
    case 'ring':
      return renderRing();
    case 'neural':
      return renderNeural();
    default:
      return renderDefault();
  }
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  spinner?: LoadingSpinnerProps;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  spinner = {},
  className = ''
}) => {
  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <div className="bg-slate-800/90 rounded-lg p-8 border border-slate-700 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner {...spinner} size="lg" />
          <p className="text-white font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

