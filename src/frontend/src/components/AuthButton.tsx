import { LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useActor } from '@/hooks/useActor';
import { useEffect } from 'react';

export default function AuthButton() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { actor } = useActor();

  useEffect(() => {
    if (identity && actor) {
      actor
        .getTheme()
        .catch(() => {
          // User not initialized, initialize with default preferences
          actor.initializeUser({ theme: 'light', notifications: true }).catch(console.error);
        });
    }
  }, [identity, actor]);

  if (identity) {
    return (
      <Button variant="outline" size="sm" onClick={clear} className="gap-2">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    );
  }

  return (
    <Button variant="default" size="sm" onClick={login} disabled={isLoggingIn} className="gap-2">
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:inline">{isLoggingIn ? 'Logging in...' : 'Login'}</span>
    </Button>
  );
}
