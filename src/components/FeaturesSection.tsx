import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 

  Brain, 
  Users, 
  Coins, 
  Shield, 
  Zap, 
  Globe, 
  Lock,
  ChevronRight,
  Folder,
  Database 
} from "lucide-react";

export const FeaturesSection = () => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Database,
      title: "Decentralized Data Storage",
      description: "Store massive datasets across distributed nodes with redundancy and encryption",
      benefits: ["99.9% uptime", "End-to-end encryption", "Global accessibility", "Cost-efficient"],
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30"
    },
    {
      icon: Brain,
      title: "Verifiable AI Computation",
      description: "Execute AI models with cryptographic proofs ensuring computation integrity",
      benefits: ["Zero-knowledge proofs", "Tamper-resistant", "Reproducible results", "Public verification"],
      color: "text-neural-node",
      bgColor: "bg-neural-node/10",
      borderColor: "border-neural-node/30"
    },
    {
      icon: Users,
      title: "Collaborative Research Tools",
      description: "Connect researchers globally with shared workspaces and real-time collaboration",
      benefits: ["Real-time sync", "Version control", "Peer review", "Cross-institutional"],
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30"
    },
    {
      icon: Coins,
      title: "Tokenized Incentives",
      description: "Reward contributions with native tokens for data sharing and computation resources",
      benefits: ["Fair compensation", "Quality metrics", "Governance rights", "Ecosystem growth"],
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
      borderColor: "border-yellow-400/30"
    }
  ];

  const additionalFeatures = [
    { icon: Shield, title: "Enterprise Security", desc: "Military-grade encryption" },
    { icon: Zap, title: "Lightning Fast", desc: "Sub-second query responses" },
    { icon: Globe, title: "Global Network", desc: "Worldwide node distribution" },
    { icon: Lock, title: "Privacy First", desc: "Zero-knowledge architecture" }
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Core Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Powerful Features for
            <span className="text-gradient block">Next-Gen Research</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            DARA combines cutting-edge AI with blockchain technology to deliver unprecedented 
            capabilities for scientific research and collaboration.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isHovered = hoveredFeature === index;
            
            return (
              <Card
                key={index}
                className={`p-8 transition-all duration-500 cursor-pointer border-2 ${feature.borderColor} 
                  ${isHovered ? 'scale-105 shadow-2xl' : 'hover:scale-102'} 
                  bg-card/50 backdrop-blur-sm group`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} border-2 ${feature.borderColor} 
                    flex items-center justify-center transition-all duration-300 
                    ${isHovered ? 'scale-110 rotate-6' : 'group-hover:scale-105'}`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Benefits */}
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div 
                          key={benefitIndex}
                          className="flex items-center gap-2 text-sm"
                          style={{ 
                            animationDelay: isHovered ? `${benefitIndex * 0.1}s` : '0s' 
                          }}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${feature.color.replace('text-', 'bg-')} 
                            ${isHovered ? 'animate-pulse' : ''}`} />
                          <span className={isHovered ? 'text-foreground' : 'text-muted-foreground'}>
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Learn More Link */}
                    <div className="mt-4 flex items-center text-primary text-sm font-medium 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn More 
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional Features */}
        <div className="border-t border-border pt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Additional <span className="text-gradient">Capabilities</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="text-center group hover:scale-105 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-3 
                    group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Demo Teaser */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-primary text-white relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 opacity-10 animate-pulse">
              <div className="w-full h-full bg-white/5" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Ready to Experience DARA?</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Explore our interactive demo to see how these features work together 
                to revolutionize scientific research.
              </p>
              <div className="flex justify-center">
                <div className="px-6 py-3 bg-white/20 rounded-lg border border-white/30 
                  backdrop-blur-sm font-medium cursor-pointer hover:bg-white/30 transition-all duration-300">
                  Try Interactive Demo ↓
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};