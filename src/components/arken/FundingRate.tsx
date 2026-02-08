import { useEffect, useState, useCallback } from 'react';
import type { MarketSymbol, FundingRate as FundingRateType } from '@/types/trading';

interface FundingRateProps {
  symbol: MarketSymbol;
  currentPrice: number;
}

export function FundingRate({ symbol, currentPrice }: FundingRateProps) {
  const [fundingData, setFundingData] = useState<FundingRateType | null>(null);
  const [countdown, setCountdown] = useState<string>('--:--:--');

  const generateMockFunding = useCallback((): FundingRateType => {
    const rate = (Math.random() - 0.5) * 0.0004;
    const now = Date.now();
    const hoursToNext = 8 - ((now / 3600000) % 8);
    const nextFundingTime = now + hoursToNext * 3600000;
    
    return {
      symbol,
      rate,
      nextFundingTime,
      markPrice: currentPrice * (1 + (Math.random() - 0.5) * 0.001),
      indexPrice: currentPrice * (1 + (Math.random() - 0.5) * 0.0005),
    };
  }, [symbol, currentPrice]);

  useEffect(() => {
    const fetchFunding = async () => {
      try {
        const response = await fetch(
          `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`
        );
        if (response.ok) {
          const data = await response.json();
          setFundingData({
            symbol,
            rate: parseFloat(data.lastFundingRate),
            nextFundingTime: data.nextFundingTime,
            markPrice: parseFloat(data.markPrice),
            indexPrice: parseFloat(data.indexPrice),
          });
        } else {
          setFundingData(generateMockFunding());
        }
      } catch {
        setFundingData(generateMockFunding());
      }
    };

    fetchFunding();
    const interval = setInterval(fetchFunding, 60000);

    return () => clearInterval(interval);
  }, [symbol, generateMockFunding]);

  useEffect(() => {
    if (!fundingData?.nextFundingTime) return;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = fundingData.nextFundingTime - now;
      
      if (diff <= 0) {
        setCountdown('00:00:00');
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [fundingData?.nextFundingTime]);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const fundingRate = fundingData?.rate ?? 0;
  const isPositive = fundingRate >= 0;

  return (
    <div className="panel p-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Funding Rate */}
        <div>
          <div className="text-label mb-1">FUNDING RATE</div>
          <div className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? '+' : ''}{(fundingRate * 100).toFixed(4)}%
          </div>
        </div>

        {/* Countdown */}
        <div>
          <div className="text-label mb-1">NEXT FUNDING</div>
          <div className="text-sm font-mono text-foreground tabular-nums">
            {countdown}
          </div>
        </div>

        {/* Mark Price */}
        <div>
          <div className="text-label mb-1">MARK PRICE</div>
          <div className="text-sm text-foreground tabular-nums">
            ${formatPrice(fundingData?.markPrice ?? currentPrice)}
          </div>
        </div>

        {/* Index Price */}
        <div>
          <div className="text-label mb-1">INDEX PRICE</div>
          <div className="text-sm text-foreground tabular-nums">
            ${formatPrice(fundingData?.indexPrice ?? currentPrice)}
          </div>
        </div>
      </div>
    </div>
  );
}
