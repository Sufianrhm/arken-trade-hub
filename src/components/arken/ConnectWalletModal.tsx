import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Sparkles, Lock, ArrowRight } from 'lucide-react';

interface ConnectWalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaperTrading: () => void;
  onJoinWaitlist: () => void;
}

export function ConnectWalletModal({ 
  open, 
  onOpenChange, 
  onPaperTrading, 
  onJoinWaitlist 
}: ConnectWalletModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-border/50 sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-center">
            Connect to Arken
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Paper Trading Option */}
          <button
            onClick={() => {
              onPaperTrading();
              onOpenChange(false);
            }}
            className="w-full group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 glass-panel-glow hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Paper Trading</h3>
                  <Badge className="bg-primary/20 text-primary border-0 text-xs">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Practice with $10,000 virtual USDC. No risk, full features.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Live Trading Option (Locked) */}
          <div className="relative rounded-2xl p-5 glass-panel opacity-60 cursor-not-allowed">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-muted text-muted-foreground">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Live Trading</h3>
                  <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                    Coming Soon
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to trade with real funds.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoinWaitlist();
                    onOpenChange(false);
                  }}
                >
                  Join Waitlist
                </Button>
              </div>
              <Lock className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
