import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Download, TrendingUp, TrendingDown } from 'lucide-react';
import type { Position, LimitOrder, Trade, MarketSymbol, PriceData } from '@/types/trading';
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

  const calculatePnL = (position: Position): { pnl: number; pnlPercent: number } => {
    const currentPrice = prices[position.symbol]?.price ?? position.entryPrice;
    const priceDiff = position.side === 'long' 
      ? currentPrice - position.entryPrice 
      : position.entryPrice - currentPrice;
    const pnl = priceDiff * position.size / position.entryPrice;
    const pnlPercent = (pnl / position.margin) * 100;
    return { pnl, pnlPercent };
  };

  const handleExport = () => {
    const csv = onExportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arken-trades-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-3 pt-2 border-b border-border/50">
          <TabsList className="bg-transparent h-8">
            <TabsTrigger value="positions" className="text-xs h-7 px-3 data-[state=active]:bg-primary/20">
              Positions ({positions.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs h-7 px-3 data-[state=active]:bg-primary/20">
              Orders ({limitOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs h-7 px-3 data-[state=active]:bg-primary/20">
              History
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'history' && tradeHistory.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleExport} className="h-7 text-xs gap-1">
              <Download className="w-3 h-3" />
              CSV
            </Button>
          )}
        </div>

        <TabsContent value="positions" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[120px]">
            {positions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs py-8">
                No open positions
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {positions.map((position) => {
                  const { pnl, pnlPercent } = calculatePnL(position);
                  const currentPrice = prices[position.symbol]?.price ?? position.entryPrice;
                  const isProfit = pnl >= 0;

                  return (
                    <div 
                      key={position.id} 
                      className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {position.side === 'long' ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                          <span className={position.side === 'long' ? 'text-green-400' : 'text-red-400'}>
                            {position.side.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{MARKET_DISPLAY_NAMES[position.symbol]}</span>
                        <span className="text-muted-foreground">{position.leverage}x</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-muted-foreground">Entry</div>
                          <div>${position.entryPrice.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-muted-foreground">Mark</div>
                          <div>${currentPrice.toLocaleString()}</div>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className={isProfit ? 'text-green-400' : 'text-red-400'}>
                            {isProfit ? '+' : ''}{pnl.toFixed(2)} USDC
                          </div>
                          <div className={`text-xs ${isProfit ? 'text-green-400/70' : 'text-red-400/70'}`}>
                            {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onClosePosition(position.id, currentPrice)}
                          className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="orders" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[120px]">
            {limitOrders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs py-8">
                No pending orders
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {limitOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={order.side === 'long' ? 'text-green-400' : 'text-red-400'}>
                        {order.side.toUpperCase()}
                      </span>
                      <span className="font-medium">{MARKET_DISPLAY_NAMES[order.symbol]}</span>
                      <span className="text-muted-foreground">{order.leverage}x</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-muted-foreground">Price</div>
                        <div>${order.price.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-muted-foreground">Size</div>
                        <div>${order.size.toLocaleString()}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onCancelOrder(order.id)}
                        className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 m-0 p-0">
          <ScrollArea className="h-[120px]">
            {tradeHistory.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs py-8">
                No trade history
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {tradeHistory.slice(0, 20).map((trade) => {
                  const isProfit = trade.pnl >= 0;
                  return (
                    <div 
                      key={trade.id} 
                      className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className={trade.side === 'long' ? 'text-green-400' : 'text-red-400'}>
                          {trade.side.toUpperCase()}
                        </span>
                        <span className="font-medium">{MARKET_DISPLAY_NAMES[trade.symbol]}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-muted-foreground">Entry → Exit</div>
                          <div>${trade.entryPrice.toLocaleString()} → ${trade.exitPrice.toLocaleString()}</div>
                        </div>
                        <div className={`text-right min-w-[80px] ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{trade.pnl.toFixed(2)} USDC
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {new Date(trade.closedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
