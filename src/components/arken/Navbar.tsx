import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, LineChart, Wallet, Trophy, DollarSign } from 'lucide-react';
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
  const location = useLocation();
  
  const navLinks = [
    { path: '/trade', label: 'TRADE', icon: LineChart },
    { path: '/portfolio', label: 'PORTFOLIO', icon: Wallet },
    { path: '/leaderboard', label: 'LEADERBOARD', icon: Trophy },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="h-full max-w-[1920px] mx-auto px-3 md:px-4 flex items-center justify-between">
        {/* Left - Logo + Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={arkenxLogo} 
              alt="ARKENX" 
              className="h-7 w-auto"
            />
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive 
                      ? 'text-foreground bg-muted' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {mode === 'paper' && (
            <span className="text-[10px] font-medium px-2 py-1 bg-primary/10 text-primary rounded tracking-wide">
              PAPER
            </span>
          )}
        </div>

        {/* Right - Balance + Account */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground tabular-nums">
                {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-muted-foreground">USDX</span>
            </div>
          )}
          
          {currentUser ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAccountClick}
              className="h-8 px-3 text-xs text-foreground hover:bg-muted gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{currentUser.username}</span>
            </Button>
          ) : (
            <Button
              onClick={onConnectClick}
              size="sm"
              className="h-8 px-4 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              CONNECT
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-background border-t border-border flex items-center justify-around px-4">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <link.icon className="w-5 h-5" />
              <span className="text-[9px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
