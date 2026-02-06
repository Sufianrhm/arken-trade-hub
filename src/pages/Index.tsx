import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/arken/Navbar';
import { ConnectWalletModal } from '@/components/arken/ConnectWalletModal';
import { WaitlistModal } from '@/components/arken/WaitlistModal';
import { TradeTab } from '@/components/arken/TradeTab';
import { PortfolioTab } from '@/components/arken/PortfolioTab';
import { AIIntelligenceTab } from '@/components/arken/AIIntelligenceTab';
import { Footer } from '@/components/arken/Footer';
import { useTradingStore } from '@/hooks/useTradingStore';
import { usePriceData } from '@/hooks/usePriceData';
import { toast } from '@/hooks/use-toast';
import { MARKET_SYMBOLS, MARKET_DISPLAY_NAMES } from '@/types/trading';
import type { MarketSymbol, OrderSide, OrderType } from '@/types/trading';
import { LineChart, Wallet, Brain } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('trade');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  const {
    mode,
    balance,
    positions,
    tradeHistory,
    isLoaded,
    setMode,
    disconnect,
    openPosition,
    closePosition,
    addToWaitlist,
  } = useTradingStore();

  const { prices, isLoading: isLoadingPrices, getPriceMap } = usePriceData(MARKET_SYMBOLS);

  const handlePaperTrading = () => {
    setMode('paper');
    toast({
      title: "Paper Trading Activated",
      description: "You're now trading with $10,000 virtual USDC. Good luck!",
    });
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Disconnected",
      description: "Your session has been disconnected.",
    });
  };

  const handlePlaceOrder = (order: {
    symbol: MarketSymbol;
    side: OrderSide;
    type: OrderType;
    size: number;
    price: number;
    leverage: number;
  }) => {
    const margin = order.size / order.leverage;
    
    openPosition({
      symbol: order.symbol,
      side: order.side,
      entryPrice: order.price,
      size: order.size,
      leverage: order.leverage,
      timestamp: Date.now(),
      margin,
    });

    toast({
      title: "Position Opened",
      description: `${order.side.toUpperCase()} ${MARKET_DISPLAY_NAMES[order.symbol]} @ $${order.price.toLocaleString()} with ${order.leverage}x leverage`,
    });
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

  const handleWaitlistSubmit = (data: { name: string; email: string; telegram: string }) => {
    addToWaitlist(data);
    toast({
      title: "You're on the list! 🎉",
      description: "We'll notify you when live trading launches.",
    });
  };

  const isConnected = mode !== null;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Arken...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        mode={mode}
        balance={balance}
        onConnectClick={() => setShowConnectModal(true)}
        onDisconnect={handleDisconnect}
      />

      <main className="pt-16 pb-6 px-3 md:px-4 max-w-[1600px] mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full max-w-md mx-auto glass-panel bg-muted/50 p-1">
            <TabsTrigger 
              value="trade" 
              className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <LineChart className="w-4 h-4" />
              <span className="hidden sm:inline">Trade</span>
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio" 
              className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-2"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Intelligence</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="animate-fade-in">
            <TradeTab
              prices={prices}
              isLoadingPrices={isLoadingPrices}
              positions={positions}
              balance={balance}
              isConnected={isConnected}
              onPlaceOrder={handlePlaceOrder}
              onClosePosition={handleClosePosition}
              onConnectClick={() => setShowConnectModal(true)}
            />
          </TabsContent>

          <TabsContent value="portfolio" className="animate-fade-in">
            <PortfolioTab
              balance={balance}
              positions={positions}
              tradeHistory={tradeHistory}
              prices={prices}
              isConnected={isConnected}
              onClosePosition={handleClosePosition}
              onConnectClick={() => setShowConnectModal(true)}
            />
          </TabsContent>

          <TabsContent value="ai" className="animate-fade-in">
            <AIIntelligenceTab
              prices={prices}
              isConnected={isConnected}
              onConnectClick={() => setShowConnectModal(true)}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      <ConnectWalletModal
        open={showConnectModal}
        onOpenChange={setShowConnectModal}
        onPaperTrading={handlePaperTrading}
        onJoinWaitlist={() => setShowWaitlistModal(true)}
      />

      <WaitlistModal
        open={showWaitlistModal}
        onOpenChange={setShowWaitlistModal}
        onSubmit={handleWaitlistSubmit}
      />
    </div>
  );
};

export default Index;
