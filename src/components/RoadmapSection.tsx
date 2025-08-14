import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Clock, 
  Rocket, 
  Target, 
  Zap, 
  Globe,
  Layers,
  Sparkles,
  Users,
  Bot
} from "lucide-react";

export const RoadmapSection = () => {
  const [selectedMilestone, setSelectedMilestone] = useState(0);

  const roadmapPhases = [
    {
      phase: "First Wave",
      period: "Q1 2024",
      status: "current",
      title: "Foundation & Proof of Concept",
      description: "Establish core architecture and demonstrate DARA's potential",
      icon: Rocket,
      color: "text-accent",
      bgColor: "bg-accent/10",
      milestones: [
        "Interactive website prototype",
        "0G Stack integration demo",
        "Basic wallet connectivity",
        "Simulated AI computation flows",
        "Community engagement platform"
      ]
    },
    {
      phase: "Mid-Term",
      period: "Q2-Q3 2024",
      status: "planned",
      title: "Core Platform Development",
      description: "Build functional DARA platform with live integrations",
      icon: Layers,
      color: "text-primary",
      bgColor: "bg-primary/10",
      milestones: [
        "Live 0G Storage integration",
        "Smart contract deployment",
        "Real AI model execution",
        "Researcher onboarding system",
        "Data sharing protocols",
        "Collaboration tools",
        "Basic tokenomics implementation"
      ]
    },
    {
      phase: "Long-Term",
      period: "Q4 2024 & Beyond",
      status: "future",
      title: "Ecosystem Expansion",
      description: "Scale platform and build comprehensive research ecosystem",
      icon: Globe,
      color: "text-neural-node",
      bgColor: "bg-neural-node/10",
      milestones: [
        "Advanced AI model marketplace",
        "Cross-chain compatibility", 
        "Institutional partnerships",
        "Governance token launch",
        "Mobile applications",
        "Enterprise solutions",
        "Global research network"
      ]
    }
  ];

  const achievements = [
    { icon: CheckCircle, text: "0G Integration Architecture", status: "completed" },
    { icon: CheckCircle, text: "Interactive Prototype", status: "completed" },
    { icon: Clock, text: "Smart Contract Development", status: "in-progress" },
    { icon: Target, text: "Researcher Beta Program", status: "upcoming" }
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-neural-node/10 text-neural-node border-neural-node/20">
            Development Roadmap
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Building the Future of
            <span className="text-gradient block">Decentralized Research</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our strategic roadmap outlines DARA's evolution from innovative concept 
            to global research infrastructure.
          </p>
        </div>

        {/* Current Achievements */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Current Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Card 
                  key={index}
                  className={`p-4 text-center border-2 transition-all duration-300 hover:scale-105
                    ${achievement.status === 'completed' ? 'border-accent/30 bg-accent/5' : 
                      achievement.status === 'in-progress' ? 'border-primary/30 bg-primary/5' : 
                      'border-border bg-card/50'}`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-3 
                    ${achievement.status === 'completed' ? 'text-accent' : 
                      achievement.status === 'in-progress' ? 'text-primary' : 
                      'text-muted-foreground'}`} />
                  <p className="text-sm font-medium">{achievement.text}</p>
                  <Badge 
                    className={`mt-2 text-xs
                      ${achievement.status === 'completed' ? 'bg-accent/10 text-accent' : 
                        achievement.status === 'in-progress' ? 'bg-primary/10 text-primary' : 
                        'bg-muted text-muted-foreground'}`}
                  >
                    {achievement.status.replace('-', ' ')}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Interactive Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-primary opacity-20 hidden lg:block" />
          
          {/* Phase Cards */}
          <div className="space-y-12">
            {roadmapPhases.map((phase, index) => {
              const Icon = phase.icon;
              const isSelected = selectedMilestone === index;
              const isLeft = index % 2 === 0;
              
              return (
                <div 
                  key={index}
                  className={`relative flex items-center ${isLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} 
                    ${isSelected ? 'z-10' : 'z-0'}`}
                >
                  {/* Timeline Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full 
                    bg-gradient-primary border-4 border-background z-10 hidden lg:flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  
                  {/* Content Card */}
                  <div className={`w-full lg:w-5/12 ${isLeft ? 'lg:pr-12' : 'lg:pl-12'}`}>
                    <Card 
                      className={`p-8 cursor-pointer transition-all duration-500 border-2
                        ${isSelected ? 'scale-105 shadow-2xl border-primary/50' : 'hover:scale-102 border-border'}
                        ${phase.status === 'current' ? 'bg-primary/5' : 'bg-card/50'}`}
                      onClick={() => setSelectedMilestone(index)}
                    >
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl ${phase.bgColor} border-2 border-current
                          flex items-center justify-center transition-all duration-300
                          ${isSelected ? 'scale-110 rotate-6' : ''}`}>
                          <Icon className={`w-8 h-8 ${phase.color}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{phase.phase}</h3>
                            <Badge className={`text-xs
                              ${phase.status === 'current' ? 'bg-accent/10 text-accent' :
                                phase.status === 'planned' ? 'bg-primary/10 text-primary' :
                                'bg-muted text-muted-foreground'}`}>
                              {phase.period}
                            </Badge>
                          </div>
                          <h4 className="text-lg font-semibold text-gradient">{phase.title}</h4>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground mb-6">{phase.description}</p>

                      {/* Milestones */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                          Key Milestones
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                          {phase.milestones.slice(0, isSelected ? phase.milestones.length : 3).map((milestone, mIndex) => (
                            <div key={mIndex} className="flex items-center gap-3 text-sm">
                              <div className={`w-1.5 h-1.5 rounded-full ${phase.color.replace('text-', 'bg-')}`} />
                              <span>{milestone}</span>
                            </div>
                          ))}
                        </div>
                        
                        {!isSelected && phase.milestones.length > 3 && (
                          <Button variant="ghost" size="sm" className="mt-2 text-xs">
                            View All {phase.milestones.length} Milestones
                          </Button>
                        )}
                      </div>

                      {/* Status Indicator */}
                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {phase.status === 'current' && (
                            <>
                              <Zap className="w-4 h-4 text-accent animate-pulse" />
                              <span className="text-sm font-medium text-accent">Active Development</span>
                            </>
                          )}
                          {phase.status === 'planned' && (
                            <>
                              <Clock className="w-4 h-4 text-primary" />
                              <span className="text-sm font-medium text-primary">Planned</span>
                            </>
                          )}
                          {phase.status === 'future' && (
                            <>
                              <Sparkles className="w-4 h-4 text-neural-node" />
                              <span className="text-sm font-medium text-neural-node">Future Vision</span>
                            </>
                          )}
                        </div>
                        
                        {isSelected && (
                          <div className="text-xs text-muted-foreground">
                            Click to collapse
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <Card className="p-8 bg-gradient-neural text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Join the DARA Journey</h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                Be part of the revolution in scientific research. Follow our progress, 
                contribute to development, or join our researcher community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Users className="w-4 h-4 mr-2" />
                  Join Community
                </Button>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Bot className="w-4 h-4 mr-2" />
                  Get Updates
                </Button>
              </div>
            </div>
            
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 6}s`,
                    animationDuration: `${6 + Math.random() * 4}s`,
                  }}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};