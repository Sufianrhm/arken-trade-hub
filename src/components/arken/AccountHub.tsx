import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, DollarSign, Award, Share2 } from 'lucide-react';
import type { UserAccount } from '@/types/trading';

interface AccountHubProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserAccount | null;
  balance: number;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => boolean;
}

export function AccountHub({ 
  open, 
  onOpenChange, 
  user, 
  balance,
  onDeposit, 
  onWithdraw 
}: AccountHubProps) {
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    onDeposit(amount);
    setSuccess(`Deposited $${amount.toLocaleString()} USDC`);
    setDepositAmount('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (onWithdraw(amount)) {
      setSuccess(`Withdrawn $${amount.toLocaleString()} USDC`);
      setWithdrawAmount('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError('Insufficient balance');
    }
  };

  const copyReferralLink = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(`https://arkenx.trade/ref/${user.referralCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBadgeColor = (badge: UserAccount['badge']) => {
    switch (badge) {
      case 'diamond': return 'bg-primary/10 text-primary border-primary/30';
      case 'platinum': return 'bg-muted text-foreground border-border';
      case 'gold': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'silver': return 'bg-muted text-muted-foreground border-border';
      case 'bronze': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold flex items-center gap-3">
            <div className="p-2 rounded bg-primary/10">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            ACCOUNT HUB
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Account Info */}
          <div className="panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label">USERNAME</p>
                <p className="text-lg font-semibold text-foreground">{user.username}</p>
              </div>
              {user.badge && (
                <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded border ${getBadgeColor(user.badge)}`}>
                  <Award className="w-3 h-3 inline mr-1" />
                  {user.badge}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-label">ACCOUNT ID</p>
                <p className="text-sm font-mono text-foreground">{user.paperAccountId}</p>
              </div>
              <div>
                <p className="text-label">BALANCE</p>
                <p className="text-sm font-semibold text-primary tabular-nums">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="panel p-3 text-center">
              <p className="text-label">TOTAL PNL</p>
              <p className={`text-lg font-semibold tabular-nums ${user.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                {user.totalPnl >= 0 ? '+' : ''}${user.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="panel p-3 text-center">
              <p className="text-label">TRADES</p>
              <p className="text-lg font-semibold text-foreground">{user.tradesCount}</p>
            </div>
            <div className="panel p-3 text-center">
              <p className="text-label">WIN RATE</p>
              <p className="text-lg font-semibold text-foreground">{user.winRate.toFixed(1)}%</p>
            </div>
          </div>

          {/* Deposit/Withdraw Tabs */}
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="w-full bg-muted/30 p-0.5">
              <TabsTrigger value="deposit" className="flex-1 text-xs">DEPOSIT</TabsTrigger>
              <TabsTrigger value="withdraw" className="flex-1 text-xs">WITHDRAW</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label className="text-label">AMOUNT (USDC)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => { setDepositAmount(e.target.value); setError(''); }}
                    placeholder="0.00"
                    className="bg-muted/30 border-border"
                  />
                  <Button onClick={handleDeposit} className="bg-success hover:bg-success/90">
                    DEPOSIT
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                {[1000, 5000, 10000].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(amt.toString())}
                    className="flex-1 text-xs"
                  >
                    +${amt.toLocaleString()}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label className="text-label">AMOUNT (USDC)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => { setWithdrawAmount(e.target.value); setError(''); }}
                    placeholder="0.00"
                    className="bg-muted/30 border-border"
                  />
                  <Button onClick={handleWithdraw} variant="outline">
                    WITHDRAW
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWithdrawAmount(balance.toString())}
                className="text-xs text-muted-foreground"
              >
                Max: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Button>
            </TabsContent>
          </Tabs>

          {error && <p className="text-destructive text-sm">{error}</p>}
          {success && <p className="text-success text-sm">{success}</p>}

          {/* Referral Link */}
          <div className="panel p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-primary" />
              <span className="text-label">REFERRAL LINK</span>
            </div>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`https://arkenx.trade/ref/${user.referralCode}`}
                className="bg-muted/30 border-border text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyReferralLink}>
                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
