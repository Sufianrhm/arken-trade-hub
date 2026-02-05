import { useState, useEffect, useCallback, useRef } from 'react';
import type { MarketSymbol, PriceData } from '@/types/trading';

const PRICE_API = 'https://api.binance.com/api/v3/ticker/price';
const STATS_API = 'https://api.binance.com/api/v3/ticker/24hr';
const UPDATE_INTERVAL = 2000;

export function usePriceData(symbols: MarketSymbol[]) {
  const [prices, setPrices] = useState<Record<MarketSymbol, PriceData>>({} as Record<MarketSymbol, PriceData>);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPricesRef = useRef<Record<MarketSymbol, PriceData>>({} as Record<MarketSymbol, PriceData>);

  const fetchPrices = useCallback(async () => {
    try {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const [priceRes, statsRes] = await Promise.all([
              fetch(`${PRICE_API}?symbol=${symbol}`),
              fetch(`${STATS_API}?symbol=${symbol}`),
            ]);

            if (!priceRes.ok || !statsRes.ok) {
              throw new Error(`API error for ${symbol}`);
            }

            const priceData = await priceRes.json();
            const statsData = await statsRes.json();

            const data: PriceData = {
              symbol,
              price: parseFloat(priceData.price),
              change24h: parseFloat(statsData.priceChange),
              changePercent24h: parseFloat(statsData.priceChangePercent),
              volume24h: parseFloat(statsData.volume),
              high24h: parseFloat(statsData.highPrice),
              low24h: parseFloat(statsData.lowPrice),
              lastUpdate: Date.now(),
            };

            return { symbol, data };
          } catch (err) {
            // Return last known price on error
            if (lastPricesRef.current[symbol]) {
              return { symbol, data: lastPricesRef.current[symbol] };
            }
            throw err;
          }
        })
      );

      const newPrices = results.reduce((acc, { symbol, data }) => {
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
    return prices[symbol]?.price ?? 0;
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
