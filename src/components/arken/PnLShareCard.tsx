import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Copy, Share2, TrendingUp, TrendingDown } from 'lucide-react';
import type { Position } from '@/types/trading';
import { MARKET_DISPLAY_NAMES } from '@/types/trading';
import arkenxLogo from '@/assets/arkenx-logo.jpg';

interface PnLShareCardProps {
  position: Position;
  currentPrice: number;
  onClose: () => void;
}

export function PnLShareCard({ position, currentPrice, onClose }: PnLShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const priceDiff = currentPrice - position.entryPrice;
  const direction = position.side === 'long' ? 1 : -1;
  const pnl = (priceDiff / position.entryPrice) * position.size * position.leverage * direction;
  const roi = ((currentPrice - position.entryPrice) / position.entryPrice) * position.leverage * direction * 100;
  const isProfit = pnl >= 0;

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  };

  const copyToClipboard = useCallback(async () => {
    const text = `🚀 ${position.side.toUpperCase()} ${MARKET_DISPLAY_NAMES[position.symbol]}
${isProfit ? '📈' : '📉'} PnL: ${isProfit ? '+' : ''}$${pnl.toFixed(2)} (${roi.toFixed(2)}% ROI)
📊 Entry: $${formatPrice(position.entryPrice)} | Mark: $${formatPrice(currentPrice)}
⚡ Leverage: ${position.leverage}x

Trade on ARKENX`;

    await navigator.clipboard.writeText(text);
  }, [position, currentPrice, pnl, roi, isProfit]);

  const shareToTwitter = useCallback(() => {
    const text = encodeURIComponent(
      `${position.side.toUpperCase()} ${MARKET_DISPLAY_NAMES[position.symbol]} ${isProfit ? '🟢' : '🔴'} ${isProfit ? '+' : ''}${roi.toFixed(2)}% ROI on ARKENX`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }, [position, roi, isProfit]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-10 right-0 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Share Card */}
        <div
          ref={cardRef}
          className="bg-gradient-to-br from-card to-background border border-border rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <img src={arkenxLogo} alt="ARKENX" className="h-6 w-auto" />
            <span className="text-[10px] text-muted-foreground">PERPETUALS</span>
          </div>

          {/* Main Content */}
          <div className="p-6 text-center">
            {/* Symbol + Side */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl font-bold text-foreground">
                {MARKET_DISPLAY_NAMES[position.symbol]}
              </span>
              <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                position.side === 'long' 
                  ? 'bg-success/20 text-success' 
                  : 'bg-destructive/20 text-destructive'
              }`}>
                {position.side === 'long' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {position.side.toUpperCase()}
              </span>
            </div>

            {/* PnL */}
            <div className={`text-4xl font-bold mb-2 ${isProfit ? 'text-success' : 'text-destructive'}`}>
              {isProfit ? '+' : ''}${pnl.toFixed(2)}
            </div>
            <div className={`text-xl font-semibold mb-6 ${isProfit ? 'text-success' : 'text-destructive'}`}>
              {isProfit ? '+' : ''}{roi.toFixed(2)}% ROI
            </div>

            {/* Details */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">ENTRY</p>
                <p className="font-semibold text-foreground tabular-nums">${formatPrice(position.entryPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">MARK</p>
                <p className="font-semibold text-foreground tabular-nums">${formatPrice(currentPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">LEVERAGE</p>
                <p className="font-semibold text-primary tabular-nums">{position.leverage}×</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30">
            <p className="text-center text-xs text-muted-foreground">
              Trade on <span className="text-primary font-semibold">ARKENX</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="flex-1 border-border"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button
            onClick={shareToTwitter}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
