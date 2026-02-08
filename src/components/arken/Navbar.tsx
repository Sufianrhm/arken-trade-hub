import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import type { TradingMode, UserAccount } from '@/types/trading';
import arkenxLogo from '@/assets/arkenx-logo.jpg';

interface NavbarProps {
  mode: TradingMode;
  balance: number;
  currentUser: UserAccount | null;
  onConnectClick: () => void;
  onDisconnect: () => void;
  onAccountClick: () => void;
}

export function Navbar({ mode, balance, currentUser, onConnectClick, onDisconnect, onAccountClick }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border">
      <div className="h-full max-w-[1800px] mx-auto px-4 flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={arkenxLogo} 
            alt="ARKENX" 
            className="h-8 w-auto"
          />
          {mode === 'paper' && (
            <span className="text-label px-2 py-1 bg-primary/10 text-primary rounded">
              PAPER
            </span>
          )}
        </div>

        {/* Right - Account */}
        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <span className="text-sm text-muted-foreground tabular-nums hidden sm:block">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAccountClick}
                className="h-8 px-3 text-sm text-foreground hover:bg-muted"
              >
                <User className="w-4 h-4 mr-2" />
                {currentUser.username}
              </Button>
            </>
          ) : (
            <Button
              onClick={onConnectClick}
              size="sm"
              className="h-8 px-4 text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              CONNECT
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
