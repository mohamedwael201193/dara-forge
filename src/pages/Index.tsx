import { HeroSection } from "@/components/HeroSection";
import { ProblemSolutionSection } from "@/components/ProblemSolutionSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { DemoApp } from "@/components/DemoApp";
import { AIInsightsDashboard } from "@/components/ai/AIInsightsDashboard";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { Footer } from "@/components/Footer";
import { Brain, Sparkles, TrendingUp, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground variant="neural" />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Problem & Solution */}
        <ProblemSolutionSection />
        
        {/* How It Works */}
        <HowItWorksSection />
        
        {/* Features */}
        <FeaturesSection />
        
        {/* AI Insights Section */}
        <section id="ai-insights" className="py-24 px-4 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex justify-center mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                AI-Powered
                <span className="text-gradient block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Research Insights</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Leverage advanced AI to extract meaningful insights from your research data. 
                Get intelligent recommendations, trend analysis, and predictive insights powered by 0G's decentralized AI network.
              </p>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="text-center bg-slate-800/50 rounded-xl p-8 border border-slate-700 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                    <TrendingUp className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Trend Analysis</h3>
                  <p className="text-slate-300">Identify patterns and trends in your research data with AI-powered statistical analysis</p>
                </div>
                
                <div className="text-center bg-slate-800/50 rounded-xl p-8 border border-slate-700 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                    <Zap className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Smart Predictions</h3>
                  <p className="text-slate-300">Generate accurate forecasts and predictions based on historical data patterns</p>
                </div>
                
                <div className="text-center bg-slate-800/50 rounded-xl p-8 border border-slate-700 backdrop-blur-sm hover:border-pink-500/50 transition-colors">
                  <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-500/30">
                    <Sparkles className="w-8 h-8 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Intelligent Recommendations</h3>
                  <p className="text-slate-300">Receive actionable insights and optimization suggestions for your research</p>
                </div>
              </div>
            </div>
            
            <AIInsightsDashboard />
          </div>
        </section>
        
        {/* Enhanced Demo Section */}
        <section id="demo" className="py-24 px-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                DARA Forge
                <span className="text-gradient block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Complete Research Platform</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                Experience the full power of decentralized AI research with DARA Forge. Upload datasets to 0G Storage, 
                run AI computations on 0G Compute, publish to Data Availability, create Intelligent NFTs, and track everything on the blockchain. 
                All operations are live on the 0G Galileo testnet with real cryptographic proofs.
              </p>
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="text-center bg-slate-800/50 rounded-lg p-6 border border-slate-700 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Upload & Store</h3>
                  <p className="text-sm text-slate-300">Securely upload research datasets to decentralized 0G Storage</p>
                </div>
                <div className="text-center bg-slate-800/50 rounded-lg p-6 border border-slate-700 backdrop-blur-sm hover:border-green-500/50 transition-colors">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/30">
                    <span className="text-green-400 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">AI Compute</h3>
                  <p className="text-sm text-slate-300">Run AI analysis and machine learning on 0G Compute Network</p>
                </div>
                <div className="text-center bg-slate-800/50 rounded-lg p-6 border border-slate-700 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                    <span className="text-purple-400 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Publish & Verify</h3>
                  <p className="text-sm text-slate-300">Publish to Data Availability with cryptographic proofs</p>
                </div>
                <div className="text-center bg-slate-800/50 rounded-lg p-6 border border-slate-700 backdrop-blur-sm hover:border-pink-500/50 transition-colors">
                  <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-pink-500/30">
                    <span className="text-pink-400 font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">Create INFTs</h3>
                  <p className="text-sm text-slate-300">Transform research into interactive Intelligent NFTs</p>
                </div>
              </div>
            </div>
            <DemoApp />
          </div>
        </section>
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Index;

