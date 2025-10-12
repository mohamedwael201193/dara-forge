import { DemoApp } from "@/components/DemoApp";
import { FeaturesSection } from "@/components/FeaturesSection";
import { Footer } from "@/components/Footer";
import GlassNavigation from "@/components/GlassNavigation";
import Hero3D from "@/components/Hero3D";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { ProblemSolutionSection } from "@/components/ProblemSolutionSection";
import ResearchNFTSection from "@/components/ResearchNFTSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-space-blue via-slate-900 to-space-blue">
      {/* Glass Navigation */}
      <GlassNavigation />
      
      {/* 3D Hero Section */}
      <Hero3D />
      
      {/* Problem & Solution */}
      <ProblemSolutionSection />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* Features */}
      <FeaturesSection />
      
      {/* Enhanced Demo Section */}
      <section id="demo" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-black mb-6 text-white">
              DARA Forge Platform
              <span className="text-gradient block bg-gradient-to-r from-electric-blue via-purple-gradient to-cyan-gradient bg-clip-text text-transparent">
                Complete 0G Integration
              </span>
            </h2>
            <p className="font-body text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Experience the full power of decentralized AI research with DARA Forge. Upload datasets to 0G Storage, 
              generate AI summaries, publish to decentralized networks, and track everything on the blockchain. 
              All operations are live on the 0G Galileo testnet with real cryptographic proofs.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center glass-card rounded-xl p-6 card-3d cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-electric-blue/20 to-cyan-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-electric-blue/30">
                  <span className="text-electric-blue font-bold">1</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Upload & Store</h3>
                <p className="text-sm text-muted-foreground">Securely upload research datasets to decentralized 0G Storage</p>
              </div>
              <div className="text-center glass-card rounded-xl p-6 card-3d cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-verified-green/20 to-emerald-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-verified-green/30">
                  <span className="text-verified-green font-bold">2</span>
                </div>
                <h3 className="font-semibold text-white mb-2">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">Generate intelligent summaries and insights using AI</p>
              </div>
              <div className="text-center glass-card rounded-xl p-6 card-3d cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-purple-400/30">
                  <span className="text-purple-400 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Publish & Share</h3>
                <p className="text-sm text-muted-foreground">Publish findings to decentralized networks for global access</p>
              </div>
              <div className="text-center glass-card rounded-xl p-6 card-3d cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-accent/20 to-yellow-400/20 rounded-xl flex items-center justify-center mx-auto mb-3 border border-gold-accent/30">
                  <span className="text-gold-accent font-bold">4</span>
                </div>
                <h3 className="font-semibold text-white mb-2">Verify & Track</h3>
                <p className="text-sm text-muted-foreground">Monitor status and verify integrity with blockchain proofs</p>
              </div>
            </div>
          </div>
          <DemoApp />
        </div>
      </section>
      
      {/* Research NFT Section */}
      <ResearchNFTSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

