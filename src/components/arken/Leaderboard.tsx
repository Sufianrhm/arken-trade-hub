import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Crown, Medal } from 'lucide-react';
import type { UserAccount } from '@/types/trading';

interface LeaderboardProps {
  users: UserAccount[];
  currentUserId?: string;
}

export function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  const getBadgeIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-slate-300" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-orange-400" />;
    return <span className="text-xs text-muted-foreground w-4 text-center">{rank}</span>;
  };

  const getBadgeStyle = (badge: UserAccount['badge']) => {
    switch (badge) {
      case 'diamond': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'platinum': return 'bg-slate-300/20 text-slate-300 border-slate-300/30';
      case 'gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'silver': return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
      case 'bronze': return 'bg-orange-600/20 text-orange-400 border-orange-600/30';
      default: return '';
    }
  };

  return (
    <div className="glass-panel h-full flex flex-col">
      <div className="p-4 border-b border-border/30 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Leaderboard</h3>
        <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/30">
          Paper Trading
        </Badge>
      </div>

      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-wide border-b border-border/20">
        <span className="col-span-1">#</span>
        <span className="col-span-5">Trader</span>
        <span className="col-span-3 text-right">PnL</span>
        <span className="col-span-3 text-right">Win Rate</span>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="py-2 space-y-1">
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No traders yet</p>
              <p className="text-xs">Be the first to trade!</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={`grid grid-cols-12 gap-2 items-center py-2 px-2 rounded-lg transition-colors ${
                  user.id === currentUserId 
                    ? 'bg-primary/10 border border-primary/30' 
                    : 'hover:bg-muted/30'
                }`}
              >
                <div className="col-span-1 flex items-center justify-center">
                  {getBadgeIcon(user.rank ?? 0)}
                </div>
                
                <div className="col-span-5 flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">
                    {user.username}
                  </span>
                  {user.badge && (
                    <Badge variant="outline" className={`text-[9px] px-1 py-0 ${getBadgeStyle(user.badge)}`}>
                      {user.badge}
                    </Badge>
                  )}
                </div>
                
                <div className="col-span-3 text-right">
                  <span className={`text-sm font-semibold tabular-nums ${user.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {user.totalPnl >= 0 ? '+' : ''}${user.totalPnl.toLocaleString('en-US', { 
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    })}
                  </span>
                </div>
                
                <div className="col-span-3 text-right">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {user.winRate.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
