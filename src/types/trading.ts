export type TradingMode = 'paper' | 'live' | null;

export type OrderSide = 'long' | 'short';

export type OrderType = 'market' | 'limit';

export type MarginMode = 'cross' | 'isolated';

// Reduced to top 7 pairs for optimized real-time updates
export type MarketSymbol = 
  | 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | 'BNBUSDT' 
  | 'XRPUSDT' | 'DOGEUSDT' | 'SUIUSDT';

export interface Position {
  id: string;
  symbol: MarketSymbol;
  side: OrderSide;
  entryPrice: number;
  size: number;
  leverage: number;
  timestamp: number;
  margin: number;
  marginMode: MarginMode;
  takeProfit?: number;
  stopLoss?: number;
  liquidationPrice: number;
}

export interface LimitOrder {
  id: string;
  symbol: MarketSymbol;
  side: OrderSide;
  type: 'limit';
  price: number;
  size: number;
  leverage: number;
  marginMode: MarginMode;
  takeProfit?: number;
  stopLoss?: number;
  timestamp: number;
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

export interface RecentTrade {
  id: string;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  telegram: string;
  referralCode?: string;
  timestamp: number;
}

export interface ARKXReward {
  id: string;
  amount: number;
  reason: 'trade' | 'referral' | 'streak' | 'achievement';
  timestamp: number;
  description: string;
}

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  paperAccountId: string;
  balance: number;
  initialBalance: number;
  createdAt: number;
  referralCode: string;
  referredBy?: string;
  totalPnl: number;
  tradesCount: number;
  winRate: number;
  rank?: number;
  badge?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  arkxBalance: number;
  arkxRewards: ARKXReward[];
}

export interface TradingState {
  mode: TradingMode;
  balance: number;
  positions: Position[];
  limitOrders: LimitOrder[];
  tradeHistory: Trade[];
  waitlist: WaitlistEntry[];
  currentUser: UserAccount | null;
  marginMode: MarginMode;
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

export interface FundingRate {
  symbol: MarketSymbol;
  rate: number;
  nextFundingTime: number;
  markPrice: number;
  indexPrice: number;
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

// Top 7 crypto pairs only
export const MARKET_SYMBOLS: MarketSymbol[] = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 
  'XRPUSDT', 'DOGEUSDT', 'SUIUSDT',
];

export const MARKET_DISPLAY_NAMES: Record<MarketSymbol, string> = {
  BTCUSDT: 'BTC/USDT',
  ETHUSDT: 'ETH/USDT',
  SOLUSDT: 'SOL/USDT',
  BNBUSDT: 'BNB/USDT',
  XRPUSDT: 'XRP/USDT',
  DOGEUSDT: 'DOGE/USDT',
  SUIUSDT: 'SUI/USDT',
};

export const MARKET_ICONS: Record<MarketSymbol, string> = {
  BTCUSDT: '₿',
  ETHUSDT: 'Ξ',
  SOLUSDT: '◎',
  BNBUSDT: '◈',
  XRPUSDT: '✕',
  DOGEUSDT: 'Ð',
  SUIUSDT: '⬡',
};

export const DEFAULT_PRICES: Record<MarketSymbol, number> = {
  BTCUSDT: 68000,
  ETHUSDT: 2020,
  SOLUSDT: 83,
  BNBUSDT: 618,
  XRPUSDT: 1.38,
  DOGEUSDT: 0.093,
  SUIUSDT: 0.93,
};

// Trading fees (simulated)
export const TRADING_FEES = {
  maker: 0.0002, // 0.02%
  taker: 0.0005, // 0.05%
};

// Leverage options
export const LEVERAGE_MARKS = [1, 5, 10, 25, 50];
