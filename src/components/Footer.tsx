import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  Github, 
  Twitter, 
  Mail, 
  ExternalLink,

  Shield,
  Users,
  Zap
} from "lucide-react";

export const Footer = () => {
  const quickLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Demo", href: "#demo" },
  ];

  const resources = [
    { name: "Documentation", href: "https://docs.0g.ai/", icon: ExternalLink },
    { name: "GitHub Repository", href: "https://github.com/mohamedwael201193/dara-forge", icon: Github },
    { name: "Research Papers", href: "https://0g.ai/papers", icon: ExternalLink },
    { name: "0G Integration Guide", href: "https://docs.0g.ai/integration-guide", icon: ExternalLink }
  ];

  const ogComponents = [
    { name: "0G Chain", icon: Shield, desc: "EVM-compatible blockchain" },
    { name: "0G Compute", icon: Zap, desc: "Decentralized AI computation" },
    { name: "0G Storage", icon  Folder, desc: "Distributed data storage" },
    { name: "0G DA", icon: Users, desc: "Data availability layer" }
  ];

  return (
    <footer className="bg-card/50 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">DARA</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Democratizing scientific research through decentralized AI and blockchain technology. 
              Powered by the 0G ecosystem.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="w-10 h-10" asChild>
                <a href="https://x.com/Mowael777" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="w-10 h-10" asChild>
                <a href="https://github.com/mohamedwael201193/dara-forge" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="w-10 h-10" asChild>
                <a href="mailto:mohamedwael2001193@gmail.com">
                  <Mail className="w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-6">Quick Links</h3>
            <div className="space-y-4">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="block text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-6">Resources</h3>
            <div className="space-y-4">
              {resources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <a
                    key={index}
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 group"
                  >
                    <span>{resource.name}</span>
                    <Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 0G Integration */}
          <div>
            <h3 className="font-semibold mb-6">Powered by 0G</h3>
            <div className="space-y-4">
              {ogComponents.map((component, index) => {
                const Icon = component.icon;
                return (
                  <div key={index} className="group cursor-pointer">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-6 h-6 rounded bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">
                        {component.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-9">
                      {component.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              Made with passion by DEVMO © 2025. Empowering the future of decentralized AI research.
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-primary opacity-30" />
      </div>
    </footer>
  );
};

