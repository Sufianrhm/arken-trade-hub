import { Wallet, TrendingUp, Activity, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PositionsTable } from './PositionsTable';
import type { Position, Trade, PriceData, MarketSymbol } from '@/types/trading';
import { MARKET_DISPLAY_NAMES } from '@/types/trading';

interface PortfolioTabProps {
  balance: number;
  positions: Position[];
  tradeHistory: Trade[];
  prices: Record<MarketSymbol, PriceData>;
  isConnected: boolean;
  onClosePosition: (positionId: string, currentPrice: number) => void;
  onConnectClick: () => void;
}

export function PortfolioTab({
  balance,
  positions,
  tradeHistory,
  prices,
  isConnected,
  onClosePosition,
  onConnectClick,
}: PortfolioTabProps) {
  const calculateTotalUnrealizedPnL = () => {
    return positions.reduce((total, position) => {
      const currentPrice = prices[position.symbol]?.price ?? position.entryPrice;
      const priceDiff = currentPrice - position.entryPrice;
      const direction = position.side === 'long' ? 1 : -1;
      const pnl = (priceDiff / position.entryPrice) * position.size * position.leverage * direction;
      return total + pnl;
    }, 0);
  };

  const unrealizedPnL = calculateTotalUnrealizedPnL();
  const totalEquity = balance + unrealizedPnL;

  if (!isConnected) {
    return (
      <div className="glass-panel p-8 md:p-16 text-center">
        <div className="mx-auto p-4 rounded-2xl bg-primary/10 text-primary mb-6 w-fit">
          <Wallet className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Connect to View Portfolio</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connect your wallet or start paper trading to see your portfolio, positions, and trade history.
        </p>
        <button
          onClick={onConnectClick}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel-glow p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-muted-foreground">Total Equity</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Available: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-xl ${unrealizedPnL >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <TrendingUp className={`w-5 h-5 ${unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
            <span className="text-muted-foreground">Unrealized PnL</span>
          </div>
          <p className={`text-3xl font-bold ${unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            From {positions.length} open position{positions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="glass-panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-muted">
              <Activity className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">Open Positions</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {positions.length}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Active trades
          </p>
        </div>
      </div>

      {/* Open Positions */}
      {positions.length > 0 ? (
        <PositionsTable
          positions={positions}
          prices={prices}
          onClosePosition={onClosePosition}
        />
      ) : (
        <div className="glass-panel p-8 text-center">
          <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No open positions</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Open a trade to see it here
          </p>
        </div>
      )}

      {/* Trade History */}
      <div className="glass-panel p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Trade History</h3>
        </div>

        {tradeHistory.length > 0 ? (
          <div className="space-y-2">
            {tradeHistory.slice(0, 20).map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline"
                    className={trade.side === 'long' 
                      ? 'text-success border-success/30 bg-success/10' 
                      : 'text-destructive border-destructive/30 bg-destructive/10'
                    }
                  >
                    {trade.side.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{MARKET_DISPLAY_NAMES[trade.symbol]}</span>
                  <Badge variant="outline" className="text-xs">
                    {trade.leverage}x
                  </Badge>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(trade.closedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No trade history yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Closed trades will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
