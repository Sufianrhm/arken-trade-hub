import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type MarketSymbol, MARKET_SYMBOLS, MARKET_DISPLAY_NAMES, PriceData } from '@/types/trading';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketSelectorProps {
  value: MarketSymbol;
  onChange: (value: MarketSymbol) => void;
  prices?: Record<MarketSymbol, PriceData>;
}

export function MarketSelector({ value, onChange, prices }: MarketSelectorProps) {
  const getChangeIndicator = (symbol: MarketSymbol) => {
    const data = prices?.[symbol];
    if (!data) return null;
    const isPositive = data.changePercent24h >= 0;
    return (
      <span className={`text-[10px] tabular-nums ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {isPositive ? '+' : ''}{data.changePercent24h.toFixed(1)}%
      </span>
    );
  };

  return (
    <Select value={value} onValueChange={(v) => onChange(v as MarketSymbol)}>
      <SelectTrigger className="w-[160px] glass-panel border-border/50 focus:ring-primary/50">
        <SelectValue placeholder="Select market" />
      </SelectTrigger>
      <SelectContent className="glass-panel border-border/50 max-h-[400px]">
        {MARKET_SYMBOLS.map((symbol) => (
          <SelectItem 
            key={symbol} 
            value={symbol}
            className="focus:bg-primary/10 focus:text-foreground"
          >
            <div className="flex items-center justify-between gap-4 w-full">
              <span>{MARKET_DISPLAY_NAMES[symbol]}</span>
              {getChangeIndicator(symbol)}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
