import { useState, useEffect, useCallback } from 'react';
import type { TradingState, Position, Trade, WaitlistEntry, TradingMode } from '@/types/trading';

const STORAGE_KEY = 'arken_trading_state';
const INITIAL_BALANCE = 10000;

const getInitialState = (): TradingState => ({
  mode: null,
  balance: 0,
  positions: [],
  tradeHistory: [],
  waitlist: [],
});

export function useTradingStore() {
  const [state, setState] = useState<TradingState>(getInitialState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TradingState;
        setState(parsed);
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

  const setMode = useCallback((mode: TradingMode) => {
    setState(prev => ({
      ...prev,
      mode,
      balance: mode === 'paper' ? INITIAL_BALANCE : prev.balance,
    }));
  }, []);

  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: null,
    }));
  }, []);

  const openPosition = useCallback((position: Omit<Position, 'id'>) => {
    const newPosition: Position = {
      ...position,
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    setState(prev => ({
      ...prev,
      balance: prev.balance - position.margin,
      positions: [...prev.positions, newPosition],
    }));

    return newPosition;
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

      return {
        ...prev,
        balance: prev.balance + position.margin + pnl,
        positions: prev.positions.filter(p => p.id !== positionId),
        tradeHistory: [trade, ...prev.tradeHistory].slice(0, 50),
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

  return {
    ...state,
    isLoaded,
    setMode,
    disconnect,
    openPosition,
    closePosition,
    addToWaitlist,
    calculateUnrealizedPnL,
  };
}
