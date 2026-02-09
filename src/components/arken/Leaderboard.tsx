import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Crown, Medal, Share2 } from 'lucide-react';
import type { UserAccount } from '@/types/trading';

interface LeaderboardProps {
  users: UserAccount[];
  currentUserId?: string;
}

type TimeFilter = 'weekly' | 'monthly' | 'all';

export function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  const getBadgeIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm text-muted-foreground w-5 text-center font-medium">{rank}</span>;
  };

  const getBadgeStyle = (badge: UserAccount['badge']) => {
    switch (badge) {
      case 'diamond': return 'bg-primary/20 text-primary border-primary/30';
      case 'platinum': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      case 'gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'silver': return 'bg-slate-400/20 text-slate-400 border-slate-400/30';
      case 'bronze': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return '';
    }
  };

  // Top 3 for podium display
  const topThree = users.slice(0, 3);
  const restOfUsers = users.slice(3);

  return (
    <div className="panel h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-label text-sm">LEADERBOARD</span>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
            PAPER TRADING
          </span>
        </div>
        
        {/* Time Filter */}
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <TabsList className="w-full bg-muted/50 p-0.5">
            <TabsTrigger value="weekly" className="flex-1 text-[10px] h-7 data-[state=active]:bg-card">
              WEEKLY
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 text-[10px] h-7 data-[state=active]:bg-card">
              MONTHLY
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1 text-[10px] h-7 data-[state=active]:bg-card">
              ALL TIME
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {users.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No traders yet</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to compete!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length >= 3 && (
            <div className="p-4 border-b border-border">
              <div className="flex items-end justify-center gap-2">
                {/* 2nd Place */}
                <div className="flex flex-col items-center w-24">
                  <Medal className="w-8 h-8 text-slate-300 mb-2" />
                  <div className="w-full bg-slate-500/20 rounded-t-lg pt-4 pb-2 px-2 text-center">
                    <p className="text-xs font-medium text-foreground truncate">{topThree[1]?.username}</p>
                    <p className="text-[10px] text-success tabular-nums mt-1">
                      +${topThree[1]?.totalPnl?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <div className="w-full h-16 bg-slate-500/10 border-t border-slate-500/30"></div>
                </div>
                
                {/* 1st Place */}
                <div className="flex flex-col items-center w-28">
                  <Crown className="w-10 h-10 text-yellow-400 mb-2" />
                  <div className="w-full bg-yellow-500/20 rounded-t-lg pt-4 pb-2 px-2 text-center">
                    <p className="text-sm font-semibold text-foreground truncate">{topThree[0]?.username}</p>
                    <p className="text-xs text-success tabular-nums mt-1">
                      +${topThree[0]?.totalPnl?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <div className="w-full h-24 bg-yellow-500/10 border-t border-yellow-500/30"></div>
                </div>
                
                {/* 3rd Place */}
                <div className="flex flex-col items-center w-24">
                  <Medal className="w-8 h-8 text-orange-400 mb-2" />
                  <div className="w-full bg-orange-500/20 rounded-t-lg pt-4 pb-2 px-2 text-center">
                    <p className="text-xs font-medium text-foreground truncate">{topThree[2]?.username}</p>
                    <p className="text-[10px] text-success tabular-nums mt-1">
                      +${topThree[2]?.totalPnl?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <div className="w-full h-12 bg-orange-500/10 border-t border-orange-500/30"></div>
                </div>
              </div>
            </div>
          )}

          {/* Column Headers */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-label border-b border-border/50">
            <span className="col-span-1">#</span>
            <span className="col-span-4">TRADER</span>
            <span className="col-span-2 text-right">TRADES</span>
            <span className="col-span-2 text-right">WIN RATE</span>
            <span className="col-span-3 text-right">PNL</span>
          </div>

          {/* Rest of Users */}
          <ScrollArea className="flex-1 px-4">
            <div className="py-2 space-y-1">
              {(topThree.length < 3 ? users : restOfUsers).map((user, index) => {
                const rank = topThree.length < 3 ? index + 1 : index + 4;
                const isCurrentUser = user.id === currentUserId;
                
                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-12 gap-2 items-center py-3 px-2 rounded transition-colors duration-75 ${
                      isCurrentUser 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'hover:bg-muted/30'
                    }`}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      {getBadgeIcon(rank)}
                    </div>
                    
                    <div className="col-span-4 flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">
                        {user.username}
                      </span>
                      {user.badge && (
                        <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border ${getBadgeStyle(user.badge)}`}>
                          {user.badge}
                        </span>
                      )}
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {user.tradesCount}
                      </span>
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {user.winRate.toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="col-span-3 text-right">
                      <span className={`text-sm font-semibold tabular-nums ${user.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {user.totalPnl >= 0 ? '+' : ''}${user.totalPnl.toLocaleString('en-US', { 
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0 
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}
