import { useState, useEffect, useCallback, useRef } from 'react';
import type { MarketSymbol, PriceData } from '@/types/trading';
import { DEFAULT_PRICES } from '@/types/trading';

const STATS_API = 'https://api.binance.com/api/v3/ticker/24hr';
const UPDATE_INTERVAL = 1500; // Fast refresh for live trading feel

export function usePriceData(symbols: MarketSymbol[]) {
  const [prices, setPrices] = useState<Record<MarketSymbol, PriceData>>(() => {
    // Initialize with default prices for instant display
    const initial: Partial<Record<MarketSymbol, PriceData>> = {};
    symbols.forEach(symbol => {
      initial[symbol] = {
        symbol,
        price: DEFAULT_PRICES[symbol] || 100,
        change24h: 0,
        changePercent24h: 0,
        volume24h: 0,
        high24h: DEFAULT_PRICES[symbol] || 100,
        low24h: DEFAULT_PRICES[symbol] || 100,
        lastUpdate: Date.now(),
      };
    });
    return initial as Record<MarketSymbol, PriceData>;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPricesRef = useRef<Record<MarketSymbol, PriceData>>({} as Record<MarketSymbol, PriceData>);

  const fetchPrices = useCallback(async () => {
    try {
      // Fetch all symbols in parallel batches of 5 to avoid rate limiting
      const batchSize = 5;
      const batches: MarketSymbol[][] = [];
      for (let i = 0; i < symbols.length; i += batchSize) {
        batches.push(symbols.slice(i, i + batchSize));
      }

      const allResults: { symbol: MarketSymbol; data: PriceData }[] = [];

      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map(async (symbol) => {
            try {
              const statsRes = await fetch(`${STATS_API}?symbol=${symbol}`);

              if (!statsRes.ok) {
                throw new Error(`API error for ${symbol}`);
              }

              const statsData = await statsRes.json();

              const data: PriceData = {
                symbol,
                price: parseFloat(statsData.lastPrice),
                change24h: parseFloat(statsData.priceChange),
                changePercent24h: parseFloat(statsData.priceChangePercent),
                volume24h: parseFloat(statsData.quoteVolume),
                high24h: parseFloat(statsData.highPrice),
                low24h: parseFloat(statsData.lowPrice),
                lastUpdate: Date.now(),
              };

              return { symbol, data };
            } catch (err) {
              // Return last known price on error, or default
              if (lastPricesRef.current[symbol]) {
                return { symbol, data: lastPricesRef.current[symbol] };
              }
              // Use default price as fallback
              return {
                symbol,
                data: {
                  symbol,
                  price: DEFAULT_PRICES[symbol] || 100,
                  change24h: 0,
                  changePercent24h: 0,
                  volume24h: 0,
                  high24h: DEFAULT_PRICES[symbol] || 100,
                  low24h: DEFAULT_PRICES[symbol] || 100,
                  lastUpdate: Date.now(),
                },
              };
            }
          })
        );
        allResults.push(...batchResults);
      }

      const newPrices = allResults.reduce((acc, { symbol, data }) => {
        acc[symbol] = data;
        return acc;
      }, {} as Record<MarketSymbol, PriceData>);

      lastPricesRef.current = newPrices;
      setPrices(newPrices);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch prices');
      // Keep showing last known prices
      if (Object.keys(lastPricesRef.current).length > 0) {
        setPrices(lastPricesRef.current);
      }
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const getPrice = useCallback((symbol: MarketSymbol): number => {
    return prices[symbol]?.price ?? DEFAULT_PRICES[symbol] ?? 0;
  }, [prices]);

  const getPriceMap = useCallback((): Record<string, number> => {
    return Object.entries(prices).reduce((acc, [symbol, data]) => {
      acc[symbol] = data.price;
      return acc;
    }, {} as Record<string, number>);
  }, [prices]);

  return {
    prices,
    isLoading,
    error,
    getPrice,
    getPriceMap,
    refetch: fetchPrices,
  };
}
