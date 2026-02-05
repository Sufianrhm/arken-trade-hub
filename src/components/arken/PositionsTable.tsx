import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import type { Position, PriceData, MarketSymbol } from '@/types/trading';
import { MARKET_DISPLAY_NAMES } from '@/types/trading';

interface PositionsTableProps {
  positions: Position[];
  prices: Record<MarketSymbol, PriceData>;
  onClosePosition: (positionId: string, currentPrice: number) => void;
  compact?: boolean;
}

export function PositionsTable({ 
  positions, 
  prices, 
  onClosePosition,
  compact = false 
}: PositionsTableProps) {
  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const calculatePnL = (position: Position) => {
    const currentPrice = prices[position.symbol]?.price ?? position.entryPrice;
    const priceDiff = currentPrice - position.entryPrice;
    const direction = position.side === 'long' ? 1 : -1;
    const pnl = (priceDiff / position.entryPrice) * position.size * position.leverage * direction;
    const pnlPercent = (pnl / position.margin) * 100;
    return { pnl, pnlPercent, currentPrice };
  };

  return (
    <div className="glass-panel p-4 md:p-6">
      <h3 className="font-semibold text-foreground mb-4">
        Open Positions ({positions.length})
      </h3>

      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {positions.map((position) => {
          const { pnl, pnlPercent, currentPrice } = calculatePnL(position);
          const isProfit = pnl >= 0;

          return (
            <div key={position.id} className="glass-panel p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{MARKET_DISPLAY_NAMES[position.symbol]}</span>
                  <Badge 
                    variant="outline"
                    className={position.side === 'long' 
                      ? 'text-success border-success/30 bg-success/10' 
                      : 'text-destructive border-destructive/30 bg-destructive/10'
                    }
                  >
                    {position.side === 'long' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {position.side.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {position.leverage}x
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onClosePosition(position.id, currentPrice)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Entry</span>
                  <p className="font-medium">${formatPrice(position.entryPrice)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Current</span>
                  <p className="font-medium">${formatPrice(currentPrice)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Size</span>
                  <p className="font-medium">${position.size.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">PnL</span>
                  <p className={`font-semibold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                    {isProfit ? '+' : ''}{pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
              <th className="pb-3 font-medium">Market</th>
              <th className="pb-3 font-medium">Side</th>
              <th className="pb-3 font-medium">Entry Price</th>
              <th className="pb-3 font-medium">Current Price</th>
              <th className="pb-3 font-medium">Size</th>
              <th className="pb-3 font-medium">Leverage</th>
              <th className="pb-3 font-medium">PnL</th>
              <th className="pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {positions.map((position) => {
              const { pnl, pnlPercent, currentPrice } = calculatePnL(position);
              const isProfit = pnl >= 0;

              return (
                <tr key={position.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-4 font-medium">{MARKET_DISPLAY_NAMES[position.symbol]}</td>
                  <td className="py-4">
                    <Badge 
                      variant="outline"
                      className={position.side === 'long' 
                        ? 'text-success border-success/30 bg-success/10' 
                        : 'text-destructive border-destructive/30 bg-destructive/10'
                      }
                    >
                      {position.side === 'long' ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {position.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-4">${formatPrice(position.entryPrice)}</td>
                  <td className="py-4">${formatPrice(currentPrice)}</td>
                  <td className="py-4">${position.size.toFixed(2)}</td>
                  <td className="py-4">
                    <Badge variant="outline" className="text-xs">
                      {position.leverage}x
                    </Badge>
                  </td>
                  <td className={`py-4 font-semibold ${isProfit ? 'text-success' : 'text-destructive'}`}>
                    {isProfit ? '+' : ''}${pnl.toFixed(2)}
                    <span className="text-xs ml-1 opacity-80">
                      ({pnlPercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="py-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onClosePosition(position.id, currentPrice)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Close
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
