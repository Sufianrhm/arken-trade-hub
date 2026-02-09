import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, TrendingUp, Users, BarChart3, Award } from 'lucide-react';
import { usePriceData } from '@/hooks/usePriceData';
import { MARKET_SYMBOLS, MARKET_DISPLAY_NAMES, MARKET_ICONS } from '@/types/trading';
import type { MarketSymbol } from '@/types/trading';
import arkenxLogo from '@/assets/arkenx-logo.jpg';

const FEATURES = [
  {
    icon: Zap,
    title: 'INSTANT EXECUTION',
    description: 'Sub-millisecond order matching with zero slippage on paper trades.',
  },
  {
    icon: TrendingUp,
    title: 'UP TO 50× LEVERAGE',
    description: 'Amplify your positions with institutional-grade margin trading.',
  },
  {
    icon: Shield,
    title: 'ZERO FEES',
    description: 'Trade without fees on paper mode. Real mode coming soon.',
  },
  {
    icon: BarChart3,
    title: 'LIVE MARKET DATA',
    description: 'Real-time prices from Binance with WebSocket streaming.',
  },
];

const STATS = [
  { value: '$2.4B+', label: 'VOLUME (24H)' },
  { value: '147K+', label: 'TRADES (24H)' },
  { value: '12.5K+', label: 'ACTIVE USERS' },
  { value: '99.99%', label: 'UPTIME' },
];

export default function Landing() {
  const { prices } = usePriceData(MARKET_SYMBOLS);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
          <img src={arkenxLogo} alt="ARKENX" className="h-8 w-auto" />
          <div className="flex items-center gap-4">
            <Link to="/leaderboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                LEADERBOARD
              </Button>
            </Link>
            <Link to="/trade">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6">
                LAUNCH APP
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-primary tracking-wide">PAPER TRADING LIVE</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
            THE FUTURE OF<br />
            <span className="text-primary">PERPETUAL TRADING</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Trade perpetual futures with up to 50× leverage. Zero fees on paper mode.
            Real-time data. Institutional-grade execution.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link to="/trade">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-6 text-base">
                START TRADING
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline" className="border-border hover:bg-muted px-8 py-6 text-base">
                <Award className="w-5 h-5 mr-2" />
                VIEW LEADERBOARD
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Price Ticker */}
      <section className="py-8 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {MARKET_SYMBOLS.map((symbol) => {
              const data = prices[symbol];
              const isPositive = (data?.changePercent24h ?? 0) >= 0;
              
              return (
                <Link
                  key={symbol}
                  to="/trade"
                  className="panel p-4 hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{MARKET_ICONS[symbol]}</span>
                    <span className="text-sm font-medium text-foreground">
                      {MARKET_DISPLAY_NAMES[symbol]}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground tabular-nums">
                    ${data?.price?.toLocaleString('en-US', { 
                      minimumFractionDigits: data?.price >= 1 ? 2 : 4,
                      maximumFractionDigits: data?.price >= 1 ? 2 : 4,
                    }) ?? '—'}
                  </p>
                  <p className={`text-sm font-medium tabular-nums ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {isPositive ? '+' : ''}{data?.changePercent24h?.toFixed(2) ?? '0.00'}%
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-foreground mb-2 tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              BUILT FOR TRADERS
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to practice and perfect your trading strategy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="panel p-6 hover:border-primary/50 transition-colors">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-sm font-semibold text-foreground mb-2 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARKX Rewards Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="panel p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <span className="text-xs font-medium text-primary tracking-wide">REWARDS PROGRAM</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              EARN <span className="text-primary">ARKX</span> TOKENS
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Trade, compete, and earn ARKX tokens. Redeem for exclusive perks and future airdrops.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-2xl font-bold text-primary mb-1">0.01 ARKX</p>
                <p className="text-xs text-muted-foreground">PER $100 VOLUME</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-2xl font-bold text-primary mb-1">10 ARKX</p>
                <p className="text-xs text-muted-foreground">PER REFERRAL</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-2xl font-bold text-primary mb-1">5 ARKX</p>
                <p className="text-xs text-muted-foreground">DAILY STREAK BONUS</p>
              </div>
            </div>
            
            <Link to="/trade">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8">
                START EARNING
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <img src={arkenxLogo} alt="ARKENX" className="h-6 w-auto opacity-50" />
            <span className="text-sm text-muted-foreground">
              © 2026 ARKENX. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Docs</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
