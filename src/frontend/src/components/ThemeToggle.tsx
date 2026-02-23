import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useActor } from '@/hooks/useActor';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (identity && actor && mounted) {
      actor
        .getTheme()
        .then((savedTheme) => {
          if (savedTheme === 'dark' || savedTheme === 'light') {
            setTheme(savedTheme);
          }
        })
        .catch(() => {
          // User not initialized yet, ignore
        });
    }
  }, [identity, actor, mounted, setTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);

    if (identity && actor) {
      try {
        await actor.updateTheme(newTheme);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}
