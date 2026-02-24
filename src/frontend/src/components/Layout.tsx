import { Link, useLocation } from '@tanstack/react-router';
import { Menu, TrendingUp } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';
import { useApiHealthMonitor } from '@/hooks/useApiHealthMonitor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const apiHealth = useApiHealthMonitor();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Market' },
    { to: '/alerts', label: 'Alerts' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* API Health Banner */}
      {apiHealth.status === 'issues' && (
        <div className="border-b border-neon-red/30 bg-neon-red/10">
          <Alert variant="destructive" className="rounded-none border-0">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {apiHealth.message}. Some data may be temporarily unavailable. We're working to restore full connectivity.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-neon-cyan/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 glow-ambient">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <TrendingUp className="h-6 w-6 text-neon-cyan glow-icon transition-all duration-300 group-hover:scale-110" />
              <span className="font-heading text-xl font-bold text-neon-cyan glow-text">CryptoSignals</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-md font-heading text-sm transition-all duration-300 ${
                    isActive(link.to)
                      ? 'bg-neon-cyan/20 text-neon-cyan glow-text'
                      : 'text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* API Health Indicator */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/50 bg-background-elevated/50">
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse" 
                      style={{ backgroundColor: apiHealth.color }}
                    />
                    <span className="text-xs font-mono hidden sm:inline">
                      {apiHealth.status === 'healthy' ? 'API' : apiHealth.status === 'degraded' ? 'Slow' : 'Issues'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{apiHealth.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Success rate: {apiHealth.successRate.toFixed(0)}%
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ThemeToggle />
            <AuthButton />

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="glow-hover">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 border-neon-cyan/30 bg-background/98 backdrop-blur-xl">
                <nav className="flex flex-col gap-2 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-4 py-3 rounded-md font-heading transition-all duration-300 ${
                        isActive(link.to)
                          ? 'bg-neon-cyan/20 text-neon-cyan glow-text'
                          : 'text-muted-foreground hover:text-neon-cyan hover:bg-neon-cyan/10'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 animate-fade-in">{children}</main>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/30 bg-background-elevated/50 mt-16">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} CryptoSignals</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built with</span>
              <span className="text-neon-red glow-text">♥</span>
              <span>using</span>
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'crypto-signals'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan hover:text-neon-cyan/80 transition-colors glow-text"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
