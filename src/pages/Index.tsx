import { HeroSection } from "@/components/HeroSection";
import { ProblemSolutionSection } from "@/components/ProblemSolutionSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { DemoSection } from "@/components/DemoSection";
import OGUploadCard from "@/components/OGUploadCard";

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
      <section className="mx-auto max-w-5xl px-4 py-8">
        <OGUploadCard />
      </section>
      

      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;


