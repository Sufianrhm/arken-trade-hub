import { useEffect, useRef, useState, useCallback } from 'react';
import type { MarketSymbol } from '@/types/trading';

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookData {
  bids: [number, number][]; // [price, quantity][]
  asks: [number, number][]; // [price, quantity][]
  lastUpdateId: number;
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

const TIMEFRAME_MAP: Record<Timeframe, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
};

// Generate mock data when WebSocket fails
const generateMockKlines = (basePrice: number, interval: number, count: number = 100): KlineData[] => {
  const data: KlineData[] = [];
  const now = Math.floor(Date.now() / 1000);
  
  let currentPrice = basePrice * (0.92 + Math.random() * 0.08);
  
  for (let i = count; i >= 0; i--) {
    const time = now - i * interval;
    const volatility = 0.002 + Math.random() * 0.004;
    const direction = Math.random() > 0.48 ? 1 : -1;
    
    const open = currentPrice;
    const change = currentPrice * volatility * direction;
    const close = currentPrice + change;
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    const volume = (500 + Math.random() * 2000) * (basePrice / 50000);
    
    data.push({ time, open, high, low, close, volume });
    currentPrice = close;
  }
  
  return data;
};

const generateMockOrderBook = (basePrice: number): OrderBookData => {
  const bids: [number, number][] = [];
  const asks: [number, number][] = [];
  
  for (let i = 0; i < 15; i++) {
    const bidPrice = basePrice * (1 - 0.0001 * (i + 1) - Math.random() * 0.0001);
    const askPrice = basePrice * (1 + 0.0001 * (i + 1) + Math.random() * 0.0001);
    const bidQty = Math.random() * 5 + 0.1;
    const askQty = Math.random() * 5 + 0.1;
    
    bids.push([bidPrice, bidQty]);
    asks.push([askPrice, askQty]);
  }
  
  return { bids, asks, lastUpdateId: Date.now() };
};

export function useBinanceWebSocket(symbol: MarketSymbol, timeframe: Timeframe, currentPrice?: number) {
  const [klines, setKlines] = useState<KlineData[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookData>({ bids: [], asks: [], lastUpdateId: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 3;

  const getIntervalSeconds = useCallback(() => {
    const map: Record<Timeframe, number> = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
    };
    return map[timeframe];
  }, [timeframe]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const symbolLower = symbol.toLowerCase();
    const interval = TIMEFRAME_MAP[timeframe];
    
    // Combined stream for klines and partial order book
    const streamUrl = `wss://stream.binance.com:9443/stream?streams=${symbolLower}@kline_${interval}/${symbolLower}@depth20@100ms`;
    
    try {
      const ws = new WebSocket(streamUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { stream, data } = message;

          if (stream?.includes('@kline')) {
            const k = data.k;
            const kline: KlineData = {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            };

            setKlines(prev => {
              const newKlines = [...prev];
              const lastIndex = newKlines.findIndex(item => item.time === kline.time);
              
              if (lastIndex >= 0) {
                newKlines[lastIndex] = kline;
              } else {
                newKlines.push(kline);
                if (newKlines.length > 200) {
                  newKlines.shift();
                }
              }
              return newKlines;
            });
          } else if (stream?.includes('@depth')) {
            const bids: [number, number][] = data.bids.map((b: string[]) => [parseFloat(b[0]), parseFloat(b[1])]);
            const asks: [number, number][] = data.asks.map((a: string[]) => [parseFloat(a[0]), parseFloat(a[1])]);
            
            setOrderBook({
              bids: bids.slice(0, 15),
              asks: asks.slice(0, 15),
              lastUpdateId: data.lastUpdateId,
            });
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        // Limited reconnection attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 3000 * reconnectAttemptsRef.current);
        } else {
          // Use mock data when WebSocket fails
          console.log('WebSocket unavailable, using simulated data');
          useMockData();
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      useMockData();
    }
  }, [symbol, timeframe]);

  const useMockData = useCallback(() => {
    const basePrice = currentPrice || getDefaultPrice(symbol);
    const intervalSeconds = getIntervalSeconds();
    
    // Generate initial mock data
    setKlines(generateMockKlines(basePrice, intervalSeconds));
    setOrderBook(generateMockOrderBook(basePrice));
    setIsConnected(true);
    
    // Update mock data periodically
    const updateInterval = setInterval(() => {
      setOrderBook(prev => {
        const midPrice = prev.bids[0]?.[0] || basePrice;
        return generateMockOrderBook(midPrice);
      });
      
      // Add new candle occasionally
      setKlines(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const volatility = 0.001;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const newClose = last.close * (1 + volatility * direction);
        
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          high: Math.max(last.high, newClose),
          low: Math.min(last.low, newClose),
          close: newClose,
          volume: last.volume + Math.random() * 10,
        };
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, [symbol, currentPrice, getIntervalSeconds]);

  const getDefaultPrice = (sym: MarketSymbol): number => {
    const defaults: Record<MarketSymbol, number> = {
      'BTCUSDT': 68000,
      'ETHUSDT': 2020,
      'SOLUSDT': 83,
      'BNBUSDT': 618,
      'XRPUSDT': 1.38,
      'DOGEUSDT': 0.093,
      'SUIUSDT': 0.93,
    };
    return defaults[sym] ?? 100;
  };

  // Fetch historical klines on mount/change
  const fetchHistoricalKlines = useCallback(async () => {
    try {
      const interval = TIMEFRAME_MAP[timeframe];
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=100`
      );
      
      if (!response.ok) throw new Error('API error');
      
      const data = await response.json();
      
      const historicalKlines: KlineData[] = data.map((k: any[]) => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
      }));
      
      setKlines(historicalKlines);
    } catch (error) {
      console.log('Using mock kline data');
      const basePrice = currentPrice || getDefaultPrice(symbol);
      setKlines(generateMockKlines(basePrice, getIntervalSeconds()));
    }
  }, [symbol, timeframe, currentPrice, getIntervalSeconds]);

  useEffect(() => {
    fetchHistoricalKlines();
    connect();
    
    // Generate initial order book
    const basePrice = currentPrice || getDefaultPrice(symbol);
    setOrderBook(generateMockOrderBook(basePrice));

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, fetchHistoricalKlines, symbol, currentPrice]);

  // Update order book mock data when price changes
  useEffect(() => {
    if (currentPrice && !isConnected) {
      setOrderBook(generateMockOrderBook(currentPrice));
    }
  }, [currentPrice, isConnected]);

  return { klines, orderBook, isConnected };
}
