import { Gift, Zap, Users, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ARKXReward } from '@/types/trading';

interface RewardsPanelProps {
  arkxBalance: number;
  rewards: ARKXReward[];
  onClaim?: () => void;
}

export function RewardsPanel({ arkxBalance, rewards, onClaim }: RewardsPanelProps) {
  const recentRewards = rewards.slice(0, 5);
  
  const getRewardIcon = (reason: ARKXReward['reason']) => {
    switch (reason) {
      case 'trade': return <Zap className="w-3 h-3 text-primary" />;
      case 'referral': return <Users className="w-3 h-3 text-success" />;
      case 'streak': return <Calendar className="w-3 h-3 text-orange-400" />;
      case 'achievement': return <Gift className="w-3 h-3 text-purple-400" />;
      default: return <Gift className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="panel p-4 space-y-4">
      {/* ARKX Balance Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">◆</span>
          </div>
          <div>
            <p className="text-label text-[10px]">ARKX REWARDS</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{arkxBalance.toFixed(2)}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-[10px] h-7 px-3 border-primary/30 text-primary hover:bg-primary/10"
          disabled
        >
          REDEEM
        </Button>
      </div>

      {/* How to Earn */}
      <div className="space-y-2">
        <p className="text-label text-[10px]">HOW TO EARN</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded bg-muted/30 text-center">
            <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-[9px] text-muted-foreground">TRADE</p>
            <p className="text-[10px] font-medium text-foreground">0.01/vol</p>
          </div>
          <div className="p-2 rounded bg-muted/30 text-center">
            <Users className="w-4 h-4 text-success mx-auto mb-1" />
            <p className="text-[9px] text-muted-foreground">REFERRAL</p>
            <p className="text-[10px] font-medium text-foreground">10 ARKX</p>
          </div>
          <div className="p-2 rounded bg-muted/30 text-center">
            <Calendar className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="text-[9px] text-muted-foreground">STREAK</p>
            <p className="text-[10px] font-medium text-foreground">5/day</p>
          </div>
        </div>
      </div>

      {/* Recent Rewards */}
      {recentRewards.length > 0 && (
        <div className="space-y-2">
          <p className="text-label text-[10px]">RECENT REWARDS</p>
          <div className="space-y-1">
            {recentRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between py-1.5 text-xs">
                <div className="flex items-center gap-2">
                  {getRewardIcon(reward.reason)}
                  <span className="text-muted-foreground">{reward.description}</span>
                </div>
                <span className="text-success font-medium tabular-nums">+{reward.amount} ARKX</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon Notice */}
      <div className="p-3 rounded bg-primary/5 border border-primary/20">
        <p className="text-[10px] text-primary font-medium mb-1">COMING SOON</p>
        <p className="text-[10px] text-muted-foreground">
          Redeem ARKX for fee discounts, exclusive features, and future airdrops.
        </p>
      </div>
    </div>
  );
}
