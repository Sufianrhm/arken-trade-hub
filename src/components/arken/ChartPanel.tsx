import { useEffect, useRef, memo, useState, useCallback } from 'react';
import { createChart, ColorType, CrosshairMode, LineStyle, CandlestickSeries, HistogramSeries, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type Time } from 'lightweight-charts';
import type { PriceData } from '@/types/trading';

interface ChartPanelProps {
  data: PriceData | undefined;
  symbol: string;
}

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

const TIMEFRAMES: { label: string; value: Timeframe; interval: number }[] = [
  { label: '1m', value: '1m', interval: 60 },
  { label: '5m', value: '5m', interval: 300 },
  { label: '15m', value: '15m', interval: 900 },
  { label: '1h', value: '1h', interval: 3600 },
  { label: '4h', value: '4h', interval: 14400 },
  { label: '1D', value: '1D', interval: 86400 },
];

// Generate mock candlestick data with volume
const generateChartData = (basePrice: number, interval: number, count: number = 100) => {
  const candles: CandlestickData<Time>[] = [];
  const volumes: HistogramData<Time>[] = [];
  const now = Math.floor(Date.now() / 1000);
  
  let currentPrice = basePrice * (0.92 + Math.random() * 0.08);
  
  for (let i = count; i >= 0; i--) {
    const time = (now - i * interval) as Time;
    const volatility = 0.002 + Math.random() * 0.004;
    const direction = Math.random() > 0.48 ? 1 : -1;
    
    const open = currentPrice;
    const change = currentPrice * volatility * direction;
    const close = currentPrice + change;
    const high = Math.max(open, close) * (1 + Math.random() * volatility);
    const low = Math.min(open, close) * (1 - Math.random() * volatility);
    
    candles.push({ time, open, high, low, close });
    
    // Volume with color based on candle direction
    const volume = (500 + Math.random() * 2000) * (basePrice / 50000);
    volumes.push({
      time,
      value: volume,
      color: close >= open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    });
    
    currentPrice = close;
  }
  
  return { candles, volumes };
};

export const ChartPanel = memo(function ChartPanel({ data, symbol }: ChartPanelProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const lastPriceRef = useRef<number>(0);
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const getInterval = useCallback(() => {
    return TIMEFRAMES.find(t => t.value === timeframe)?.interval ?? 900;
  }, [timeframe]);

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
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: 'hsl(0 0% 15%)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    // Volume histogram (added first so it's behind candles)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
      borderVisible: false,
    });

    // Candlestick series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: 'hsl(142 70% 45%)',
      downColor: 'hsl(0 70% 50%)',
      borderUpColor: 'hsl(142 70% 45%)',
      borderDownColor: 'hsl(0 70% 50%)',
      wickUpColor: 'hsl(142 70% 45%)',
      wickDownColor: 'hsl(0 70% 50%)',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

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
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Update data when price or timeframe changes
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || !data?.price) return;
    
    const interval = getInterval();
    const { candles, volumes } = generateChartData(data.price, interval);
    
    candleSeriesRef.current.setData(candles);
    volumeSeriesRef.current.setData(volumes);
    chartRef.current?.timeScale().fitContent();
    lastPriceRef.current = data.price;
  }, [data?.price, timeframe, getInterval]);

  return (
    <div className="glass-panel p-4 md:p-6 h-[300px] md:h-[400px] flex flex-col">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3">
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
            <p className="text-lg md:text-xl font-bold text-foreground tabular-nums">
              ${formatPrice(data.price)}
            </p>
            <p className={`text-sm tabular-nums ${data.changePercent24h >= 0 ? 'text-success' : 'text-destructive'}`}>
              {data.changePercent24h >= 0 ? '+' : ''}{data.changePercent24h.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1 scrollbar-hide">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              timeframe === tf.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* TradingView Chart */}
      <div 
        ref={chartContainerRef} 
        className="flex-1 rounded-xl overflow-hidden bg-background/50"
      />
    </div>
  );
});
