import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Network, Folder } from "@/lib/icons";
import heroImage from "@/assets/hero-neural-network.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      {/* Floating Particles Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        {/* Logo/Brand */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">DARA</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in glow-text">
          Accelerating Scientific Discovery
          <br />
          <span className="text-gradient">with Verifiable On-Chain AI</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto animate-fade-in">
          Democratizing access to powerful AI analysis tools through decentralized infrastructure. 
          Ensure integrity and verifiability of research outcomes with blockchain technology.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-10 animate-slide-up">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border">
            <Folder className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Decentralized Storage</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border">
            <Brain className="w-4 h-4 text-neural-node" />
            <span className="text-sm font-medium">Verifiable AI</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border">
            <Network className="w-4 h-4 text-neural-connection" />
            <span className="text-sm font-medium">Collaborative Research</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
          <Button 
            variant="hero" 
            size="lg" 
            className="text-lg px-8 py-4 h-auto"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore the DARA Concept
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-4 h-auto"
            onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Try Live Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">100%</div>
            <div className="text-sm text-muted-foreground">Verifiable Results</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">∞</div>
            <div className="text-sm text-muted-foreground">Scalable Compute</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gradient mb-2">0</div>
            <div className="text-sm text-muted-foreground">Trust Required</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};