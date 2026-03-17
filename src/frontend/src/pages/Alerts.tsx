import type { SignalType } from "@/backend";
import AlertCard from "@/components/AlertCard";
import AlertFilters from "@/components/AlertFilters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlertHistory } from "@/hooks/useAlertHistory";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  Bell,
  Loader2,
  Minus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function Alerts() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: cryptos } = useCryptoPrices();
  const [filterCrypto, setFilterCrypto] = useState<string | null>(null);
  const [filterSignal, setFilterSignal] = useState<SignalType | null>(null);

  const { alerts, isLoading, stats, clearAlerts } = useAlertHistory(
    filterCrypto,
    filterSignal,
  );

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
        <div className="relative">
          <Bell className="h-20 w-20 text-neon-cyan glow-icon" />
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-neon-purple animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-heading text-neon-cyan glow-text">
            Alert History
          </h2>
          <p className="text-muted-foreground">
            Sign in to view your trading signal alerts
          </p>
        </div>
        <Button
          onClick={login}
          disabled={loginStatus === "logging-in"}
          className="bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/30 glow-hover"
        >
          {loginStatus === "logging-in" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan glow-icon" />
      </div>
    );
  }

  const buyCount = stats ? Number(stats[0]) : 0;
  const sellCount = stats ? Number(stats[1]) : 0;
  const holdCount = stats ? Number(stats[2]) : 0;
  const totalAlerts = buyCount + sellCount + holdCount;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-heading text-neon-cyan glow-text">
            Alert History
          </h1>
          <p className="text-muted-foreground mt-1">
            Review your trading signal alerts
          </p>
        </div>
        {alerts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => clearAlerts()}
            className="border-neon-red/40 text-neon-red hover:bg-neon-red/10 glow-hover"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-neon-cyan/30 bg-card glow-ambient">
          <CardHeader className="pb-3">
            <p className="text-xs text-muted-foreground font-heading">
              Total Alerts
            </p>
            <CardTitle className="text-3xl font-mono text-neon-cyan glow-text">
              {totalAlerts}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-neon-green/30 bg-card glow-green">
          <CardHeader className="pb-3">
            <p className="text-xs text-muted-foreground font-heading flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-neon-green" />
              Buy Signals
            </p>
            <CardTitle className="text-3xl font-mono text-neon-green glow-text">
              {buyCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-neon-red/30 bg-card glow-red">
          <CardHeader className="pb-3">
            <p className="text-xs text-muted-foreground font-heading flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-neon-red" />
              Sell Signals
            </p>
            <CardTitle className="text-3xl font-mono text-neon-red glow-text">
              {sellCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border bg-card glow-ambient">
          <CardHeader className="pb-3">
            <p className="text-xs text-muted-foreground font-heading flex items-center gap-1">
              <Minus className="h-3 w-3 text-muted-foreground" />
              Hold Signals
            </p>
            <CardTitle className="text-3xl font-mono text-muted-foreground">
              {holdCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Info banner about how alerts work */}
      <div className="p-4 rounded-lg border border-neon-purple/30 bg-neon-purple/5">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-neon-purple mt-0.5 shrink-0 glow-icon" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-neon-purple font-heading">
              How Alerts Work
            </p>
            <p className="text-xs text-muted-foreground">
              Alerts trigger when RSI goes oversold/overbought or when MACD
              crossovers occur. They appear as pop-up notifications while the
              dashboard is open. When you return, any missed alerts will appear
              here.
            </p>
          </div>
        </div>
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
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-lg border border-neon-cyan/20 bg-card/50">
          <Bell className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            {filterCrypto || filterSignal
              ? "No alerts found matching your filters."
              : "No alerts yet. Keep the dashboard open to catch live trading signals."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert, index) => (
            <AlertCard
              key={`${alert.crypto}-${alert.timestamp}-${index}`}
              alert={alert}
              cryptos={cryptos || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
