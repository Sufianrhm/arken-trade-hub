import { useState } from 'react';
import { MarketSelector } from './MarketSelector';
import { PriceDisplay } from './PriceDisplay';
import { ChartPanel, type Timeframe } from './ChartPanel';
import { OrderPanel } from './OrderPanel';
import { OrderBook } from './OrderBook';
import { RecentTrades } from './RecentTrades';
import { FundingRate } from './FundingRate';
import { MarketStats } from './MarketStats';
import { TradingTabs } from './TradingTabs';
import { useBinanceWebSocket } from '@/hooks/useBinanceWebSocket';
import type { MarketSymbol, PriceData, Position, LimitOrder, Trade, OrderSide, OrderType, MarginMode } from '@/types/trading';
import { MARKET_DISPLAY_NAMES } from '@/types/trading';

interface TradeTabProps {
  prices: Record<MarketSymbol, PriceData>;
  isLoadingPrices: boolean;
  positions: Position[];
  limitOrders: LimitOrder[];
  tradeHistory: Trade[];
  balance: number;
  isConnected: boolean;
  marginMode: MarginMode;
  onPlaceOrder: (order: {
    symbol: MarketSymbol;
    side: OrderSide;
    type: OrderType;
    size: number;
    price: number;
    leverage: number;
    takeProfit?: number;
    stopLoss?: number;
  }) => void;
  onClosePosition: (positionId: string, currentPrice: number) => void;
  onCancelOrder: (orderId: string) => void;
  onConnectClick: () => void;
  onMarginModeChange: (mode: MarginMode) => void;
  onExportCSV: () => string;
}

export function TradeTab({
  prices,
  isLoadingPrices,
  positions,
  limitOrders,
  tradeHistory,
  balance,
  isConnected,
  marginMode,
  onPlaceOrder,
  onClosePosition,
  onCancelOrder,
  onConnectClick,
  onMarginModeChange,
  onExportCSV,
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
        <MarketSelector value={selectedMarket} onChange={setSelectedMarket} prices={prices} />
        <PriceDisplay data={currentPriceData} isLoading={isLoadingPrices} />
      </div>

      {/* Market Stats */}
      <MarketStats data={currentPriceData} isLoading={isLoadingPrices} />

      {/* Funding Rate + Mark/Index Price */}
      <FundingRate symbol={selectedMarket} currentPrice={currentPrice} />

      {/* Main Trading Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Order Book - Left Side */}
        <div className="lg:col-span-2 hidden lg:block h-[400px]">
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
            marginMode={marginMode}
            onPlaceOrder={onPlaceOrder}
            onConnectClick={onConnectClick}
            onMarginModeChange={onMarginModeChange}
          />
        </div>
      </div>

      {/* Mobile Order Book + Recent Trades */}
      <div className="lg:hidden grid grid-cols-2 gap-3 h-[280px]">
        <OrderBook data={orderBook} currentPrice={currentPrice} />
        <RecentTrades symbol={selectedMarket} currentPrice={currentPrice} />
      </div>

      {/* Desktop Recent Trades */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 h-[180px]">
        <div className="col-span-3">
          <RecentTrades symbol={selectedMarket} currentPrice={currentPrice} />
        </div>
        <div className="col-span-9">
          <TradingTabs
            positions={positions}
            limitOrders={limitOrders}
            tradeHistory={tradeHistory}
            prices={prices}
            onClosePosition={onClosePosition}
            onCancelOrder={onCancelOrder}
            onExportCSV={onExportCSV}
          />
        </div>
      </div>

      {/* Mobile Positions/Orders */}
      <div className="lg:hidden">
        <TradingTabs
          positions={positions}
          limitOrders={limitOrders}
          tradeHistory={tradeHistory}
          prices={prices}
          onClosePosition={onClosePosition}
          onCancelOrder={onCancelOrder}
          onExportCSV={onExportCSV}
        />
      </div>
    </div>
  );
}
