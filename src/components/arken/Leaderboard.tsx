import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Crown, Medal } from 'lucide-react';
import type { UserAccount } from '@/types/trading';

interface LeaderboardProps {
  users: UserAccount[];
  currentUserId?: string;
}

export function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  const getBadgeIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-4 h-4 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-muted-foreground" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-orange-400" />;
    return <span className="text-xs text-muted-foreground w-4 text-center">{rank}</span>;
  };

  const getBadgeStyle = (badge: UserAccount['badge']) => {
    switch (badge) {
      case 'diamond': return 'bg-primary/10 text-primary';
      case 'platinum': return 'bg-muted text-foreground';
      case 'gold': return 'bg-yellow-500/10 text-yellow-400';
      case 'silver': return 'bg-muted text-muted-foreground';
      case 'bronze': return 'bg-orange-500/10 text-orange-400';
      default: return '';
    }
  };

  return (
    <div className="panel h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        <span className="text-label">LEADERBOARD</span>
        <span className="ml-auto text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
          PAPER
        </span>
      </div>

      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-label border-b border-border/50">
        <span className="col-span-1">#</span>
        <span className="col-span-5">TRADER</span>
        <span className="col-span-3 text-right">PNL</span>
        <span className="col-span-3 text-right">WIN RATE</span>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="py-2 space-y-1">
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No traders yet</p>
              <p className="text-xs text-muted-foreground">Be the first to trade!</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={`grid grid-cols-12 gap-2 items-center py-2.5 px-2 rounded transition-colors duration-75 ${
                  user.id === currentUserId 
                    ? 'bg-primary/5 border border-primary/20' 
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
                    <span className={`text-[9px] font-medium uppercase px-1.5 py-0.5 rounded ${getBadgeStyle(user.badge)}`}>
                      {user.badge}
                    </span>
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
