import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Download, TrendingUp, TrendingDown, FileSpreadsheet } from 'lucide-react';
import type { Position, LimitOrder, Trade, PriceData, MarketSymbol } from '@/types/trading';
import { MARKET_DISPLAY_NAMES } from '@/types/trading';

interface TradingTabsProps {
  positions: Position[];
  limitOrders: LimitOrder[];
  tradeHistory: Trade[];
  prices: Record<MarketSymbol, PriceData>;
  onClosePosition: (positionId: string, currentPrice: number) => void;
  onCancelOrder: (orderId: string) => void;
  onExportCSV: () => string;
}

export function TradingTabs({
  positions,
  limitOrders,
  tradeHistory,
  prices,
  onClosePosition,
  onCancelOrder,
  onExportCSV,
}: TradingTabsProps) {
  const [activeTab, setActiveTab] = useState('positions');

  const calculatePnL = (position: Position) => {
    const currentPrice = prices[position.symbol]?.price ?? position.entryPrice;
    const priceDiff = currentPrice - position.entryPrice;
    const direction = position.side === 'long' ? 1 : -1;
    const pnl = (priceDiff / position.entryPrice) * position.size * position.leverage * direction;
    const pnlPercent = (pnl / position.margin) * 100;
    return { pnl, pnlPercent, currentPrice };
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const handleExport = () => {
    const csv = onExportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arken_trades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
          <TabsList className="bg-transparent h-auto p-0 gap-4">
            <TabsTrigger 
              value="positions" 
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 text-sm"
            >
              Positions ({positions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 text-sm"
            >
              Open Orders ({limitOrders.length})
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 text-sm"
            >
              History
            </TabsTrigger>
          </TabsList>

          {activeTab === 'history' && tradeHistory.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          )}
        </div>

        <TabsContent value="positions" className="m-0">
          {positions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No open positions
            </div>
          ) : (
            <ScrollArea className="max-h-[200px]">
              <div className="divide-y divide-border/20">
                {positions.map((position) => {
                  const { pnl, pnlPercent, currentPrice } = calculatePnL(position);
                  const isProfit = pnl >= 0;
                  
                  return (
                    <div key={position.id} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline"
                            className={position.side === 'long' 
                              ? 'bg-success/10 text-success border-success/30' 
                              : 'bg-destructive/10 text-destructive border-destructive/30'
                            }
                          >
                            {position.side === 'long' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {position.side.toUpperCase()}
                          </Badge>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground text-sm">
                                {MARKET_DISPLAY_NAMES[position.symbol]}
                              </span>
                              <span className="text-xs text-muted-foreground">{position.leverage}x</span>
                              <span className="text-[10px] text-muted-foreground uppercase">{position.marginMode}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Entry: ${formatPrice(position.entryPrice)} | Liq: ${formatPrice(position.liquidationPrice)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`font-semibold tabular-nums text-sm ${isProfit ? 'text-success' : 'text-destructive'}`}>
                              {isProfit ? '+' : ''}{pnl.toFixed(2)} USDC
                            </div>
                            <div className={`text-xs tabular-nums ${isProfit ? 'text-success' : 'text-destructive'}`}>
                              {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onClosePosition(position.id, currentPrice)}
                            className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      {(position.takeProfit || position.stopLoss) && (
                        <div className="mt-2 flex gap-3 text-[10px]">
                          {position.takeProfit && (
                            <span className="text-success">TP: ${formatPrice(position.takeProfit)}</span>
                          )}
                          {position.stopLoss && (
                            <span className="text-destructive">SL: ${formatPrice(position.stopLoss)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="orders" className="m-0">
          {limitOrders.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No open orders
            </div>
          ) : (
            <ScrollArea className="max-h-[200px]">
              <div className="divide-y divide-border/20">
                {limitOrders.map((order) => (
                  <div key={order.id} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline"
                          className={order.side === 'long' 
                            ? 'bg-success/10 text-success border-success/30' 
                            : 'bg-destructive/10 text-destructive border-destructive/30'
                          }
                        >
                          {order.side.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground text-sm">
                              {MARKET_DISPLAY_NAMES[order.symbol]}
                            </span>
                            <span className="text-xs text-muted-foreground">{order.leverage}x</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Limit: ${formatPrice(order.price)} | Size: ${order.size.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelOrder(order.id)}
                        className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        <TabsContent value="history" className="m-0">
          {tradeHistory.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No trade history
            </div>
          ) : (
            <ScrollArea className="max-h-[200px]">
              <div className="divide-y divide-border/20">
                {tradeHistory.slice(0, 20).map((trade) => {
                  const isProfit = trade.pnl >= 0;
                  
                  return (
                    <div key={trade.id} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant="outline"
                            className={trade.side === 'long' 
                              ? 'bg-success/10 text-success border-success/30' 
                              : 'bg-destructive/10 text-destructive border-destructive/30'
                            }
                          >
                            {trade.side.toUpperCase()}
                          </Badge>
                          <div>
                            <span className="font-medium text-foreground text-sm">
                              {MARKET_DISPLAY_NAMES[trade.symbol]}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(trade.entryPrice)} → {formatPrice(trade.exitPrice)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`font-semibold tabular-nums text-sm ${isProfit ? 'text-success' : 'text-destructive'}`}>
                            {isProfit ? '+' : ''}{trade.pnl.toFixed(2)} USDC
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(trade.closedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
