import { useEffect } from 'react';
import CryptoTable from '@/components/CryptoTable';
import WatchlistPanel from '@/components/WatchlistPanel';
import MarketSentimentPanel from '@/components/MarketSentimentPanel';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useAlertNotifications } from '@/hooks/useAlertNotifications';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Dashboard() {
  const { data: cryptos, isLoading, error, refetch } = useCryptoPrices();
  useAlertNotifications();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load cryptocurrency data. Please try again later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time cryptocurrency prices and trading signals</p>
      </div>

      <MarketSentimentPanel cryptos={cryptos || []} />
      <WatchlistPanel cryptos={cryptos || []} />
      <CryptoTable cryptos={cryptos || []} />
    </div>
  );
}
