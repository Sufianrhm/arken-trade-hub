import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Wallet } from 'lucide-react';
import type { TradingMode } from '@/types/trading';

interface NavbarProps {
  mode: TradingMode;
  balance: number;
  onConnectClick: () => void;
  onDisconnect: () => void;
}

export function Navbar({ mode, balance, onConnectClick, onDisconnect }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-panel rounded-none border-t-0 border-x-0">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left - Settings placeholder */}
        <div className="w-24 flex items-center">
          <button className="p-2 rounded-xl hover:bg-secondary/50 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Center - Logo */}
        <div className="flex items-center gap-3">
          <span 
            className="text-2xl tracking-[0.2em] text-foreground"
            style={{ 
              fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif",
              fontWeight: 600,
              letterSpacing: '0.15em',
            }}
          >
            ARKEN
          </span>
          {mode === 'paper' && (
            <Badge 
              variant="outline" 
              className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-primary/30"
            >
              Paper
            </Badge>
          )}
        </div>

        {/* Right - Wallet */}
        <div className="w-24 flex items-center justify-end gap-2">
          {mode ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="glass-panel border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Wallet className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Connected</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={onConnectClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              <Wallet className="w-4 h-4 mr-1.5" />
              Connect
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
