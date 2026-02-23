import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { Star, X, Loader2, RefreshCw } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import type { CryptoMarketData } from '@/services/coingecko';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WatchlistPanelProps {
  cryptos: CryptoMarketData[];
}

export default function WatchlistPanel({ cryptos }: WatchlistPanelProps) {
  const { identity } = useInternetIdentity();
  const { data: watchlist, removeFromWatchlist } = useWatchlist();
  const { error, refetch, isFetching } = useCryptoPrices();

  if (!identity || watchlist.length === 0) {
    return null;
  }

  const watchlistCryptos = cryptos.filter((c) => watchlist.includes(c.id));

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
            My Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6">
            <Alert variant="destructive" className="max-w-md">
              <AlertDescription>Failed to load watchlist data.</AlertDescription>
            </Alert>
            <Button onClick={() => refetch()} disabled={isFetching} size="sm" variant="outline" className="gap-2">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
          My Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {watchlistCryptos.map((crypto) => (
            <div key={crypto.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <Link to="/crypto/$cryptoId" params={{ cryptoId: crypto.id }} className="flex items-center gap-2 flex-1">
                <img src={crypto.image} alt={crypto.name} className="h-8 w-8" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{crypto.name}</div>
                  <div className="text-sm font-mono">${crypto.current_price.toLocaleString()}</div>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    crypto.price_change_percentage_24h >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2"
                onClick={() => removeFromWatchlist(crypto.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
