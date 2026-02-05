import { useState } from 'react';
import { MarketSelector } from './MarketSelector';
import { PriceDisplay } from './PriceDisplay';
import { ChartPanel } from './ChartPanel';
import { OrderPanel } from './OrderPanel';
import { PositionsTable } from './PositionsTable';
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

  const currentPriceData = prices[selectedMarket];
  const currentPrice = currentPriceData?.price ?? 0;

  return (
    <div className="space-y-4">
      {/* Market Header */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center gap-4">
        <MarketSelector value={selectedMarket} onChange={setSelectedMarket} />
        <PriceDisplay data={currentPriceData} isLoading={isLoadingPrices} />
      </div>

      {/* Main Trading Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <ChartPanel 
            data={currentPriceData} 
            symbol={MARKET_DISPLAY_NAMES[selectedMarket]} 
          />
        </div>

        {/* Order Panel */}
        <div className="lg:col-span-1">
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
