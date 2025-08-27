import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Users, Zap, ChevronRight } from "@/lib/icons";

export const ProblemSolutionSection = () => {
  const [activeTab, setActiveTab] = useState<'problems' | 'solutions'>('problems');

  const problems = [
    {
      icon: AlertTriangle,
      title: "Data Silos",
      description: "Research data trapped in isolated systems, limiting collaboration and reproducibility.",
      color: "text-destructive"
    },
    {
      icon: Shield,
      title: "Lack of Transparency",
      description: "Computational methods hidden behind proprietary systems, reducing trust in results.",
      color: "text-yellow-400"
    },
    {
      icon: Users,
      title: "Centralized Control",
      description: "Research infrastructure controlled by few entities, creating barriers to access.",
      color: "text-orange-400"
    }
  ];

  const solutions = [
    {
      icon: Shield,
      title: "Verifiable AI Computation",
      description: "Every computation recorded on-chain with cryptographic proofs ensuring integrity.",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Decentralized Collaboration",
      description: "Open platform enabling global researchers to contribute and access resources fairly.",
      color: "text-neural-node"
    },
    {
      icon: Zap,
      title: "Democratized Access",
      description: "Breaking down barriers with tokenized incentives and distributed infrastructure.",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Transforming Research
            <span className="text-gradient block">From Isolation to Innovation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Traditional research faces critical challenges that DARA solves through decentralized AI and blockchain technology.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-card rounded-lg p-1 border border-border">
            <Button
              variant={activeTab === 'problems' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('problems')}
              className="px-6"
            >
              Current Problems
            </Button>
            <Button
              variant={activeTab === 'solutions' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('solutions')}
              className="px-6"
            >
              DARA Solutions
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {(activeTab === 'problems' ? problems : solutions).map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index}
                className="p-8 bg-card/50 border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 group"
              >
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                
                {activeTab === 'solutions' && (
                  <div className="flex items-center text-primary text-sm font-medium group-hover:text-primary-glow transition-colors">
                    Learn More <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Visual Transformation */}
        <div className="mt-16 relative">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-destructive/20 border-2 border-destructive flex items-center justify-center mb-4 animate-pulse">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <span className="text-sm text-muted-foreground">Centralized<br />Research</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-16 h-1 bg-gradient-primary animate-data-flow relative">
                  <div className="absolute inset-0 bg-gradient-primary opacity-50 animate-pulse" />
                </div>
                <ChevronRight className="w-8 h-8 text-primary mx-4 animate-bounce" />
                <div className="w-16 h-1 bg-gradient-primary animate-data-flow relative">
                  <div className="absolute inset-0 bg-gradient-primary opacity-50 animate-pulse" />
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center mb-4 animate-pulse">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <span className="text-sm text-muted-foreground">Decentralized<br />DARA</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};