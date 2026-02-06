import { useState } from 'react';
import { MarketSelector } from './MarketSelector';
import { PriceDisplay } from './PriceDisplay';
import { ChartPanel, type Timeframe } from './ChartPanel';
import { OrderPanel } from './OrderPanel';
import { OrderBook } from './OrderBook';
import { PositionsTable } from './PositionsTable';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import type { MarketSymbol, PriceData, Position, OrderSide, OrderType } from '@/types/trading';
import { MARKET_DISPLAY_NAMES } from '@/types/trading';

interface TradeTabProps {
  prices: Record<MarketSymbol, PriceData>;
  isLoadingPrices: boolean;
  positions: Position[];
  balance: number;
  isConnected: boolean;
  onPlaceOrder: (order: {
    symbol: MarketSymbol;
    side: OrderSide;
    type: OrderType;
    size: number;
    price: number;
    leverage: number;
  }) => void;
  onClosePosition: (positionId: string, currentPrice: number) => void;
  onConnectClick: () => void;
}

export function TradeTab({
  prices,
  isLoadingPrices,
  positions,
  balance,
  isConnected,
  onPlaceOrder,
  onClosePosition,
  onConnectClick,
}: TradeTabProps) {
  const [selectedMarket, setSelectedMarket] = useState<MarketSymbol>('BTCUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');

  const currentPriceData = prices[selectedMarket];
  const currentPrice = currentPriceData?.price ?? 0;

  const { klines, orderBook, isConnected: wsConnected } = useBinanceWebSocket(selectedMarket, timeframe, currentPrice);

  return (
    <div className="space-y-3">
      {/* Market Header */}
      <div className="glass-panel p-3 flex flex-col md:flex-row md:items-center gap-3">
        <MarketSelector value={selectedMarket} onChange={setSelectedMarket} />
        <PriceDisplay data={currentPriceData} isLoading={isLoadingPrices} />
      </div>

      {/* Main Trading Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Order Book - Left Side */}
        <div className="lg:col-span-2 hidden lg:block h-[420px]">
          <OrderBook data={orderBook} currentPrice={currentPrice} />
        </div>

        {/* Chart - Center */}
        <div className="lg:col-span-7">
          <ChartPanel 
            data={currentPriceData} 
            symbol={MARKET_DISPLAY_NAMES[selectedMarket]}
            klines={klines}
            isWebSocketConnected={wsConnected}
            onTimeframeChange={setTimeframe}
            selectedTimeframe={timeframe}
          />
        </div>

        {/* Order Panel - Right Side */}
        <div className="lg:col-span-3">
          <OrderPanel
            symbol={selectedMarket}
            currentPrice={currentPrice}
            balance={balance}
            isConnected={isConnected}
            onPlaceOrder={onPlaceOrder}
            onConnectClick={onConnectClick}
          />
        </div>
      </div>

      {/* Mobile Order Book */}
      <div className="lg:hidden h-[300px]">
        <OrderBook data={orderBook} currentPrice={currentPrice} />
      </div>

      {/* Open Positions */}
      {positions.length > 0 && (
        <PositionsTable
          positions={positions}
          prices={prices}
          onClosePosition={onClosePosition}
          compact
        />
      )}
    </div>
  );
}
