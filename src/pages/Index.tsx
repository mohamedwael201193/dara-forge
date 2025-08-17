import { HeroSection } from "@/components/HeroSection";
import { ProblemSolutionSection } from "@/components/ProblemSolutionSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { DemoSection } from "@/components/DemoSection";
import SampleRunCardSimple from "@/components/SampleRunCardSimple";

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
      
      {/* Interactive Demo */}
      <DemoSection />
      
      {/* Wave 1 Integration */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <SampleRunCardSimple />
        </div>
      </section>
      

      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
