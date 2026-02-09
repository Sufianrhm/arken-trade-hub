import { useState } from 'react';
import { Navbar } from '@/components/arken/Navbar';
import { AuthModal } from '@/components/arken/AuthModal';
import { AccountHub } from '@/components/arken/AccountHub';
import { PortfolioTab } from '@/components/arken/PortfolioTab';
import { Footer } from '@/components/arken/Footer';
import { useTradingStore } from '@/hooks/useTradingStore';
import { usePriceData } from '@/hooks/usePriceData';
import { toast } from '@/hooks/use-toast';
import { MARKET_SYMBOLS, MARKET_DISPLAY_NAMES } from '@/types/trading';
import arkenxLogo from '@/assets/arkenx-logo.jpg';

export default function Portfolio() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountHub, setShowAccountHub] = useState(false);

  const {
    mode,
    balance,
    positions,
    tradeHistory,
    currentUser,
    isLoaded,
    closePosition,
    signUp,
    login,
    logout,
    deposit,
    withdraw,
  } = useTradingStore();

  const { prices } = usePriceData(MARKET_SYMBOLS);

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

      <main className="pt-16 pb-6 px-4 md:px-6 max-w-7xl mx-auto">
        <PortfolioTab
          balance={balance}
          positions={positions}
          tradeHistory={tradeHistory}
          prices={prices}
          isConnected={isConnected}
          onClosePosition={handleClosePosition}
          onConnectClick={handleConnectClick}
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
