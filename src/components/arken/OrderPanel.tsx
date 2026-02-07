import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { TrendingUp, TrendingDown, AlertCircle, Target, Shield } from 'lucide-react';
import type { MarketSymbol, OrderType, OrderSide, MarginMode } from '@/types/trading';

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

  // Calculate liquidation price
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

    // Reset form
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

  return (
    <div className="glass-panel p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Place Order</h3>
        
        {/* Margin Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onMarginModeChange('cross')}
            className={`px-2 py-1 text-[10px] font-medium rounded ${
              marginMode === 'cross' 
                ? 'bg-primary/20 text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Cross
          </button>
          <button
            onClick={() => onMarginModeChange('isolated')}
            className={`px-2 py-1 text-[10px] font-medium rounded ${
              marginMode === 'isolated' 
                ? 'bg-primary/20 text-primary' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Isolated
          </button>
        </div>
      </div>

      {/* Order Type Toggle */}
      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
        <TabsList className="w-full bg-muted/50">
          <TabsTrigger value="market" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs">
            Market
          </TabsTrigger>
          <TabsTrigger value="limit" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-xs">
            Limit
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Price Display / Input */}
      {orderType === 'market' ? (
        <div className="space-y-1">
          <Label className="text-muted-foreground text-xs">Price</Label>
          <div className="glass-panel border-border/50 rounded-lg px-3 py-2 flex items-center justify-between">
            <span className="text-foreground font-medium text-sm tabular-nums">${formatPrice(currentPrice)}</span>
            <span className="text-[10px] text-primary">Market</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <Label htmlFor="limit-price" className="text-muted-foreground text-xs">Limit Price</Label>
          <Input
            id="limit-price"
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={formatPrice(currentPrice)}
            className="glass-panel border-border/50 focus:border-primary/50 text-sm"
          />
        </div>
      )}

      {/* Size Input */}
      <div className="space-y-1">
        <div className="flex justify-between">
          <Label htmlFor="size" className="text-muted-foreground text-xs">Size (USDC)</Label>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            Available: ${balance.toFixed(2)}
          </span>
        </div>
        <Input
          id="size"
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="0.00"
          className="glass-panel border-border/50 focus:border-primary/50 text-sm"
        />
        {sizeNum > 0 && (
          <p className="text-[10px] text-muted-foreground tabular-nums">
            Margin: ${margin.toFixed(2)} | Liq. Long: ${formatPrice(calculateLiqPrice('long'))} | Short: ${formatPrice(calculateLiqPrice('short'))}
          </p>
        )}
      </div>

      {/* Leverage Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label className="text-muted-foreground text-xs">Leverage</Label>
          <span className="text-xs font-medium text-primary">{leverage[0]}x</span>
        </div>
        <Slider
          value={leverage}
          onValueChange={setLeverage}
          min={1}
          max={50}
          step={1}
          className="py-1"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>1x</span>
          <span>10x</span>
          <span>25x</span>
          <span>50x</span>
        </div>
      </div>

      {/* TP/SL Toggle */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">TP/SL</span>
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
            <Label className="text-[10px] text-success flex items-center gap-1">
              <Target className="w-3 h-3" />
              Take Profit
            </Label>
            <Input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder={formatPrice(currentPrice * 1.05)}
              className="glass-panel border-success/30 focus:border-success/50 text-xs h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-destructive flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Stop Loss
            </Label>
            <Input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder={formatPrice(currentPrice * 0.95)}
              className="glass-panel border-destructive/30 focus:border-destructive/50 text-xs h-8"
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {isConnected && sizeNum > 0 && margin > balance && (
        <div className="flex items-center gap-2 text-destructive text-xs">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Insufficient balance</span>
        </div>
      )}

      {/* Action Buttons */}
      {isConnected ? (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            onClick={() => handlePlaceOrder('long')}
            disabled={!canTrade}
            className="bg-success hover:bg-success/90 text-foreground font-semibold py-5 glow-success transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            LONG
          </Button>
          <Button
            onClick={() => handlePlaceOrder('short')}
            disabled={!canTrade}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-5 glow-destructive transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <TrendingDown className="w-4 h-4 mr-1.5" />
            SHORT
          </Button>
        </div>
      ) : (
        <Button
          onClick={onConnectClick}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-5"
        >
          Connect to Trade
        </Button>
      )}
    </div>
  );
}
