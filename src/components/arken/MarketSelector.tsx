import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type MarketSymbol, MARKET_SYMBOLS, MARKET_DISPLAY_NAMES, MARKET_ICONS, PriceData } from '@/types/trading';

interface MarketSelectorProps {
  value: MarketSymbol;
  onChange: (value: MarketSymbol) => void;
  prices?: Record<MarketSymbol, PriceData>;
}

export function MarketSelector({ value, onChange, prices }: MarketSelectorProps) {
  const getCurrentData = (symbol: MarketSymbol) => {
    const data = prices?.[symbol];
    if (!data) return null;
    const isPositive = data.changePercent24h >= 0;
    return { data, isPositive };
  };

  const currentData = getCurrentData(value);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as MarketSymbol)}>
      <SelectTrigger className="w-[180px] bg-card border-border focus:ring-primary h-10">
        <div className="flex items-center gap-2">
          <span className="text-lg">{MARKET_ICONS[value]}</span>
          <span className="font-semibold text-foreground">{MARKET_DISPLAY_NAMES[value]}</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground ml-1">
            PERP
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-card border-border">
        {MARKET_SYMBOLS.map((symbol) => {
          const symbolData = getCurrentData(symbol);
          return (
            <SelectItem 
              key={symbol} 
              value={symbol}
              className="focus:bg-muted focus:text-foreground py-2"
            >
              <div className="flex items-center justify-between gap-4 w-full min-w-[200px]">
                <div className="flex items-center gap-2">
                  <span className="text-base">{MARKET_ICONS[symbol]}</span>
                  <span className="font-medium">{MARKET_DISPLAY_NAMES[symbol]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ${symbolData?.data?.price?.toLocaleString('en-US', { 
                      minimumFractionDigits: symbolData?.data?.price >= 1 ? 2 : 4,
                      maximumFractionDigits: symbolData?.data?.price >= 1 ? 2 : 4,
                    }) ?? '—'}
                  </span>
                  {symbolData && (
                    <span className={`text-[10px] font-medium tabular-nums ${symbolData.isPositive ? 'text-success' : 'text-destructive'}`}>
                      {symbolData.isPositive ? '+' : ''}{symbolData.data.changePercent24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
