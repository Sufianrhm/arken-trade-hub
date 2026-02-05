import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type MarketSymbol, MARKET_SYMBOLS, MARKET_DISPLAY_NAMES } from '@/types/trading';

interface MarketSelectorProps {
  value: MarketSymbol;
  onChange: (value: MarketSymbol) => void;
}

export function MarketSelector({ value, onChange }: MarketSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as MarketSymbol)}>
      <SelectTrigger className="w-[140px] glass-panel border-border/50 focus:ring-primary/50">
        <SelectValue placeholder="Select market" />
      </SelectTrigger>
      <SelectContent className="glass-panel border-border/50">
        {MARKET_SYMBOLS.map((symbol) => (
          <SelectItem 
            key={symbol} 
            value={symbol}
            className="focus:bg-primary/10 focus:text-foreground"
          >
            {MARKET_DISPLAY_NAMES[symbol]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
