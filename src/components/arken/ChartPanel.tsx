import { useEffect, useRef, memo, useState, useCallback } from 'react';
import { createChart, ColorType, CrosshairMode, LineStyle, CandlestickSeries, HistogramSeries, LineSeries, type IChartApi, type ISeriesApi, type CandlestickData, type HistogramData, type Time } from 'lightweight-charts';
import { Minus, TrendingUp, Trash2 } from 'lucide-react';
import type { PriceData } from '@/types/trading';
import type { KlineData } from '@/hooks/useBinanceWebSocket';

interface ChartPanelProps {
  data: PriceData | undefined;
  symbol: string;
  klines?: KlineData[];
  isWebSocketConnected?: boolean;
  onTimeframeChange?: (tf: Timeframe) => void;
  selectedTimeframe?: Timeframe;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1M', value: '1m' },
  { label: '5M', value: '5m' },
  { label: '15M', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
];

type DrawingTool = 'none' | 'horizontal' | 'trendline';

interface HorizontalLine {
  id: string;
  price: number;
  series: ISeriesApi<'Line'>;
}

export const ChartPanel = memo(function ChartPanel({ 
  data, 
  symbol, 
  klines = [], 
  isWebSocketConnected = false,
  onTimeframeChange,
  selectedTimeframe = '15m'
}: ChartPanelProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingTool>('none');
  const [horizontalLines, setHorizontalLines] = useState<HorizontalLine[]>([]);
  const horizontalLinesRef = useRef<HorizontalLine[]>([]);

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
        textColor: '#A1A6B3',
        fontFamily: "'Inter', system-ui, sans-serif",
      },
      grid: {
        vertLines: { color: 'rgba(26, 29, 34, 0.5)', style: LineStyle.Solid },
        horzLines: { color: 'rgba(26, 29, 34, 0.5)', style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: 'rgba(30, 107, 255, 0.4)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1E6BFF',
        },
        horzLine: {
          color: 'rgba(30, 107, 255, 0.4)',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1E6BFF',
        },
      },
      rightPriceScale: {
        borderColor: '#1A1D22',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: '#1A1D22',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
    });

    // Volume histogram
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
      upColor: '#00D18F',
      downColor: '#FF3B57',
      borderUpColor: '#00D18F',
      borderDownColor: '#FF3B57',
      wickUpColor: '#00D18F',
      wickDownColor: '#FF3B57',
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

  // Handle horizontal line click listener
  useEffect(() => {
    if (!chartRef.current) return;
    
    const handleChartClick = (param: any) => {
      if (activeTool === 'horizontal' && param.point && candleSeriesRef.current) {
        const price = candleSeriesRef.current.coordinateToPrice(param.point.y);
        if (price) {
          addHorizontalLine(price);
          setActiveTool('none');
        }
      }
    };

    chartRef.current.subscribeClick(handleChartClick);
    return () => {
      chartRef.current?.unsubscribeClick(handleChartClick);
    };
  }, [activeTool]);

  const addHorizontalLine = useCallback((price: number) => {
    if (!chartRef.current) return;
    
    const lineSeries = chartRef.current.addSeries(LineSeries, {
      color: '#1E6BFF',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: true,
      lastValueVisible: true,
      crosshairMarkerVisible: false,
    });

    const now = Math.floor(Date.now() / 1000);
    const startTime = (now - 86400 * 30) as Time;
    const endTime = (now + 86400 * 30) as Time;
    
    lineSeries.setData([
      { time: startTime, value: price },
      { time: endTime, value: price },
    ]);

    const newLine: HorizontalLine = {
      id: `line-${Date.now()}`,
      price,
      series: lineSeries,
    };

    horizontalLinesRef.current = [...horizontalLinesRef.current, newLine];
    setHorizontalLines([...horizontalLinesRef.current]);
  }, []);

  const clearAllLines = useCallback(() => {
    horizontalLinesRef.current.forEach(line => {
      if (chartRef.current) {
        chartRef.current.removeSeries(line.series);
      }
    });
    horizontalLinesRef.current = [];
    setHorizontalLines([]);
  }, []);

  // Update chart data from WebSocket klines
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || klines.length === 0) return;
    
    const candleData: CandlestickData<Time>[] = klines.map(k => ({
      time: k.time as Time,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }));

    const volumeData: HistogramData<Time>[] = klines.map(k => ({
      time: k.time as Time,
      value: k.volume,
      color: k.close >= k.open ? 'rgba(0, 209, 143, 0.3)' : 'rgba(255, 59, 87, 0.3)',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);
    
    if (klines.length === 100) {
      chartRef.current?.timeScale().fitContent();
    }
  }, [klines]);

  return (
    <div className="panel p-4 h-[300px] md:h-[420px] flex flex-col">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isWebSocketConnected ? 'bg-success' : 'bg-muted-foreground'}`} />
            <span className="text-sm font-medium text-foreground">{symbol}</span>
          </div>
          <span className="text-label px-1.5 py-0.5 bg-muted rounded">
            PERP
          </span>
        </div>
        {data && (
          <div className="text-right">
            <p className="text-lg font-semibold text-foreground tabular-nums">
              ${formatPrice(data.price)}
            </p>
            <p className={`text-xs tabular-nums ${data.changePercent24h >= 0 ? 'text-success' : 'text-destructive'}`}>
              {data.changePercent24h >= 0 ? '+' : ''}{data.changePercent24h.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-1">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange?.(tf.value)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors duration-75 ${
                selectedTimeframe === tf.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTool(activeTool === 'horizontal' ? 'none' : 'horizontal')}
            className={`p-1.5 rounded transition-colors duration-75 ${
              activeTool === 'horizontal'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Horizontal Line"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTool(activeTool === 'trendline' ? 'none' : 'trendline')}
            className={`p-1.5 rounded transition-colors duration-75 ${
              activeTool === 'trendline'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Trend Line"
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
          {horizontalLines.length > 0 && (
            <button
              onClick={clearAllLines}
              className="p-1.5 rounded text-destructive hover:bg-destructive/10 transition-colors duration-75"
              title="Clear All"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div 
        ref={chartContainerRef} 
        className={`flex-1 rounded overflow-hidden bg-background ${activeTool !== 'none' ? 'cursor-crosshair' : ''}`}
      />
    </div>
  );
});
