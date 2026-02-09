import { useState } from 'react';
import { Navbar } from '@/components/arken/Navbar';
import { AuthModal } from '@/components/arken/AuthModal';
import { AccountHub } from '@/components/arken/AccountHub';
import { TradeTab } from '@/components/arken/TradeTab';
import { Footer } from '@/components/arken/Footer';
import { useTradingStore } from '@/hooks/useTradingStore';
import { usePriceData } from '@/hooks/usePriceData';
import { toast } from '@/hooks/use-toast';
import { MARKET_SYMBOLS, MARKET_DISPLAY_NAMES } from '@/types/trading';
import type { MarketSymbol, OrderSide, OrderType } from '@/types/trading';
import arkenxLogo from '@/assets/arkenx-logo.jpg';

export default function Trade() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountHub, setShowAccountHub] = useState(false);

  const {
    mode,
    balance,
    positions,
    tradeHistory,
    limitOrders,
    marginMode,
    currentUser,
    isLoaded,
    setMarginMode,
    openPosition,
    closePosition,
    signUp,
    login,
    logout,
    deposit,
    withdraw,
    placeLimitOrder,
    cancelLimitOrder,
    exportTradesCSV,
  } = useTradingStore();

  const { prices, isLoading: isLoadingPrices } = usePriceData(MARKET_SYMBOLS);

  const handlePlaceOrder = (order: {
    symbol: MarketSymbol;
    side: OrderSide;
    type: OrderType;
    size: number;
    price: number;
    leverage: number;
    takeProfit?: number;
    stopLoss?: number;
  }) => {
    const margin = order.size / order.leverage;
    
    if (order.type === 'limit') {
      placeLimitOrder({
        symbol: order.symbol,
        side: order.side,
        type: 'limit',
        price: order.price,
        size: order.size,
        leverage: order.leverage,
        marginMode,
        takeProfit: order.takeProfit,
        stopLoss: order.stopLoss,
      });

      toast({
        title: "Limit Order Placed",
        description: `${order.side.toUpperCase()} ${MARKET_DISPLAY_NAMES[order.symbol]} @ $${order.price.toLocaleString()}`,
      });
    } else {
      openPosition({
        symbol: order.symbol,
        side: order.side,
        entryPrice: order.price,
        size: order.size,
        leverage: order.leverage,
        timestamp: Date.now(),
        margin,
        marginMode,
        takeProfit: order.takeProfit,
        stopLoss: order.stopLoss,
      });

      toast({
        title: "Position Opened",
        description: `${order.side.toUpperCase()} ${MARKET_DISPLAY_NAMES[order.symbol]} @ $${order.price.toLocaleString()} with ${order.leverage}x leverage`,
      });
    }
  };

  const handleClosePosition = (positionId: string, currentPrice: number) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;

    closePosition(positionId, currentPrice);

    toast({
      title: "Position Closed",
      description: `Closed ${MARKET_DISPLAY_NAMES[position.symbol]} position`,
    });
  };

  const handleConnectClick = () => {
    if (currentUser) {
      setShowAccountHub(true);
    } else {
      setShowAuthModal(true);
    }
  };

  const isConnected = mode !== null;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={arkenxLogo} alt="ARKENX" className="h-12 w-auto mx-auto mb-6 opacity-50" />
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        mode={mode}
        balance={balance}
        currentUser={currentUser}
        onConnectClick={handleConnectClick}
        onDisconnect={logout}
        onAccountClick={() => setShowAccountHub(true)}
      />

      <main className="pt-14 pb-4 px-2 md:px-3 max-w-[1920px] mx-auto">
        <TradeTab
          prices={prices}
          isLoadingPrices={isLoadingPrices}
          positions={positions}
          limitOrders={limitOrders}
          tradeHistory={tradeHistory}
          balance={balance}
          isConnected={isConnected}
          marginMode={marginMode}
          onPlaceOrder={handlePlaceOrder}
          onClosePosition={handleClosePosition}
          onCancelOrder={cancelLimitOrder}
          onConnectClick={handleConnectClick}
          onMarginModeChange={setMarginMode}
          onExportCSV={exportTradesCSV}
        />
      </main>

      <Footer />

      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        onSignUp={signUp}
        onLogin={login}
      />

      <AccountHub
        open={showAccountHub}
        onOpenChange={setShowAccountHub}
        user={currentUser}
        balance={balance}
        onDeposit={deposit}
        onWithdraw={withdraw}
      />
    </div>
  );
}
