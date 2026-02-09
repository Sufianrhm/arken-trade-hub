import { useState } from 'react';
import { Navbar } from '@/components/arken/Navbar';
import { AuthModal } from '@/components/arken/AuthModal';
import { AccountHub } from '@/components/arken/AccountHub';
import { Leaderboard } from '@/components/arken/Leaderboard';
import { Footer } from '@/components/arken/Footer';
import { useTradingStore } from '@/hooks/useTradingStore';
import arkenxLogo from '@/assets/arkenx-logo.jpg';

export default function LeaderboardPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAccountHub, setShowAccountHub] = useState(false);

  const {
    mode,
    balance,
    currentUser,
    isLoaded,
    signUp,
    login,
    logout,
    deposit,
    withdraw,
    getLeaderboard,
  } = useTradingStore();

  const handleConnectClick = () => {
    if (currentUser) {
      setShowAccountHub(true);
    } else {
      setShowAuthModal(true);
    }
  };

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

      <main className="pt-16 pb-6 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="h-[calc(100vh-180px)] min-h-[500px]">
          <Leaderboard users={getLeaderboard()} currentUserId={currentUser?.id} />
        </div>
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
