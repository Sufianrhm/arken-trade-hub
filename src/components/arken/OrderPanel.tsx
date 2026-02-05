import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import type { MarketSymbol, OrderType, OrderSide } from '@/types/trading';

interface OrderPanelProps {
  symbol: MarketSymbol;
  currentPrice: number;
  balance: number;
  isConnected: boolean;
  onPlaceOrder: (order: {
    symbol: MarketSymbol;
    side: OrderSide;
    type: OrderType;
    size: number;
    price: number;
    leverage: number;
  }) => void;
  onConnectClick: () => void;
}

export function OrderPanel({ 
  symbol, 
  currentPrice, 
  balance, 
  isConnected,
  onPlaceOrder,
  onConnectClick 
}: OrderPanelProps) {
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [size, setSize] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [leverage, setLeverage] = useState([10]);

  const sizeNum = parseFloat(size) || 0;
  const margin = sizeNum / leverage[0];
  const canTrade = isConnected && sizeNum > 0 && margin <= balance;

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
    });

    // Reset form
    setSize('');
    setLimitPrice('');
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  return (
    <div className="glass-panel p-4 md:p-6 space-y-5">
      <h3 className="font-semibold text-foreground">Place Order</h3>

      {/* Order Type Toggle */}
      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
        <TabsList className="w-full bg-muted/50">
          <TabsTrigger value="market" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Market
          </TabsTrigger>
          <TabsTrigger value="limit" className="flex-1 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Limit
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Price Display / Input */}
      {orderType === 'market' ? (
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm">Price</Label>
          <div className="glass-panel border-border/50 rounded-lg px-3 py-2.5 flex items-center justify-between">
            <span className="text-foreground font-medium">${formatPrice(currentPrice)}</span>
            <span className="text-xs text-primary">Market</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="limit-price" className="text-muted-foreground text-sm">Limit Price</Label>
          <Input
            id="limit-price"
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={formatPrice(currentPrice)}
            className="glass-panel border-border/50 focus:border-primary/50"
          />
        </div>
      )}

      {/* Size Input */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="size" className="text-muted-foreground text-sm">Size (USDC)</Label>
          <span className="text-xs text-muted-foreground">
            Available: ${balance.toFixed(2)}
          </span>
        </div>
        <Input
          id="size"
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="0.00"
          className="glass-panel border-border/50 focus:border-primary/50"
        />
        {sizeNum > 0 && (
          <p className="text-xs text-muted-foreground">
            Margin required: ${margin.toFixed(2)}
          </p>
        )}
      </div>

      {/* Leverage Slider */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label className="text-muted-foreground text-sm">Leverage</Label>
          <span className="text-sm font-medium text-primary">{leverage[0]}x</span>
        </div>
        <Slider
          value={leverage}
          onValueChange={setLeverage}
          min={1}
          max={40}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1x</span>
          <span>10x</span>
          <span>20x</span>
          <span>40x</span>
        </div>
      </div>

      {/* Error Message */}
      {isConnected && sizeNum > 0 && margin > balance && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Insufficient balance</span>
        </div>
      )}

      {/* Action Buttons */}
      {isConnected ? (
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={() => handlePlaceOrder('long')}
            disabled={!canTrade}
            className="bg-success hover:bg-success/90 text-foreground font-semibold py-6 glow-success transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            LONG
          </Button>
          <Button
            onClick={() => handlePlaceOrder('short')}
            disabled={!canTrade}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-6 glow-destructive transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            SHORT
          </Button>
        </div>
      ) : (
        <Button
          onClick={onConnectClick}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6"
        >
          Connect Wallet to Trade
        </Button>
      )}
    </div>
  );
}
