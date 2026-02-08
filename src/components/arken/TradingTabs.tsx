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
    a.download = `arkenx-trades-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="panel h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-3 pt-2 border-b border-border">
          <TabsList className="bg-transparent h-8 p-0">
            <TabsTrigger value="positions" className="text-[10px] h-7 px-3 data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              POSITIONS ({positions.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-[10px] h-7 px-3 data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              ORDERS ({limitOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="text-[10px] h-7 px-3 data-[state=active]:bg-muted rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              HISTORY
            </TabsTrigger>
          </TabsList>
          
          {activeTab === 'history' && tradeHistory.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleExport} className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-foreground">
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
                      className="flex items-center justify-between p-2 rounded bg-muted/20 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {position.side === 'long' ? (
                            <TrendingUp className="w-3 h-3 text-success" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-destructive" />
                          )}
                          <span className={position.side === 'long' ? 'text-success' : 'text-destructive'}>
                            {position.side.toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{MARKET_DISPLAY_NAMES[position.symbol]}</span>
                        <span className="text-muted-foreground">{position.leverage}×</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground">ENTRY</div>
                          <div className="tabular-nums">${position.entryPrice.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground">MARK</div>
                          <div className="tabular-nums">${currentPrice.toLocaleString()}</div>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <div className={`tabular-nums ${isProfit ? 'text-success' : 'text-destructive'}`}>
                            {isProfit ? '+' : ''}{pnl.toFixed(2)} USDC
                          </div>
                          <div className={`text-[10px] tabular-nums ${isProfit ? 'text-success/70' : 'text-destructive/70'}`}>
                            {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onClosePosition(position.id, currentPrice)}
                          className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
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
                    className="flex items-center justify-between p-2 rounded bg-muted/20 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className={order.side === 'long' ? 'text-success' : 'text-destructive'}>
                        {order.side.toUpperCase()}
                      </span>
                      <span className="font-medium">{MARKET_DISPLAY_NAMES[order.symbol]}</span>
                      <span className="text-muted-foreground">{order.leverage}×</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground">PRICE</div>
                        <div className="tabular-nums">${order.price.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground">SIZE</div>
                        <div className="tabular-nums">${order.size.toLocaleString()}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onCancelOrder(order.id)}
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
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
                      className="flex items-center justify-between p-2 rounded bg-muted/20 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className={trade.side === 'long' ? 'text-success' : 'text-destructive'}>
                          {trade.side.toUpperCase()}
                        </span>
                        <span className="font-medium">{MARKET_DISPLAY_NAMES[trade.symbol]}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[10px] text-muted-foreground">ENTRY → EXIT</div>
                          <div className="tabular-nums">${trade.entryPrice.toLocaleString()} → ${trade.exitPrice.toLocaleString()}</div>
                        </div>
                        <div className={`text-right min-w-[80px] tabular-nums ${isProfit ? 'text-success' : 'text-destructive'}`}>
                          {isProfit ? '+' : ''}{trade.pnl.toFixed(2)} USDC
                        </div>
                        <div className="text-muted-foreground text-[10px]">
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
