import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { TrendingUp, TrendingDown, AlertCircle, Target, Shield, DollarSign } from 'lucide-react';
import type { MarketSymbol, OrderType, OrderSide, MarginMode } from '@/types/trading';
import { MARKET_DISPLAY_NAMES, TRADING_FEES, LEVERAGE_MARKS } from '@/types/trading';

interface OrderPanelProps {
  symbol: MarketSymbol;
  currentPrice: number;
  balance: number;
  isConnected: boolean;
  marginMode: MarginMode;
  onPlaceOrder: (order: {
    symbol: MarketSymbol;
    side: OrderSide;
    type: OrderType;
    size: number;
    price: number;
    leverage: number;
    takeProfit?: number;
    stopLoss?: number;
  }) => void;
  onConnectClick: () => void;
  onMarginModeChange: (mode: MarginMode) => void;
}

export function OrderPanel({ 
  symbol, 
  currentPrice, 
  balance, 
  isConnected,
  marginMode,
  onPlaceOrder,
  onConnectClick,
  onMarginModeChange,
}: OrderPanelProps) {
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [size, setSize] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState([10]);
  const [showTPSL, setShowTPSL] = useState(false);
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  const sizeNum = parseFloat(size) || 0;
  const margin = sizeNum / leverage[0];
  const canTrade = isConnected && sizeNum > 0 && margin <= balance;

  // Calculate fees
  const fees = useMemo(() => {
    const feeRate = orderType === 'limit' ? TRADING_FEES.maker : TRADING_FEES.taker;
    return sizeNum * feeRate;
  }, [sizeNum, orderType]);

  const calculateLiqPrice = (side: OrderSide) => {
    const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice) || currentPrice;
    const maintenanceMargin = 0.005;
    if (side === 'long') {
      return price * (1 - (1 / leverage[0]) + maintenanceMargin);
    } else {
      return price * (1 + (1 / leverage[0]) - maintenanceMargin);
    }
  };

  const handlePlaceOrder = (side: OrderSide) => {
    if (!canTrade) return;
    
    const price = orderType === 'market' ? currentPrice : parseFloat(limitPrice) || currentPrice;
    
    onPlaceOrder({
      symbol,
      side,
      type: orderType,
      size: sizeNum,
      price,
      leverage: leverage[0],
      takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
    });

    setSize('');
    setLimitPrice('');
    setTakeProfit('');
    setStopLoss('');
    setShowTPSL(false);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  // Quick size buttons
  const handleQuickSize = (percent: number) => {
    const maxSize = balance * leverage[0] * percent;
    setSize(maxSize.toFixed(2));
  };

  return (
    <div className="panel p-3 space-y-3 h-full">
      {/* Header with Balance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <span className="text-label">USDX BALANCE</span>
        </div>
        <span className="text-sm font-semibold text-foreground tabular-nums">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Margin Mode Toggle */}
      <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded">
        <button
          onClick={() => onMarginModeChange('cross')}
          className={`flex-1 px-3 py-1.5 text-[10px] font-medium rounded transition-colors duration-75 ${
            marginMode === 'cross' 
              ? 'bg-card text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          CROSS
        </button>
        <button
          onClick={() => onMarginModeChange('isolated')}
          className={`flex-1 px-3 py-1.5 text-[10px] font-medium rounded transition-colors duration-75 ${
            marginMode === 'isolated' 
              ? 'bg-card text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ISOLATED
        </button>
      </div>

      {/* Order Type Toggle */}
      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
        <TabsList className="w-full bg-muted/50 p-0.5 h-8">
          <TabsTrigger value="market" className="flex-1 text-[10px] h-6 data-[state=active]:bg-card">
            MARKET
          </TabsTrigger>
          <TabsTrigger value="limit" className="flex-1 text-[10px] h-6 data-[state=active]:bg-card">
            LIMIT
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Price Display / Input */}
      {orderType === 'market' ? (
        <div className="space-y-1">
          <Label className="text-label text-[10px]">PRICE</Label>
          <div className="bg-muted/30 border border-border rounded px-3 py-2 flex items-center justify-between">
            <span className="text-foreground font-semibold text-sm tabular-nums">${formatPrice(currentPrice)}</span>
            <span className="text-[9px] text-primary font-medium bg-primary/10 px-1.5 py-0.5 rounded">MARKET</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <Label htmlFor="limit-price" className="text-label text-[10px]">LIMIT PRICE</Label>
          <Input
            id="limit-price"
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={formatPrice(currentPrice)}
            className="bg-muted/30 border-border focus:border-primary text-sm h-9"
          />
        </div>
      )}

      {/* Size Input */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <Label htmlFor="size" className="text-label text-[10px]">SIZE (USDX)</Label>
        </div>
        <Input
          id="size"
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="0.00"
          className="bg-muted/30 border-border focus:border-primary text-sm h-9"
        />
        {/* Quick Size Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <button
              key={pct}
              onClick={() => handleQuickSize(pct)}
              className="text-[9px] py-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              {pct * 100}%
            </button>
          ))}
        </div>
      </div>

      {/* Leverage Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-label text-[10px]">LEVERAGE</Label>
          <span className="text-xs font-bold text-primary tabular-nums">{leverage[0]}×</span>
        </div>
        <Slider
          value={leverage}
          onValueChange={setLeverage}
          min={1}
          max={50}
          step={1}
          className="py-1"
        />
        <div className="flex justify-between">
          {LEVERAGE_MARKS.map((mark) => (
            <button
              key={mark}
              onClick={() => setLeverage([mark])}
              className={`text-[9px] px-1.5 py-0.5 rounded transition-colors ${
                leverage[0] === mark 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mark}×
            </button>
          ))}
        </div>
      </div>

      {/* TP/SL Toggle */}
      <div className="flex items-center justify-between py-1 border-t border-border pt-3">
        <div className="flex items-center gap-2">
          <Target className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium">TP / SL</span>
        </div>
        <Switch
          checked={showTPSL}
          onCheckedChange={setShowTPSL}
          className="scale-75"
        />
      </div>

      {/* TP/SL Inputs */}
      {showTPSL && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-success flex items-center gap-1">
              <Target className="w-2.5 h-2.5" />
              TAKE PROFIT
            </Label>
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder={formatPrice(currentPrice * 1.05)}
              className="bg-success/5 border-success/20 focus:border-success text-[11px] h-7"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-destructive flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              STOP LOSS
            </Label>
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder={formatPrice(currentPrice * 0.95)}
              className="bg-destructive/5 border-destructive/20 focus:border-destructive text-[11px] h-7"
            />
          </div>
        </div>
      )}

      {/* Order Summary */}
      {sizeNum > 0 && (
        <div className="space-y-1 text-[10px] text-muted-foreground border-t border-border pt-2">
          <div className="flex justify-between">
            <span>Margin Required</span>
            <span className="text-foreground tabular-nums">${margin.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Fee ({orderType === 'limit' ? 'Maker' : 'Taker'})</span>
            <span className="text-foreground tabular-nums">${fees.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Liq. Price (Long)</span>
            <span className="text-destructive tabular-nums">${formatPrice(calculateLiqPrice('long'))}</span>
          </div>
          <div className="flex justify-between">
            <span>Liq. Price (Short)</span>
            <span className="text-destructive tabular-nums">${formatPrice(calculateLiqPrice('short'))}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {isConnected && sizeNum > 0 && margin > balance && (
        <div className="flex items-center gap-2 text-destructive text-[10px] bg-destructive/10 px-2 py-1.5 rounded">
          <AlertCircle className="w-3 h-3" />
          <span>Insufficient balance</span>
        </div>
      )}

      {/* Action Buttons */}
      {isConnected ? (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            onClick={() => handlePlaceOrder('long')}
            disabled={!canTrade}
            className="bg-success hover:bg-success/90 text-white font-semibold h-11 text-sm transition-all duration-75 disabled:opacity-40"
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            LONG
          </Button>
          <Button
            onClick={() => handlePlaceOrder('short')}
            disabled={!canTrade}
            className="bg-destructive hover:bg-destructive/90 text-white font-semibold h-11 text-sm transition-all duration-75 disabled:opacity-40"
          >
            <TrendingDown className="w-4 h-4 mr-1.5" />
            SHORT
          </Button>
        </div>
      ) : (
        <Button
          onClick={onConnectClick}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11"
        >
          CONNECT TO TRADE
        </Button>
      )}
    </div>
  );
}
