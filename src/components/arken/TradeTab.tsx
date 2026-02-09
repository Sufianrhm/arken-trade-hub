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
    <div className="space-y-2">
      {/* Market Header Bar */}
      <div className="panel px-3 py-2 flex flex-col md:flex-row md:items-center gap-3">
        <MarketSelector value={selectedMarket} onChange={setSelectedMarket} prices={prices} />
        <div className="flex-1">
          <PriceDisplay data={currentPriceData} isLoading={isLoadingPrices} />
        </div>
        <MarketStats data={currentPriceData} isLoading={isLoadingPrices} />
      </div>

      {/* Main Trading Grid - Binance/Hyperliquid Style */}
      <div className="grid grid-cols-12 gap-2">
        {/* Left Column - Order Book */}
        <div className="col-span-12 lg:col-span-2 order-3 lg:order-1">
          <div className="h-[300px] lg:h-[520px]">
            <OrderBook data={orderBook} currentPrice={currentPrice} />
          </div>
        </div>

        {/* Center Column - Chart */}
        <div className="col-span-12 lg:col-span-7 order-1 lg:order-2">
          <ChartPanel 
            data={currentPriceData} 
            symbol={MARKET_DISPLAY_NAMES[selectedMarket]}
            klines={klines}
            isWebSocketConnected={wsConnected}
            onTimeframeChange={setTimeframe}
            selectedTimeframe={timeframe}
          />
          {/* Funding Rate below chart on desktop */}
          <div className="hidden lg:block mt-2">
            <FundingRate symbol={selectedMarket} currentPrice={currentPrice} />
          </div>
        </div>

        {/* Right Column - Order Panel */}
        <div className="col-span-12 lg:col-span-3 order-2 lg:order-3">
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

      {/* Mobile Funding Rate */}
      <div className="lg:hidden">
        <FundingRate symbol={selectedMarket} currentPrice={currentPrice} />
      </div>

      {/* Recent Trades Row */}
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 lg:col-span-3">
          <div className="h-[180px]">
            <RecentTrades symbol={selectedMarket} currentPrice={currentPrice} />
          </div>
        </div>
        
        {/* Positions/Orders/History Tabs */}
        <div className="col-span-12 lg:col-span-9">
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
    </div>
  );
}
