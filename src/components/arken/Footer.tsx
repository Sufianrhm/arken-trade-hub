import { Link } from 'react-router-dom';
import arkenxLogo from '@/assets/arkenx-logo.jpg';

export function Footer() {
  return (
    <footer className="py-4 px-4 border-t border-border bg-background/50">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src={arkenxLogo} alt="ARKENX" className="h-5 w-auto opacity-40" />
          <span className="text-[10px] text-muted-foreground">
            © 2026 ARKENX. All rights reserved.
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-[10px] text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">HOME</Link>
          <Link to="/trade" className="hover:text-foreground transition-colors">TRADE</Link>
          <Link to="/leaderboard" className="hover:text-foreground transition-colors">LEADERBOARD</Link>
          <a href="#" className="hover:text-foreground transition-colors">DOCS</a>
          <a href="#" className="hover:text-foreground transition-colors">SUPPORT</a>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
            PAPER TRADING
          </span>
          <span className="text-[9px] px-2 py-1 rounded bg-muted text-muted-foreground">
            v0.1 BETA
          </span>
        </div>
      </div>
    </footer>
  );
}
