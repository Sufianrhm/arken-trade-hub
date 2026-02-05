import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Sparkles, Target, AlertTriangle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import type { AIPlan, MarketSymbol, PriceData } from '@/types/trading';

interface AIIntelligenceTabProps {
  prices: Record<MarketSymbol, PriceData>;
  isConnected: boolean;
  onConnectClick: () => void;
}

const TIMEFRAMES = ['5m', '15m', '1h', '4h', '1d'] as const;
const STRATEGIES = ['Scalp', 'Swing', 'Breakout', 'Trend'] as const;

export function AIIntelligenceTab({ prices, isConnected, onConnectClick }: AIIntelligenceTabProps) {
  const [riskPercent, setRiskPercent] = useState([5]);
  const [timeframe, setTimeframe] = useState<string>('1h');
  const [strategy, setStrategy] = useState<string>('Swing');
  const [notes, setNotes] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  const btcPrice = prices['BTCUSDT']?.price ?? 50000;

  const generatePlan = async () => {
    setIsAnalyzing(true);
    setPlan(null);
    setShowPlan(false);

    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

    // Generate deterministic + random plan based on inputs
    const seed = riskPercent[0] + timeframe.length + strategy.length + notes.length;
    const rand = () => {
      const x = Math.sin(seed + Math.random() * 1000) * 10000;
      return x - Math.floor(x);
    };

    const volatility = strategy === 'Scalp' ? 0.01 : strategy === 'Swing' ? 0.03 : strategy === 'Breakout' ? 0.05 : 0.08;
    const riskMultiplier = riskPercent[0] / 5;

    const entryLow = btcPrice * (1 - volatility * rand());
    const entryHigh = btcPrice * (1 + volatility * rand() * 0.5);
    const stopLoss = entryLow * (1 - volatility * riskMultiplier);
    const target1 = entryHigh * (1 + volatility * 1);
    const target2 = entryHigh * (1 + volatility * 2);
    const target3 = entryHigh * (1 + volatility * 3.5);

    const bullProb = 40 + rand() * 35;
    const confidence = 55 + rand() * 35;

    const newPlan: AIPlan = {
      entryZone: { low: entryLow, high: entryHigh },
      stopLoss,
      target1,
      target2,
      target3,
      bullProbability: bullProb,
      bearProbability: 100 - bullProb,
      confidence,
      timestamp: Date.now(),
    };

    setPlan(newPlan);
    setIsAnalyzing(false);
    
    // Animate plan reveal
    await new Promise(resolve => setTimeout(resolve, 100));
    setShowPlan(true);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!isConnected) {
    return (
      <div className="glass-panel p-8 md:p-16 text-center">
        <div className="mx-auto p-4 rounded-2xl bg-primary/10 text-primary mb-6 w-fit">
          <Brain className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold mb-3">AI Intelligence</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Connect to access AI-powered trade planning and market analysis tools.
        </p>
        <button
          onClick={onConnectClick}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <div className="glass-panel p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">AI Trade Planner</h3>
        </div>

        {/* Risk Slider */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label className="text-muted-foreground">Risk Tolerance</Label>
            <span className="text-sm font-medium text-primary">{riskPercent[0]}%</span>
          </div>
          <Slider
            value={riskPercent}
            onValueChange={setRiskPercent}
            min={1}
            max={10}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Conservative (1%)</span>
            <span>Aggressive (10%)</span>
          </div>
        </div>

        {/* Timeframe */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Timeframe</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="glass-panel border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-panel border-border/50">
              {TIMEFRAMES.map((tf) => (
                <SelectItem key={tf} value={tf} className="focus:bg-primary/10">
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Strategy */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Strategy</Label>
          <Select value={strategy} onValueChange={setStrategy}>
            <SelectTrigger className="glass-panel border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-panel border-border/50">
              {STRATEGIES.map((s) => (
                <SelectItem key={s} value={s} className="focus:bg-primary/10">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Additional Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific observations or conditions..."
            className="glass-panel border-border/50 resize-none h-24"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={generatePlan}
          disabled={isAnalyzing}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-6"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate AI Plan
            </>
          )}
        </Button>
      </div>

      {/* Output Panel */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground">Trade Plan</h3>
        </div>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <Brain className="w-16 h-16 text-primary/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            </div>
            <p className="text-muted-foreground animate-pulse">Analyzing market conditions...</p>
          </div>
        ) : plan && showPlan ? (
          <div className={`space-y-6 ${showPlan ? 'animate-fade-in' : 'opacity-0'}`}>
            {/* Confidence */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
              <span className="text-muted-foreground">AI Confidence</span>
              <span className="text-2xl font-bold text-primary">{plan.confidence.toFixed(1)}%</span>
            </div>

            {/* Probability Split */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span>Bull: {plan.bullProbability.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  <span>Bear: {plan.bearProbability.toFixed(1)}%</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-destructive/30 overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full transition-all duration-1000"
                  style={{ width: `${plan.bullProbability}%` }}
                />
              </div>
            </div>

            {/* Entry Zone */}
            <div className="p-4 rounded-xl bg-muted/30 space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>Entry Zone</span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                ${formatPrice(plan.entryZone.low)} - ${formatPrice(plan.entryZone.high)}
              </p>
            </div>

            {/* Stop Loss */}
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span>Stop Loss</span>
              </div>
              <p className="text-lg font-semibold text-destructive">
                ${formatPrice(plan.stopLoss)}
              </p>
            </div>

            {/* Targets */}
            <div className="space-y-3">
              {[
                { label: 'Target 1', value: plan.target1, opacity: 'bg-success/10 border-success/20' },
                { label: 'Target 2', value: plan.target2, opacity: 'bg-success/20 border-success/30' },
                { label: 'Target 3', value: plan.target3, opacity: 'bg-success/30 border-success/40' },
              ].map((target, i) => (
                <div key={i} className={`p-4 rounded-xl border ${target.opacity} space-y-1`}>
                  <span className="text-success text-sm">{target.label}</span>
                  <p className="text-lg font-semibold text-success">
                    ${formatPrice(target.value)}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Generated {new Date(plan.timestamp).toLocaleTimeString()} • For educational purposes only
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground">Configure parameters and generate</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              AI will analyze current market conditions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
