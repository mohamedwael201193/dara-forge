import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-green-500/30 rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              ✅
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
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
              <Button 
                className="bg-purple-600 hover:bg-purple-500 flex-1"
                onClick={() => window.open(explorerUrl, '_blank')}
              >
                🔗 View on ChainScan
              </Button>
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