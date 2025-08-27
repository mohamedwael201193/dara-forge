import React from 'react';
import { type LucideIcon, Shield, Zap, Folder, Users } from 'lucide-react';

type Feature = {
  name: string;
  icon: LucideIcon;
  desc: string;
};

const features: Feature[] = [
  { name: '0G Chain',   icon: Shield, desc: 'EVM-compatible blockchain' },
  { name: '0G Compute', icon: Zap,    desc: 'Decentralized AI computation' },
  { name: '0G Storage', icon: Folder, desc: 'Distributed data storage' },
  { name: '0G DA',      icon: Users,  desc: 'Data availability layer' }
];

export function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h3 className="mb-6 text-lg font-semibold">0G Stack</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ name, icon: Icon, desc }) => (
            <div key={name} className="flex items-start gap-3 rounded-lg border p-3">
              <Icon className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} DARA Forge
        </div>
      </div>
    </footer>
  );
}

export default Footer;

