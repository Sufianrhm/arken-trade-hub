import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Rocket, CheckCircle2, Sparkles } from 'lucide-react';

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; email: string; telegram: string }) => void;
}

export function WaitlistModal({ open, onOpenChange, onSubmit }: WaitlistModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    
    onSubmit({ name, email, telegram });
    setSubmitted(true);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset form after animation
    setTimeout(() => {
      setName('');
      setEmail('');
      setTelegram('');
      setSubmitted(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-panel border-border/50 sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <div className="mx-auto p-3 rounded-2xl bg-primary/10 text-primary mb-4 w-fit">
                <Rocket className="w-8 h-8" />
              </div>
              <DialogTitle className="text-xl font-semibold text-center">
                Join the Waitlist
              </DialogTitle>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Be the first to know when live trading launches on Arken.
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="glass-panel border-border/50 focus:border-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="glass-panel border-border/50 focus:border-primary/50"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram (optional)</Label>
                <Input
                  id="telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username"
                  className="glass-panel border-border/50 focus:border-primary/50"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Join Waitlist
              </Button>
            </form>
          </>
        ) : (
          <div className="py-8 text-center animate-fade-in">
            <div className="mx-auto p-4 rounded-full bg-success/10 text-success mb-6 w-fit">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-2">You're Early! 🎉</h3>
            <p className="text-muted-foreground mb-6">
              Welcome to the Arken family. We'll notify you when live trading goes live.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Stay tuned for exclusive early access</span>
            </div>
            <Button 
              onClick={handleClose}
              variant="outline"
              className="mt-6"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
