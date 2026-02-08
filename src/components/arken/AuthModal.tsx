import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import type { UserAccount } from '@/types/trading';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignUp: (username: string, password: string, referralCode?: string) => UserAccount | null;
  onLogin: (username: string, password: string) => UserAccount | null;
}

export function AuthModal({ open, onOpenChange, onSignUp, onLogin }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'signup'>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (tab === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const user = onSignUp(username, password, referralCode || undefined);
      if (user) {
        setSuccess(`Welcome to ARKENX! Account ID: ${user.paperAccountId}`);
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 2000);
      } else {
        setError('Username already taken');
      }
    } else {
      const user = onLogin(username, password);
      if (user) {
        setSuccess(`Welcome back, ${user.username}!`);
        setTimeout(() => {
          onOpenChange(false);
          resetForm();
        }, 1500);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setReferralCode('');
    setError('');
    setSuccess('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-lg font-semibold text-center">
            PAPER TRADING ACCOUNT
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center mt-1">
            Trade with $10,000 virtual USDC
          </p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => { setTab(v as 'login' | 'signup'); setError(''); setSuccess(''); }}>
          <TabsList className="w-full bg-muted/30 mx-6 mb-4 p-0.5" style={{ width: 'calc(100% - 48px)' }}>
            <TabsTrigger value="signup" className="flex-1 text-xs">SIGN UP</TabsTrigger>
            <TabsTrigger value="login" className="flex-1 text-xs">LOGIN</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            <TabsContent value="signup" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-label">USERNAME</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="pl-10 bg-muted/30 border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-label">PASSWORD</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="pl-10 bg-muted/30 border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-label">CONFIRM PASSWORD</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 bg-muted/30 border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-label text-muted-foreground">REFERRAL CODE (OPTIONAL)</Label>
                <Input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code"
                  className="bg-muted/30 border-border"
                />
              </div>
            </TabsContent>

            <TabsContent value="login" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-label">USERNAME</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="pl-10 bg-muted/30 border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-label">PASSWORD</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 bg-muted/30 border-border"
                  />
                </div>
              </div>
            </TabsContent>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>{success}</span>
              </div>
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-medium">
              {tab === 'signup' ? 'CREATE ACCOUNT' : 'LOGIN'}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
