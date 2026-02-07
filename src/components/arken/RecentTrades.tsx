import { useEffect, useState, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { MarketSymbol, RecentTrade } from '@/types/trading';

interface RecentTradesProps {
  symbol: MarketSymbol;
  currentPrice: number;
}

export function RecentTrades({ symbol, currentPrice }: RecentTradesProps) {
  const [trades, setTrades] = useState<RecentTrade[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const generateMockTrade = useCallback((basePrice: number): RecentTrade => {
    const side = Math.random() > 0.5;
    const priceVariance = basePrice * (0.0001 + Math.random() * 0.0002) * (side ? 1 : -1);
    return {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      price: basePrice + priceVariance,
      quantity: Math.random() * 2 + 0.01,
      time: Date.now(),
      isBuyerMaker: !side,
    };
  }, []);

  useEffect(() => {
    // Generate initial mock trades
    const initialTrades: RecentTrade[] = [];
    for (let i = 0; i < 20; i++) {
      initialTrades.push(generateMockTrade(currentPrice));
    }
    setTrades(initialTrades.reverse());

    // Try WebSocket connection
    const symbolLower = symbol.toLowerCase();
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbolLower}@trade`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const trade: RecentTrade = {
          id: data.t.toString(),
          price: parseFloat(data.p),
          quantity: parseFloat(data.q),
          time: data.T,
          isBuyerMaker: data.m,
        };
        setTrades(prev => [trade, ...prev.slice(0, 49)]);
      };

      ws.onerror = () => {
        // Fall back to mock updates
        const interval = setInterval(() => {
          setTrades(prev => {
            const newTrade = generateMockTrade(prev[0]?.price || currentPrice);
            return [newTrade, ...prev.slice(0, 49)];
          });
        }, 500 + Math.random() * 1000);
        
        return () => clearInterval(interval);
      };
    } catch {
      // Use mock data
      const interval = setInterval(() => {
        setTrades(prev => {
          const newTrade = generateMockTrade(prev[0]?.price || currentPrice);
          return [newTrade, ...prev.slice(0, 49)];
        });
      }, 500 + Math.random() * 1000);
      
      return () => clearInterval(interval);
    }

    return () => {
      wsRef.current?.close();
    };
  }, [symbol, currentPrice, generateMockTrade]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const formatQty = (qty: number) => {
    if (qty >= 1) return qty.toFixed(4);
    return qty.toFixed(6);
  };

  const formatTime = (time: number) => {
    return new Date(time).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="glass-panel p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-foreground">Recent Trades</h3>
        <span className="text-[10px] text-muted-foreground">Live</span>
      </div>

      <div className="grid grid-cols-3 text-[10px] text-muted-foreground mb-1 px-1">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Time</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0">
          {trades.map((trade) => (
            <div 
              key={trade.id}
              className="grid grid-cols-3 text-[10px] py-0.5 px-1 hover:bg-muted/20 transition-colors"
            >
              <span className={`tabular-nums ${trade.isBuyerMaker ? 'text-destructive' : 'text-success'}`}>
                {formatPrice(trade.price)}
              </span>
              <span className="text-right text-muted-foreground tabular-nums">
                {formatQty(trade.quantity)}
              </span>
              <span className="text-right text-muted-foreground tabular-nums">
                {formatTime(trade.time)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
