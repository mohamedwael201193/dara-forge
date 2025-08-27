import { HeroSection } from "@/components/HeroSection";
import { ProblemSolutionSection } from "@/components/ProblemSolutionSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { DemoApp } from "@/components/DemoApp";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Problem & Solution */}
      <ProblemSolutionSection />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* Features */}
      <FeaturesSection />
      
      {/* Enhanced Demo Section */}
      <section id="demo" className="py-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              DARA Forge
              <span className="text-gradient block">Complete Research Platform</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Experience the full power of decentralized AI research with DARA Forge. Upload datasets to 0G Storage, 
              generate AI summaries, publish to decentralized networks, and track everything on the blockchain. 
              All operations are live on the 0G Galileo testnet with real cryptographic proofs.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Upload & Store</h3>
                <p className="text-sm text-slate-600">Securely upload research datasets to decentralized 0G Storage</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">AI Analysis</h3>
                <p className="text-sm text-slate-600">Generate intelligent summaries and insights using AI</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Publish & Share</h3>
                <p className="text-sm text-slate-600">Publish findings to decentralized networks for global access</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Verify & Track</h3>
                <p className="text-sm text-slate-600">Monitor status and verify integrity with blockchain proofs</p>
              </div>
            </div>
          </div>
          <DemoApp />
        </div>
      </section>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;

