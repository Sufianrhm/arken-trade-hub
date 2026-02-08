import { Wallet, TrendingUp, Activity, History } from 'lucide-react';
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
      <div className="panel p-8 md:p-16 text-center">
        <div className="mx-auto p-4 rounded bg-primary/10 text-primary mb-6 w-fit">
          <Wallet className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-semibold mb-3">CONNECT TO VIEW PORTFOLIO</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
          Connect your wallet or start paper trading to see your portfolio, positions, and trade history.
        </p>
        <button
          onClick={onConnectClick}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded transition-colors duration-75"
        >
          CONNECT
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="panel border-primary/20 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded bg-primary/10">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <span className="text-label">TOTAL EQUITY</span>
          </div>
          <p className="text-2xl font-semibold text-foreground tabular-nums">
            ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            Available: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded ${unrealizedPnL >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
              <TrendingUp className={`w-4 h-4 ${unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
            <span className="text-label">UNREALIZED PNL</span>
          </div>
          <p className={`text-2xl font-semibold tabular-nums ${unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            From {positions.length} open position{positions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="panel p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded bg-muted">
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-label">OPEN POSITIONS</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {positions.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
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
        <div className="panel p-8 text-center">
          <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No open positions</p>
          <p className="text-xs text-muted-foreground mt-1">
            Open a trade to see it here
          </p>
        </div>
      )}

      {/* Trade History */}
      <div className="panel p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-label">TRADE HISTORY</span>
        </div>

        {tradeHistory.length > 0 ? (
          <div className="space-y-2">
            {tradeHistory.slice(0, 20).map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 rounded bg-muted/20 hover:bg-muted/30 transition-colors duration-75"
              >
                <div className="flex items-center gap-3">
                  <span 
                    className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded ${
                      trade.side === 'long' 
                        ? 'text-success bg-success/10' 
                        : 'text-destructive bg-destructive/10'
                    }`}
                  >
                    {trade.side}
                  </span>
                  <span className="font-medium text-sm">{MARKET_DISPLAY_NAMES[trade.symbol]}</span>
                  <span className="text-[10px] text-muted-foreground">{trade.leverage}×</span>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm tabular-nums ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(trade.closedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No trade history yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Closed trades will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
