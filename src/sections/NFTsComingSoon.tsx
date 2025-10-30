import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Crown,
  ExternalLink,
  Gem,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function NFTsComingSoon() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Research Achievement iNFTs",
      description:
        "Mint intelligent iNFTs for your verified research milestones",
      color: "from-emerald-500 to-teal-500",
      status: "✅ Live",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "ERC-7857 Standard",
      description:
        "Production-grade intelligent NFTs with encrypted capabilities",
      color: "from-blue-500 to-purple-500",
      status: "✅ Live",
    },
    {
      icon: <Gem className="w-8 h-8" />,
      title: "Gasless Minting",
      description:
        "DARA covers all gas fees - focus on research, not transactions",
      color: "from-green-500 to-emerald-500",
      status: "✅ Live",
    },
    {
      icon: <Crown className="w-8 h-8" />,
      title: "Full Ownership",
      description: "You own the iNFT completely with full transfer rights",
      color: "from-purple-500 to-pink-500",
      status: "✅ Live",
    },
  ];

  const benefits = [
    "🎯 Zero gas fees - DARA covers minting costs",
    "💎 Instant minting after pipeline completion",
    "🔐 Immutable on-chain research credentials",
    "🌟 ERC-7857 compliant intelligent NFTs",
    "💰 Full ownership and transferability",
    "🤝 Backend-secured, user-friendly experience",
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/20 via-blue-900/20 to-purple-900/20 p-12 border border-emerald-500/30">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative z-10 text-center space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur-3xl opacity-50" />
              <div className="relative bg-gradient-to-br from-emerald-600 to-blue-600 p-6 rounded-full">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-4">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-emerald-300">
              Live on 0G Mainnet
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Research iNFTs
          </h1>

          <p className="text-2xl text-gray-300 font-light">
            Transform Your Scientific Achievements into Digital Assets
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <Badge className="px-4 py-2 text-lg bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Now Available!
            </Badge>
            <Badge
              variant="outline"
              className="px-4 py-2 text-lg border-emerald-500 text-emerald-400"
            >
              <Zap className="w-4 h-4 mr-2" />
              Gasless Minting
            </Badge>
          </div>

          {/* Contract Address */}
          <div className="bg-slate-800/50 backdrop-blur rounded-lg p-4 max-w-2xl mx-auto mt-6">
            <p className="text-xs text-slate-400 mb-1">
              Deployed Contract (0G Mainnet)
            </p>
            <div className="flex items-center justify-center gap-2">
              <p className="font-mono text-sm text-purple-300">
                0x3156F6E761D7c9dA0a88A6165864995f2b58854f
              </p>
              <button
                onClick={() =>
                  window.open(
                    "https://chainscan.0g.ai/address/0x3156F6E761D7c9dA0a88A6165864995f2b58854f",
                    "_blank"
                  )
                }
                className="text-emerald-400 hover:text-emerald-300"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, idx) => (
          <Card
            key={idx}
            className="relative overflow-hidden border-emerald-800/50 bg-gray-900/50 backdrop-blur cursor-pointer transform transition-all duration-300 hover:scale-105"
            onMouseEnter={() => setHoveredFeature(idx)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-10`}
            />
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                feature.color
              } opacity-0 transition-opacity duration-300 ${
                hoveredFeature === idx ? "opacity-20" : ""
              }`}
            />

            <CardContent className="relative p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white`}
                >
                  {feature.icon}
                </div>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                  {feature.status}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-br from-emerald-900/20 to-blue-900/20 border-emerald-500/20">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Why Research iNFTs on DARA
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-900/50 hover:bg-gray-800/50 transition-colors"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-emerald-900 to-blue-900 border-0">
        <CardContent className="p-8 text-center space-y-6">
          <h3 className="text-2xl font-bold text-white">
            Ready to Mint Your Research iNFT?
          </h3>

          <p className="text-gray-300">
            Complete the research pipeline and mint your intelligent NFT
            instantly - zero gas fees!
          </p>

          <Button
            onClick={() => navigate("/pipeline")}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold rounded-lg transform transition hover:scale-105 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Minting Now
          </Button>

          <div className="flex items-center justify-center gap-6 text-sm text-gray-400 flex-wrap mt-4">
            <span>✅ Production Ready</span>
            <span>🎁 Zero Gas Fees</span>
            <span>⚡ Instant Minting</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
