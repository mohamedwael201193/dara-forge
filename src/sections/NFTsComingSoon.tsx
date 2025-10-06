import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Bell,
    CheckCircle,
    Crown,
    Gem,
    Lock,
    Rocket,
    Shield,
    Sparkles,
    Star,
    Trophy,
    Zap
} from 'lucide-react';
import { useState } from 'react';

export function NFTsComingSoon() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Research Achievement NFTs",
      description: "Mint unique NFTs for your verified research milestones",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Proof of Contribution",
      description: "On-chain verification badges for peer reviewers",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: <Gem className="w-8 h-8" />,
      title: "Dataset Ownership NFTs",
      description: "Tokenize your datasets with immutable ownership records",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: "Research DAO Membership",
      description: "Exclusive NFTs for DARA Forge governance participation",
      color: "from-purple-500 to-pink-500"
    }
  ];

  const benefits = [
    "🎯 Verifiable ownership of research contributions",
    "💎 Tradeable scientific achievements",
    "🔐 Immutable proof of discovery timestamps",
    "🌟 Reputation building in the scientific community",
    "💰 Monetization opportunities for datasets",
    "🤝 Collaboration tokens for joint research"
  ];

  const handleNotifyMe = () => {
    if (email && email.includes('@')) {
      setSubscribed(true);
      // In production, send this to your backend
      localStorage.setItem('nft-notify-email', email);
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 p-12 border border-purple-500/20">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative z-10 text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-full">
                <Sparkles className="w-16 h-16 text-white animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Research NFTs
          </h1>
          
          <p className="text-2xl text-gray-300 font-light">
            Transform Your Scientific Achievements into Digital Assets
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <Badge className="px-4 py-2 text-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              <Rocket className="w-4 h-4 mr-2" />
              Launching Soon
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-lg border-purple-500 text-purple-400">
              <Lock className="w-4 h-4 mr-2" />
              Early Access Available
            </Badge>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 animate-float">
          <Star className="w-8 h-8 text-yellow-400 opacity-50" />
        </div>
        <div className="absolute bottom-10 right-10 animate-float-delay">
          <Zap className="w-8 h-8 text-blue-400 opacity-50" />
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, idx) => (
          <Card 
            key={idx}
            className="relative overflow-hidden border-gray-800 bg-gray-900/50 backdrop-blur cursor-pointer transform transition-all duration-300 hover:scale-105"
            onMouseEnter={() => setHoveredFeature(idx)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10`} />
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-300 ${hoveredFeature === idx ? 'opacity-20' : ''}`} />
            
            <CardContent className="relative p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white`}>
                  {feature.icon}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Why Research NFTs Matter
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
              >
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-purple-900 to-pink-900 border-0">
        <CardContent className="p-8 text-center space-y-6">
          <h3 className="text-2xl font-bold text-white">
            Be Among the First to Mint Research NFTs
          </h3>
          
          <p className="text-gray-300">
            Join the waitlist for early access and exclusive benefits
          </p>

          {!subscribed ? (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
              <Button 
                onClick={handleNotifyMe}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transform transition hover:scale-105"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </div>
          ) : (
            <div className="text-green-400 font-semibold flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              You're on the list! We'll notify you when NFTs launch.
            </div>
          )}

          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 flex-wrap">
            <span>🔥 2,847 researchers waiting</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}