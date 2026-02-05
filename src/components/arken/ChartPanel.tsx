import { LineChart, TrendingUp } from 'lucide-react';
import type { PriceData } from '@/types/trading';

interface ChartPanelProps {
  data: PriceData | undefined;
  symbol: string;
}

export function ChartPanel({ data, symbol }: ChartPanelProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  return (
    <div className="glass-panel p-4 md:p-6 h-[300px] md:h-[400px] flex flex-col">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <LineChart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{symbol}</h3>
            <p className="text-sm text-muted-foreground">Perpetual</p>
          </div>
        </div>
        {data && (
          <div className="text-right">
            <p className="text-xl font-bold text-foreground">
              ${formatPrice(data.price)}
            </p>
            <p className={`text-sm ${data.changePercent24h >= 0 ? 'text-success' : 'text-destructive'}`}>
              {data.changePercent24h >= 0 ? '+' : ''}{data.changePercent24h.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      {/* Chart Placeholder */}
      <div className="flex-1 relative rounded-xl bg-gradient-to-b from-muted/20 to-transparent border border-border/30 overflow-hidden">
        {/* Simulated chart lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,70 Q50,50 100,60 T200,45 T300,55 T400,35 T500,50 T600,30 T700,40 T800,25"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            className="animate-pulse"
          />
          <path
            d="M0,70 Q50,50 100,60 T200,45 T300,55 T400,35 T500,50 T600,30 T700,40 T800,25 L800,100 L0,100 Z"
            fill="url(#chartGradient)"
          />
        </svg>

        {/* Center message */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-primary/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              TradingView Chart Integration
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Coming Soon
            </p>
          </div>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-border"
              style={{ top: `${(i + 1) * 20}%` }}
            />
          ))}
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 border-l border-border"
              style={{ left: `${(i + 1) * 14.28}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
