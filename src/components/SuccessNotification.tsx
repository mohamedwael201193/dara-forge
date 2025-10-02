import { AnimatedButton } from "@/components/AnimatedButton";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, X } from "lucide-react";

interface SuccessNotificationProps {
  title: string;
  message: string;
  txHash?: string;
  explorerUrl?: string;
  onClose: () => void;
}

export function SuccessNotification({ 
  title, 
  message, 
  txHash, 
  explorerUrl, 
  onClose 
}: SuccessNotificationProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-slate-800 border border-green-500/30 rounded-xl shadow-2xl max-w-md w-full transform animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-t-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-600/80 animate-pulse" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-6 h-6 text-white animate-bounce" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-300">{message}</p>
          
          {txHash && (
            <div className="bg-slate-900/50 rounded p-3">
              <p className="text-slate-400 text-sm mb-1">Transaction Hash:</p>
              <code className="text-green-400 text-xs break-all">{txHash}</code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {explorerUrl && (
              <AnimatedButton 
                variant="primary"
                icon={ExternalLink}
                href={explorerUrl}
                target="_blank"
                className="flex-1"
              >
                View on ChainScan
              </AnimatedButton>
            )}
            <Button 
              variant="outline" 
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}