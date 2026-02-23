import { useState } from 'react';
import { useAlertHistory } from '@/hooks/useAlertHistory';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Bell, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import AlertCard from '@/components/AlertCard';
import AlertFilters from '@/components/AlertFilters';
import { SignalType } from '@/backend';

export default function Alerts() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: cryptos } = useCryptoPrices();
  const [filterCrypto, setFilterCrypto] = useState<string | null>(null);
  const [filterSignal, setFilterSignal] = useState<SignalType | null>(null);

  const { alerts, isLoading, stats, clearAlerts } = useAlertHistory(filterCrypto, filterSignal);

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Bell className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Alert History</h2>
          <p className="text-muted-foreground">Sign in to view your trading alert history</p>
        </div>
        <Button onClick={login} disabled={loginStatus === 'logging-in'}>
          {loginStatus === 'logging-in' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const buyCount = stats ? Number(stats[0]) : 0;
  const sellCount = stats ? Number(stats[1]) : 0;
  const holdCount = stats ? Number(stats[2]) : 0;
  const totalAlerts = buyCount + sellCount + holdCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alert History</h1>
          <p className="text-muted-foreground mt-1">Review your trading signal alerts</p>
        </div>
        {alerts.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => clearAlerts()}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Alerts</CardDescription>
            <CardTitle className="text-3xl">{totalAlerts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Buy Signals
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{buyCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Sell Signals
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{sellCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Minus className="h-4 w-4 text-muted-foreground" />
              Hold Signals
            </CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">{holdCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <AlertFilters
        cryptos={cryptos || []}
        filterCrypto={filterCrypto}
        filterSignal={filterSignal}
        onCryptoChange={setFilterCrypto}
        onSignalChange={setFilterSignal}
      />

      {/* Alert List */}
      {alerts.length === 0 ? (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            {filterCrypto || filterSignal
              ? 'No alerts found matching your filters.'
              : 'No alerts yet. Trading signals will appear here when detected.'}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert, index) => (
            <AlertCard key={`${alert.crypto}-${alert.timestamp}-${index}`} alert={alert} cryptos={cryptos || []} />
          ))}
        </div>
      )}
    </div>
  );
}
