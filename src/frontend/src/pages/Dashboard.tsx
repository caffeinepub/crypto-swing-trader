import { useEffect, useState } from 'react';
import CryptoTable from '@/components/CryptoTable';
import WatchlistPanel from '@/components/WatchlistPanel';
import MarketSentimentPanel from '@/components/MarketSentimentPanel';
import TimeframeSelector from '@/components/TimeframeSelector';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useAlertNotifications } from '@/hooks/useAlertNotifications';
import { Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | 'Daily'>('4H');
  const { data: cryptos, isLoading, error, refetch, isFetching } = useCryptoPrices();
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>Failed to load cryptocurrency data. Please try again later.</AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} disabled={isFetching} className="gap-2">
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Retry
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time cryptocurrency prices and trading signals</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Timeframe:</span>
          <TimeframeSelector selected={timeframe} onSelect={setTimeframe} />
        </div>
      </div>

      <MarketSentimentPanel cryptos={cryptos || []} />
      <WatchlistPanel cryptos={cryptos || []} />
      <CryptoTable cryptos={cryptos || []} timeframe={timeframe} />
    </div>
  );
}
