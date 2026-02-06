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
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left - Settings */}
        <div className="w-24 flex items-center">
          <button className="p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Center - Logo */}
        <div className="flex items-center gap-2.5">
          {/* CSS Triangle Logo */}
          <div className="relative w-7 h-7 md:w-8 md:h-8">
            <svg viewBox="0 0 40 40" className="w-full h-full">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#00f5d4" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {/* Outer triangle */}
              <polygon 
                points="20,4 36,34 4,34" 
                fill="none" 
                stroke="url(#logoGradient)" 
                strokeWidth="2.5"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
              {/* Inner cutout */}
              <polygon 
                points="20,16 28,30 12,30" 
                fill="#050505"
                stroke="url(#logoGradient)" 
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <span 
            className="text-lg md:text-xl text-foreground font-semibold tracking-[0.2em]"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            ARKEN
          </span>
          
          {mode === 'paper' && (
            <Badge 
              variant="outline" 
              className="text-[9px] uppercase tracking-widest bg-primary/10 text-primary border-primary/30 font-medium"
            >
              Paper
            </Badge>
          )}
        </div>

        {/* Right - Wallet */}
        <div className="w-24 flex items-center justify-end gap-2">
          {mode ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground hidden sm:block tabular-nums">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="h-8 px-3 text-xs bg-transparent border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Wallet className="w-3.5 h-3.5 mr-1.5" />
                <span className="hidden sm:inline">Connected</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={onConnectClick}
              size="sm"
              className="h-8 px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all hover:shadow-lg hover:shadow-primary/20"
            >
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              Connect
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
