import { Wallet, TrendingUp, Activity, History, Gift, DollarSign } from 'lucide-react';
import { PositionsTable } from './PositionsTable';
import { RewardsPanel } from './RewardsPanel';
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

  const calculateTotalRealizedPnL = () => {
    return tradeHistory.reduce((total, trade) => total + trade.pnl, 0);
  };

  const unrealizedPnL = calculateTotalUnrealizedPnL();
  const realizedPnL = calculateTotalRealizedPnL();
  const totalEquity = balance + unrealizedPnL;
  const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0);

  if (!isConnected) {
    return (
      <div className="panel p-8 md:p-16 text-center">
        <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary mb-6 w-fit">
          <Wallet className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-3">CONNECT TO VIEW PORTFOLIO</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Sign up or log in to track your positions, PnL, and earn ARKX rewards.
        </p>
        <button
          onClick={onConnectClick}
          className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded transition-colors duration-75"
        >
          GET STARTED
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Equity */}
        <div className="panel p-4 border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-label text-[10px]">TOTAL EQUITY</span>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
            USDX
          </p>
        </div>

        {/* Available Balance */}
        <div className="panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span className="text-label text-[10px]">AVAILABLE</span>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
            Margin: ${totalMargin.toFixed(2)}
          </p>
        </div>

        {/* Unrealized PnL */}
        <div className="panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className={`w-4 h-4 ${unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}`} />
            <span className="text-label text-[10px]">UNREALIZED PNL</span>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${unrealizedPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {positions.length} position{positions.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Realized PnL */}
        <div className="panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-label text-[10px]">REALIZED PNL</span>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${realizedPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {realizedPnL >= 0 ? '+' : ''}${realizedPnL.toFixed(2)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {tradeHistory.length} trade{tradeHistory.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Positions + History */}
        <div className="lg:col-span-2 space-y-4">
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
                Go to Trade to open a position
              </p>
            </div>
          )}

          {/* Trade History */}
          <div className="panel p-4">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-label text-[10px]">TRADE HISTORY</span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {tradeHistory.length} trades
              </span>
            </div>

            {tradeHistory.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {tradeHistory.slice(0, 15).map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 rounded bg-muted/20 hover:bg-muted/30 transition-colors duration-75"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
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
                      <p className="text-[10px] text-muted-foreground tabular-nums">
                        {new Date(trade.closedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No trade history</p>
              </div>
            )}
          </div>
        </div>

        {/* ARKX Rewards Panel */}
        <div className="lg:col-span-1">
          <RewardsPanel
            arkxBalance={0}
            rewards={[]}
          />
        </div>
      </div>
    </div>
  );
}
