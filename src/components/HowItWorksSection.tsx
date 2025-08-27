import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Brain, Share, Cpu, Shield, Globe, Folder } from "@/lib/icons";

export const HowItWorksSection = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      title: "Data Ingestion",
      subtitle: "Upload & Secure",
      icon: Upload,
      description: "Researchers upload datasets to 0G Storage with automated encryption and redundancy.",
      details: [
        "End-to-end encryption",
        "Distributed storage across nodes",
        "Metadata recorded on 0G Chain",
        "Access control via smart contracts"
      ],
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      id: 1,
      title: "AI Execution",
      subtitle: "Compute & Verify",
      icon: Brain,
      description: "AI models execute on 0G Compute with cryptographic proofs of computation integrity.",
      details: [
        "Verifiable computation proofs",
        "Distributed AI model execution",
        "Real-time progress tracking",
        "Resource optimization"
      ],
      color: "text-neural-node",
      bgColor: "bg-neural-node/10"
    },
    {
      id: 2,
      title: "Result Sharing",
      subtitle: "Collaborate & Verify",
      icon: Share,
      description: "Results published on 0G DA with full transparency and collaborative features.",
      details: [
        "Immutable result storage",
        "Public verification tools",
        "Collaborative annotations",
        "Citation tracking"
      ],
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  const ogComponents = [
    {
      name: "0G Chain",
      icon: Shield,
      description: "Fast, modular blockchain for AI transactions",
      role: "Smart contracts, permissions, micropayments"
    },
    {
      name: "0G Compute",
      icon: Cpu,
      description: "Decentralized AI computation network",
      role: "Model execution, verifiable computation"
    },
    {
      name: "0G Storage",
      icon: Folder,
      description: "Distributed data storage system",
      role: "Dataset storage, redundancy, encryption"
    },
    {
      name: "0G DA",
      icon: Globe,
      description: "Data availability layer for transparency",
      role: "Result publishing, public verification"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How DARA
            <span className="text-gradient block">Revolutionizes Research</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the seamless workflow that transforms scientific discovery through decentralized AI and blockchain technology.
          </p>
        </div>

        {/* Interactive Workflow */}
        <div className="mb-16">
          {/* Step Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex gap-4 p-2 bg-card rounded-lg border border-border">
              {steps.map((step) => (
                <Button
                  key={step.id}
                  variant={activeStep === step.id ? 'default' : 'ghost'}
                  onClick={() => setActiveStep(step.id)}
                  className="flex items-center gap-2"
                >
                  {(() => {
                    const IconComponent = step.icon;
                    return <IconComponent className="w-4 h-4" />;
                  })()}
                  <span className="hidden sm:inline">{step.title}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Active Step Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Step Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${steps[activeStep].bgColor} flex items-center justify-center`}>
                    {(() => {
                      const IconComponent = steps[activeStep].icon;
                      return <IconComponent className={`w-6 h-6 ${steps[activeStep].color}`} />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{steps[activeStep].title}</h3>
                    <p className="text-muted-foreground">{steps[activeStep].subtitle}</p>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  {steps[activeStep].description}
                </p>
              </div>

              <div className="space-y-3">
                {steps[activeStep].details.map((detail, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Representation */}
            <div className="relative">
              <Card className="p-8 bg-card border-border h-64 flex items-center justify-center relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                
                {/* Neural Network Visualization */}
                <div className="relative z-10">
                  <div className={`w-24 h-24 rounded-full ${steps[activeStep].bgColor} border-2 border-current ${steps[activeStep].color} flex items-center justify-center animate-neural-pulse`}>
                    {/* Icon component */}
                    {(() => {
                      const IconComponent = steps[activeStep].icon;
                      return <IconComponent className={`w-12 h-12 ${steps[activeStep].color}`} />;
                    })()}
                  </div>
                  
                  {/* Connecting Lines */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-16 h-0.5 bg-gradient-primary animate-data-flow"
                      style={{
                        transform: `rotate(${i * 60}deg)`,
                        transformOrigin: '0 50%',
                        top: '50%',
                        left: '50%',
                        animationDelay: `${i * 0.5}s`
                      }}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* 0G Components Integration */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12">
            Powered by the <span className="text-gradient">0G Tech Stack</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ogComponents.map((component, index) => (
              <Card 
                key={index}
                className="p-6 text-center group hover:scale-105 transition-all duration-300 border-border hover:border-primary/50 bg-card/50"
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  {(() => {
                    const IconComponent = component.icon;
                    return <IconComponent className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <h4 className="font-semibold text-lg mb-2">{component.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{component.description}</p>
                <div className="text-xs text-primary font-medium">{component.role}</div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};