import CryptoTable from "@/components/CryptoTable";
import MarketSentimentPanel from "@/components/MarketSentimentPanel";
import TimeframeSelector from "@/components/TimeframeSelector";
import TradeSetupScanner, {
  getPriceSignal,
} from "@/components/TradeSetupScanner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAlertNotifications } from "@/hooks/useAlertNotifications";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Clock, Loader2, RefreshCw, Zap } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";

export default function Dashboard() {
  const [timeframe, setTimeframe] = useState<"1H" | "4H" | "Daily">("4H");
  const {
    data: cryptos,
    error,
    refetch,
    isFetching,
    isInitialLoading,
    retryAttempt,
    lastUpdated,
    batchProgress,
    errorType,
    countdownSeconds,
  } = useCryptoPrices();
  useAlertNotifications();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 45000);
    return () => clearInterval(interval);
  }, [refetch]);

  const formatLastUpdated = (timestamp: number | null): string => {
    if (!timestamp) return "Never";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return "1 minute ago";
    return `${minutes} minutes ago`;
  };

  const getErrorMessage = (): string => {
    switch (errorType) {
      case "rate-limit":
        return `Rate limit reached, retrying in ${countdownSeconds}s...`;
      case "network":
        return `Network error, retrying in ${countdownSeconds}s...`;
      case "api-unavailable":
        return `API temporarily unavailable, retrying in ${countdownSeconds}s...`;
      default:
        return "Failed to load cryptocurrency data";
    }
  };

  // Compute setup count from loaded data (no extra API calls)
  const setupCount = (cryptos || []).filter(
    (c) => getPriceSignal(c).type !== "neutral",
  ).length;
  const buyCount = (cryptos || []).filter(
    (c) => getPriceSignal(c).type === "buy",
  ).length;
  const sellCount = (cryptos || []).filter(
    (c) => getPriceSignal(c).type === "sell",
  ).length;

  if (isInitialLoading) {
    const progressPercent = (batchProgress.loaded / batchProgress.total) * 100;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6 p-8 rounded-lg border border-neon-cyan/30 bg-card glow-ambient max-w-md w-full">
          <Loader2 className="h-12 w-12 animate-spin text-neon-cyan glow-icon" />
          <div className="text-center w-full">
            <p className="text-lg font-heading text-neon-cyan mb-2">
              Loading Market Data
            </p>
            <div className="space-y-3">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {batchProgress.loaded} of {batchProgress.total} coins loaded
              </p>
              {retryAttempt > 0 && (
                <p className="text-sm text-neon-yellow glow-text">
                  Retry attempt {retryAttempt} of 5...
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Fetching real-time cryptocurrency prices
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Alert
          variant="destructive"
          className="max-w-md border-neon-red/30 glow-red"
        >
          <AlertDescription className="flex flex-col gap-2">
            <span>{getErrorMessage()}</span>
            {countdownSeconds > 0 && (
              <span className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Next attempt in {countdownSeconds} seconds
              </span>
            )}
          </AlertDescription>
        </Alert>
        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 glow-hover"
          data-ocid="dashboard.primary_button"
        >
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Retry Now
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
          <h1 className="text-3xl font-bold tracking-tight font-heading text-neon-cyan glow-text">
            Market Overview
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-muted-foreground">
              Real-time cryptocurrency prices and trading signals
            </p>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-1 rounded-full border border-border/50 bg-background-elevated/50">
                <Clock className="h-3 w-3" />
                Last updated: {formatLastUpdated(lastUpdated)}
                {isFetching && (
                  <Loader2 className="h-3 w-3 animate-spin ml-1" />
                )}
              </span>
            )}
            {/* Live setup count badge */}
            {cryptos && cryptos.length > 0 && (
              <span
                className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full border font-heading transition-colors duration-300 ${
                  setupCount > 0
                    ? "border-neon-green/40 text-neon-green bg-neon-green/10"
                    : "border-border/50 text-muted-foreground bg-background-elevated/50"
                }`}
                data-ocid="dashboard.badge"
              >
                <Zap className="h-3 w-3" />
                {setupCount > 0
                  ? `${setupCount} Setups · ${buyCount}B ${sellCount}S`
                  : "0 Setups"}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-heading">
            Timeframe:
          </span>
          <TimeframeSelector selected={timeframe} onSelect={setTimeframe} />
        </div>
      </div>

      <TradeSetupScanner cryptos={cryptos || []} />
      <MarketSentimentPanel cryptos={cryptos || []} />
      <CryptoTable cryptos={cryptos || []} timeframe={timeframe} />
    </div>
  );
}
