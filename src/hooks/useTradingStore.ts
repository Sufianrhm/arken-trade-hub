import { useState, useEffect, useCallback } from 'react';
import type { 
  TradingState, Position, Trade, WaitlistEntry, TradingMode, 
  UserAccount, LimitOrder, MarginMode, MarketSymbol 
} from '@/types/trading';

const STORAGE_KEY = 'arken_trading_state';
const USERS_KEY = 'arken_users';
const INITIAL_BALANCE = 10000;

const generateAccountId = (): string => {
  return Math.random().toString().slice(2, 12).padEnd(10, '0');
};

const generateReferralCode = (): string => {
  return 'ARK' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const hashPassword = (password: string): string => {
  // Simple hash for demo - in production use bcrypt or similar
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

const getInitialState = (): TradingState => ({
  mode: null,
  balance: 0,
  positions: [],
  limitOrders: [],
  tradeHistory: [],
  waitlist: [],
  currentUser: null,
  marginMode: 'cross',
});

const calculateLiquidationPrice = (
  entryPrice: number,
  side: 'long' | 'short',
  leverage: number,
  marginMode: MarginMode,
): number => {
  const maintenanceMargin = 0.005; // 0.5%
  if (side === 'long') {
    return entryPrice * (1 - (1 / leverage) + maintenanceMargin);
  } else {
    return entryPrice * (1 + (1 / leverage) - maintenanceMargin);
  }
};

export function useTradingStore() {
  const [state, setState] = useState<TradingState>(getInitialState);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TradingState;
        setState(parsed);
      }
      const storedUsers = localStorage.getItem(USERS_KEY);
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    } catch (error) {
      console.error('Failed to load trading state:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save trading state:', error);
      }
    }
  }, [state, isLoaded]);

  useEffect(() => {
    if (isLoaded && users.length > 0) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [users, isLoaded]);

  const signUp = useCallback((username: string, password: string, referralCode?: string): UserAccount | null => {
    // Check if username exists
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      return null;
    }

    const newUser: UserAccount = {
      id: `user_${Date.now()}`,
      username,
      passwordHash: hashPassword(password),
      paperAccountId: generateAccountId(),
      balance: INITIAL_BALANCE,
      initialBalance: INITIAL_BALANCE,
      createdAt: Date.now(),
      referralCode: generateReferralCode(),
      referredBy: referralCode,
      totalPnl: 0,
      tradesCount: 0,
      winRate: 0,
    };

    setUsers(prev => [...prev, newUser]);
    setState(prev => ({
      ...prev,
      mode: 'paper',
      balance: INITIAL_BALANCE,
      currentUser: newUser,
    }));

    return newUser;
  }, [users]);

  const login = useCallback((username: string, password: string): UserAccount | null => {
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && 
           u.passwordHash === hashPassword(password)
    );
    
    if (user) {
      setState(prev => ({
        ...prev,
        mode: 'paper',
        balance: user.balance,
        currentUser: user,
      }));
      return user;
    }
    return null;
  }, [users]);

  const logout = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: null,
      currentUser: null,
    }));
  }, []);

  const setMode = useCallback((mode: TradingMode) => {
    setState(prev => ({
      ...prev,
      mode,
      balance: mode === 'paper' && !prev.currentUser ? INITIAL_BALANCE : prev.balance,
    }));
  }, []);

  const setMarginMode = useCallback((marginMode: MarginMode) => {
    setState(prev => ({ ...prev, marginMode }));
  }, []);

  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: null,
    }));
  }, []);

  const deposit = useCallback((amount: number) => {
    setState(prev => {
      const newBalance = prev.balance + amount;
      if (prev.currentUser) {
        const updatedUser = { ...prev.currentUser, balance: newBalance };
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        ));
        return { ...prev, balance: newBalance, currentUser: updatedUser };
      }
      return { ...prev, balance: newBalance };
    });
  }, []);

  const withdraw = useCallback((amount: number): boolean => {
    if (state.balance < amount) return false;
    
    setState(prev => {
      const newBalance = prev.balance - amount;
      if (prev.currentUser) {
        const updatedUser = { ...prev.currentUser, balance: newBalance };
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        ));
        return { ...prev, balance: newBalance, currentUser: updatedUser };
      }
      return { ...prev, balance: newBalance };
    });
    return true;
  }, [state.balance]);

  const openPosition = useCallback((position: Omit<Position, 'id' | 'liquidationPrice'>) => {
    const liquidationPrice = calculateLiquidationPrice(
      position.entryPrice,
      position.side,
      position.leverage,
      position.marginMode
    );

    const newPosition: Position = {
      ...position,
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      liquidationPrice,
    };

    setState(prev => ({
      ...prev,
      balance: prev.balance - position.margin,
      positions: [...prev.positions, newPosition],
    }));

    return newPosition;
  }, []);

  const placeLimitOrder = useCallback((order: Omit<LimitOrder, 'id' | 'timestamp'>) => {
    const newOrder: LimitOrder = {
      ...order,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    const margin = order.size / order.leverage;

    setState(prev => ({
      ...prev,
      balance: prev.balance - margin,
      limitOrders: [...prev.limitOrders, newOrder],
    }));

    return newOrder;
  }, []);

  const cancelLimitOrder = useCallback((orderId: string) => {
    setState(prev => {
      const order = prev.limitOrders.find(o => o.id === orderId);
      if (!order) return prev;
      
      const margin = order.size / order.leverage;
      return {
        ...prev,
        balance: prev.balance + margin,
        limitOrders: prev.limitOrders.filter(o => o.id !== orderId),
      };
    });
  }, []);

  const closePosition = useCallback((positionId: string, exitPrice: number) => {
    setState(prev => {
      const position = prev.positions.find(p => p.id === positionId);
      if (!position) return prev;

      const priceDiff = exitPrice - position.entryPrice;
      const direction = position.side === 'long' ? 1 : -1;
      const pnl = (priceDiff / position.entryPrice) * position.size * position.leverage * direction;
      const pnlPercent = (pnl / position.margin) * 100;

      const trade: Trade = {
        id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: position.symbol,
        side: position.side,
        entryPrice: position.entryPrice,
        exitPrice,
        size: position.size,
        leverage: position.leverage,
        pnl,
        pnlPercent,
        openedAt: position.timestamp,
        closedAt: Date.now(),
      };

      const newBalance = prev.balance + position.margin + pnl;
      
      // Update user stats
      if (prev.currentUser) {
        const newTradesCount = prev.currentUser.tradesCount + 1;
        const newTotalPnl = prev.currentUser.totalPnl + pnl;
        const wins = Math.round(prev.currentUser.winRate * prev.currentUser.tradesCount / 100) + (pnl > 0 ? 1 : 0);
        const newWinRate = (wins / newTradesCount) * 100;
        
        const updatedUser = {
          ...prev.currentUser,
          balance: newBalance,
          totalPnl: newTotalPnl,
          tradesCount: newTradesCount,
          winRate: newWinRate,
        };
        
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === updatedUser.id ? updatedUser : u
        ));
        
        return {
          ...prev,
          balance: newBalance,
          positions: prev.positions.filter(p => p.id !== positionId),
          tradeHistory: [trade, ...prev.tradeHistory].slice(0, 100),
          currentUser: updatedUser,
        };
      }

      return {
        ...prev,
        balance: newBalance,
        positions: prev.positions.filter(p => p.id !== positionId),
        tradeHistory: [trade, ...prev.tradeHistory].slice(0, 100),
      };
    });
  }, []);

  const addToWaitlist = useCallback((entry: Omit<WaitlistEntry, 'id' | 'timestamp'>) => {
    const newEntry: WaitlistEntry = {
      ...entry,
      id: `waitlist_${Date.now()}`,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      waitlist: [...prev.waitlist, newEntry],
    }));

    return newEntry;
  }, []);

  const calculateUnrealizedPnL = useCallback((positions: Position[], prices: Record<string, number>): number => {
    return positions.reduce((total, position) => {
      const currentPrice = prices[position.symbol];
      if (!currentPrice) return total;

      const priceDiff = currentPrice - position.entryPrice;
      const direction = position.side === 'long' ? 1 : -1;
      const pnl = (priceDiff / position.entryPrice) * position.size * position.leverage * direction;
      return total + pnl;
    }, 0);
  }, []);

  const getLeaderboard = useCallback((): UserAccount[] => {
    return [...users]
      .map((user, _, arr) => ({
        ...user,
        rank: arr.filter(u => u.totalPnl > user.totalPnl).length + 1,
        badge: getBadge(user.totalPnl),
      }))
      .sort((a, b) => b.totalPnl - a.totalPnl)
      .slice(0, 50);
  }, [users]);

  const getBadge = (pnl: number): UserAccount['badge'] => {
    if (pnl >= 100000) return 'diamond';
    if (pnl >= 50000) return 'platinum';
    if (pnl >= 20000) return 'gold';
    if (pnl >= 5000) return 'silver';
    if (pnl >= 1000) return 'bronze';
    return undefined;
  };

  const exportTradesCSV = useCallback((): string => {
    const headers = ['Date', 'Symbol', 'Side', 'Entry', 'Exit', 'Size', 'Leverage', 'PnL', 'PnL%'];
    const rows = state.tradeHistory.map(t => [
      new Date(t.closedAt).toISOString(),
      t.symbol,
      t.side,
      t.entryPrice.toFixed(2),
      t.exitPrice.toFixed(2),
      t.size.toFixed(2),
      t.leverage.toString(),
      t.pnl.toFixed(2),
      t.pnlPercent.toFixed(2),
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }, [state.tradeHistory]);

  return {
    ...state,
    isLoaded,
    setMode,
    setMarginMode,
    disconnect,
    signUp,
    login,
    logout,
    deposit,
    withdraw,
    openPosition,
    placeLimitOrder,
    cancelLimitOrder,
    closePosition,
    addToWaitlist,
    calculateUnrealizedPnL,
    getLeaderboard,
    exportTradesCSV,
  };
}
