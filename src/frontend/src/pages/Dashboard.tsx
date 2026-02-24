import { useEffect, useState } from 'react';
import CryptoTable from '@/components/CryptoTable';
import MarketSentimentPanel from '@/components/MarketSentimentPanel';
import TimeframeSelector from '@/components/TimeframeSelector';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useAlertNotifications } from '@/hooks/useAlertNotifications';
import { Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | 'Daily'>('4H');
  const { data: cryptos, isLoading, error, refetch, isFetching, isInitialLoading, retryAttempt } = useCryptoPrices();
  useAlertNotifications();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Loading overlay for initial load with retry progress
  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 p-8 rounded-lg border border-neon-cyan/30 bg-card glow-ambient">
          <Loader2 className="h-12 w-12 animate-spin text-neon-cyan glow-icon" />
          <div className="text-center">
            <p className="text-lg font-heading text-neon-cyan">Loading Market Data</p>
            {retryAttempt > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Retry attempt {retryAttempt} of 5...
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Fetching real-time cryptocurrency prices
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Alert variant="destructive" className="max-w-md border-neon-red/30 glow-red">
          <AlertDescription>Failed to load cryptocurrency data. Please try again later.</AlertDescription>
        </Alert>
        <Button onClick={() => refetch()} disabled={isFetching} className="gap-2 glow-hover">
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
          <h1 className="text-3xl font-bold tracking-tight font-heading text-neon-cyan glow-text">Market Overview</h1>
          <p className="text-muted-foreground mt-1">Real-time cryptocurrency prices and trading signals</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-heading">Timeframe:</span>
          <TimeframeSelector selected={timeframe} onSelect={setTimeframe} />
        </div>
      </div>

      <MarketSentimentPanel cryptos={cryptos || []} />
      <CryptoTable cryptos={cryptos || []} timeframe={timeframe} />
    </div>
  );
}
