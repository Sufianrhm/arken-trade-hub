export type TradingMode = 'paper' | 'live' | null;

export type OrderSide = 'long' | 'short';

export type OrderType = 'market' | 'limit';

export type MarketSymbol = 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT';

export interface Position {
  id: string;
  symbol: MarketSymbol;
  side: OrderSide;
  entryPrice: number;
  size: number;
  leverage: number;
  timestamp: number;
  margin: number;
}

export interface Trade {
  id: string;
  symbol: MarketSymbol;
  side: OrderSide;
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  openedAt: number;
  closedAt: number;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  telegram: string;
  timestamp: number;
}

export interface TradingState {
  mode: TradingMode;
  balance: number;
  positions: Position[];
  tradeHistory: Trade[];
  waitlist: WaitlistEntry[];
}

export interface PriceData {
  symbol: MarketSymbol;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdate: number;
}

export interface AIPlan {
  entryZone: { low: number; high: number };
  stopLoss: number;
  target1: number;
  target2: number;
  target3: number;
  bullProbability: number;
  bearProbability: number;
  confidence: number;
  timestamp: number;
}

export const MARKET_SYMBOLS: MarketSymbol[] = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

export const MARKET_DISPLAY_NAMES: Record<MarketSymbol, string> = {
  BTCUSDT: 'BTC/USDT',
  ETHUSDT: 'ETH/USDT',
  SOLUSDT: 'SOL/USDT',
};
