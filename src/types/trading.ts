export type TradingMode = 'paper' | 'live' | null;

export type OrderSide = 'long' | 'short';

export type OrderType = 'market' | 'limit';

export type MarginMode = 'cross' | 'isolated';

export type MarketSymbol = 
  | 'BTCUSDT' | 'ETHUSDT' | 'SOLUSDT' | 'BNBUSDT' | 'XRPUSDT'
  | 'ADAUSDT' | 'DOGEUSDT' | 'MATICUSDT' | 'DOTUSDT' | 'AVAXUSDT'
  | 'LINKUSDT' | 'LTCUSDT' | 'ATOMUSDT' | 'UNIUSDT' | 'NEARUSDT'
  | 'APTUSDT' | 'ARBUSDT' | 'OPUSDT' | 'SUIUSDT' | 'SEIUSDT';

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

export const MARKET_SYMBOLS: MarketSymbol[] = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'MATICUSDT', 'DOTUSDT', 'AVAXUSDT',
  'LINKUSDT', 'LTCUSDT', 'ATOMUSDT', 'UNIUSDT', 'NEARUSDT',
  'APTUSDT', 'ARBUSDT', 'OPUSDT', 'SUIUSDT', 'SEIUSDT',
];

export const MARKET_DISPLAY_NAMES: Record<MarketSymbol, string> = {
  BTCUSDT: 'BTC/USDT',
  ETHUSDT: 'ETH/USDT',
  SOLUSDT: 'SOL/USDT',
  BNBUSDT: 'BNB/USDT',
  XRPUSDT: 'XRP/USDT',
  ADAUSDT: 'ADA/USDT',
  DOGEUSDT: 'DOGE/USDT',
  MATICUSDT: 'MATIC/USDT',
  DOTUSDT: 'DOT/USDT',
  AVAXUSDT: 'AVAX/USDT',
  LINKUSDT: 'LINK/USDT',
  LTCUSDT: 'LTC/USDT',
  ATOMUSDT: 'ATOM/USDT',
  UNIUSDT: 'UNI/USDT',
  NEARUSDT: 'NEAR/USDT',
  APTUSDT: 'APT/USDT',
  ARBUSDT: 'ARB/USDT',
  OPUSDT: 'OP/USDT',
  SUIUSDT: 'SUI/USDT',
  SEIUSDT: 'SEI/USDT',
};

export const DEFAULT_PRICES: Record<MarketSymbol, number> = {
  BTCUSDT: 70000,
  ETHUSDT: 2000,
  SOLUSDT: 85,
  BNBUSDT: 600,
  XRPUSDT: 0.6,
  ADAUSDT: 0.5,
  DOGEUSDT: 0.15,
  MATICUSDT: 0.8,
  DOTUSDT: 7,
  AVAXUSDT: 35,
  LINKUSDT: 15,
  LTCUSDT: 80,
  ATOMUSDT: 9,
  UNIUSDT: 10,
  NEARUSDT: 5,
  APTUSDT: 10,
  ARBUSDT: 1.2,
  OPUSDT: 2.5,
  SUIUSDT: 1.5,
  SEIUSDT: 0.5,
};
