import { useEffect, useRef, memo } from 'react';
import { createChart, ColorType, CrosshairMode, LineStyle, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData, type Time } from 'lightweight-charts';
import type { PriceData } from '@/types/trading';

interface ChartPanelProps {
  data: PriceData | undefined;
  symbol: string;
}

// Generate mock candlestick data based on current price
const generateCandlestickData = (basePrice: number, count: number = 100): CandlestickData<Time>[] => {
  const data: CandlestickData<Time>[] = [];
  const now = Math.floor(Date.now() / 1000);
  const interval = 300; // 5 minutes
  
  let currentPrice = basePrice * (0.95 + Math.random() * 0.1);
  
  for (let i = count; i >= 0; i--) {
    const time = (now - i * interval) as Time;
    const volatility = 0.002 + Math.random() * 0.003;
    const direction = Math.random() > 0.48 ? 1 : -1;
    
    const open = currentPrice;
    const change = currentPrice * volatility * direction;
    const close = currentPrice + change;
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    
    data.push({ time, open, high, low, close });
    currentPrice = close;
  }
  
  return data;
};

export const ChartPanel = memo(function ChartPanel({ data, symbol }: ChartPanelProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lastPriceRef = useRef<number>(0);

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'hsl(0 0% 60%)',
        fontFamily: "'Inter', system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: 'hsl(0 0% 15% / 0.5)', style: LineStyle.Dotted },
        horzLines: { color: 'hsl(0 0% 15% / 0.5)', style: LineStyle.Dotted },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'hsl(187 100% 50% / 0.3)',
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: 'hsl(187 100% 50%)',
        },
        horzLine: {
          color: 'hsl(187 100% 50% / 0.3)',
          width: 1,
          style: LineStyle.Solid,
          labelBackgroundColor: 'hsl(187 100% 50%)',
        },
      },
      rightPriceScale: {
        borderColor: 'hsl(0 0% 15%)',
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: 'hsl(0 0% 15%)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'hsl(142 70% 45%)',
      downColor: 'hsl(0 70% 50%)',
      borderUpColor: 'hsl(142 70% 45%)',
      borderDownColor: 'hsl(0 70% 50%)',
      wickUpColor: 'hsl(142 70% 45%)',
      wickDownColor: 'hsl(0 70% 50%)',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Update data when price changes
  useEffect(() => {
    if (!seriesRef.current || !data?.price) return;
    
    // Only regenerate if price changed significantly or first load
    if (Math.abs(data.price - lastPriceRef.current) / data.price > 0.001 || lastPriceRef.current === 0) {
      const candleData = generateCandlestickData(data.price);
      seriesRef.current.setData(candleData);
      chartRef.current?.timeScale().fitContent();
      lastPriceRef.current = data.price;
    } else {
      // Just update the last candle
      const now = Math.floor(Date.now() / 1000) as Time;
      const lastCandle = {
        time: now,
        open: lastPriceRef.current,
        high: Math.max(lastPriceRef.current, data.price) * 1.0001,
        low: Math.min(lastPriceRef.current, data.price) * 0.9999,
        close: data.price,
      };
      seriesRef.current.update(lastCandle);
    }
  }, [data?.price]);

  return (
    <div className="glass-panel p-4 md:p-6 h-[300px] md:h-[400px] flex flex-col">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <h3 className="font-semibold text-foreground">{symbol}</h3>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            Perpetual
          </span>
        </div>
        {data && (
          <div className="text-right">
            <p className="text-xl font-bold text-foreground tabular-nums">
              ${formatPrice(data.price)}
            </p>
            <p className={`text-sm tabular-nums ${data.changePercent24h >= 0 ? 'text-success' : 'text-destructive'}`}>
              {data.changePercent24h >= 0 ? '+' : ''}{data.changePercent24h.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      {/* TradingView Chart */}
      <div 
        ref={chartContainerRef} 
        className="flex-1 rounded-xl overflow-hidden bg-background/50"
      />
    </div>
  );
});
