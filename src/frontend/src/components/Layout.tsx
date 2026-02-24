import { Link } from '@tanstack/react-router';
import { Menu, TrendingUp, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';
import { useState } from 'react';
import { SiCoffeescript } from 'react-icons/si';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Market', icon: TrendingUp },
    { to: '/alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-neon-cyan/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-[0_4px_20px_rgba(0,217,255,0.1)]">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl font-heading">
              <TrendingUp className="h-6 w-6 text-neon-cyan glow-icon" />
              <span className="hidden sm:inline text-neon-cyan glow-text">CryptoSwing</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  {({ isActive }) => (
                    <Button 
                      variant={isActive ? 'default' : 'ghost'} 
                      size="sm" 
                      className={`gap-2 transition-all duration-300 ${isActive ? 'glow-button-active' : 'hover:glow-button'}`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="hover:glow-button">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-background-elevated border-neon-cyan/30 backdrop-blur-xl">
                <div className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                      {({ isActive }) => (
                        <Button 
                          variant={isActive ? 'default' : 'ghost'} 
                          className={`w-full justify-start gap-2 transition-all duration-300 ${isActive ? 'glow-button-active' : 'hover:glow-button'}`}
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Button>
                      )}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container py-6">{children}</main>

      <footer className="border-t border-neon-cyan/20 mt-12 bg-background-elevated/50">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            © {new Date().getFullYear()} Built with <SiCoffeescript className="h-4 w-4 text-neon-purple glow-icon" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'crypto-swing-trader'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-neon-cyan transition-colors duration-300 glow-text-hover"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
