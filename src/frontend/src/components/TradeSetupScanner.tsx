import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CryptoMarketData } from "@/services/coingecko";
import type { TechnicalIndicators } from "@/utils/technicalIndicators";
import {
  calculateCompositeScore,
  generateTradingSignals,
} from "@/utils/tradingSignals";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export interface PriceSignal {
  type: "buy" | "sell" | "neutral";
  label: string;
  reason: string;
  priority: number;
  source: "indicators" | "price-action";
  compositeScore?: number;
  timeframe?: string;
}

/**
 * Generate a signal from cached technical indicators when available.
 * Returns null if no actionable signals detected.
 */
function getIndicatorSignal(
  crypto: CryptoMarketData,
  indicators: TechnicalIndicators,
  timeframe?: string,
): PriceSignal | null {
  const signals = generateTradingSignals(indicators, crypto.current_price);
  const buySignals = signals.filter((s) => s.type === "buy");
  const sellSignals = signals.filter((s) => s.type === "sell");

  if (buySignals.length === 0 && sellSignals.length === 0) return null;

  const isBuy = buySignals.length >= sellSignals.length;
  const dominant = isBuy ? buySignals : sellSignals;
  const strongest = dominant.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  })[0];

  const isHighConf = strongest.confidence === "high";
  const label = isBuy
    ? isHighConf
      ? "Strong Buy"
      : "Buy"
    : isHighConf
      ? "Strong Sell"
      : "Sell";

  const reasonParts = dominant.slice(0, 2).map((s) => s.indicator);
  const reason = `${strongest.reason} (${reasonParts.join(", ")})`;

  // Composite score for sorting and badge display
  const composite = calculateCompositeScore(indicators, crypto.current_price);

  return {
    type: isBuy ? "buy" : "sell",
    label,
    reason,
    priority: isHighConf ? 1 : 2,
    source: "indicators",
    compositeScore: composite.score,
    timeframe,
  };
}

export function getPriceSignal(crypto: CryptoMarketData): PriceSignal {
  const change = crypto.price_change_percentage_24h;
  const volumeRatio = crypto.total_volume / (crypto.market_cap || 1);
  const highVolume = volumeRatio > 0.05;

  if (change <= -8) {
    return {
      type: "buy",
      label: "Strong Buy",
      reason: `Down ${Math.abs(change).toFixed(1)}% in 24h — potential oversold bounce${
        highVolume ? " with high volume" : ""
      }`,
      priority: 1,
      source: "price-action",
    };
  }
  if (change <= -3) {
    return {
      type: "buy",
      label: "Buy",
      reason: `Down ${Math.abs(change).toFixed(1)}% in 24h — pullback opportunity`,
      priority: 2,
      source: "price-action",
    };
  }
  if (change >= 8) {
    return {
      type: "sell",
      label: "Strong Sell",
      reason: `Up ${change.toFixed(1)}% in 24h — potential overbought${
        highVolume ? " with high volume" : ""
      }`,
      priority: 3,
      source: "price-action",
    };
  }
  if (change >= 3) {
    return {
      type: "sell",
      label: "Sell",
      reason: `Up ${change.toFixed(1)}% in 24h — consider taking profits`,
      priority: 4,
      source: "price-action",
    };
  }
  return {
    type: "neutral",
    label: "Neutral",
    reason: "No strong directional signal — price action consolidating",
    priority: 99,
    source: "price-action",
  };
}

export interface IndicatorsCacheEntry {
  indicators: TechnicalIndicators;
  timeframe: string;
}

interface TradeSetupScannerProps {
  cryptos: CryptoMarketData[];
  /** Optional map of coinId -> cached TechnicalIndicators + timeframe from React Query */
  indicatorsCache?: Map<string, IndicatorsCacheEntry>;
}

export default function TradeSetupScanner({
  cryptos,
  indicatorsCache,
}: TradeSetupScannerProps) {
  const setups = cryptos
    .map((crypto) => {
      const cached = indicatorsCache?.get(crypto.id);
      const signal = cached
        ? (getIndicatorSignal(crypto, cached.indicators, cached.timeframe) ??
          getPriceSignal(crypto))
        : getPriceSignal(crypto);
      return { crypto, signal };
    })
    .filter(({ signal }) => signal.type !== "neutral")
    .sort((a, b) => {
      // Prefer composite score sort for indicator-based signals
      const aScore = a.signal.compositeScore;
      const bScore = b.signal.compositeScore;
      if (aScore !== undefined && bScore !== undefined) {
        return bScore - aScore; // higher score first
      }
      if (aScore !== undefined) return -1; // indicator signals first
      if (bScore !== undefined) return 1;
      return a.signal.priority - b.signal.priority;
    });

  const count = setups.length;
  const [open, setOpen] = useState(count > 0);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-lg border border-neon-cyan/30 bg-card glow-ambient animate-fade-in"
      data-ocid="scanner.panel"
    >
      <CollapsibleTrigger
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-background-elevated/40 transition-colors duration-200 group"
        data-ocid="scanner.toggle"
      >
        <div className="flex items-center gap-3">
          <span className="font-heading text-neon-cyan text-base tracking-wide glow-text">
            Trade Setup Scanner
          </span>
          <Badge
            variant="outline"
            className={
              count > 0
                ? "border-neon-green/50 text-neon-green bg-neon-green/10 font-heading text-xs"
                : "border-border text-muted-foreground bg-muted/20 font-heading text-xs"
            }
            data-ocid="scanner.badge"
          >
            {count > 0 ? `${count} Found` : "0 Found"}
          </Badge>
          {count > 0 && (
            <span className="hidden sm:inline text-xs text-muted-foreground">
              {setups.filter((s) => s.signal.type === "buy").length} buy ·{" "}
              {setups.filter((s) => s.signal.type === "sell").length} sell
            </span>
          )}
        </div>
        <div className="text-muted-foreground group-hover:text-neon-cyan transition-colors duration-200">
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-t border-neon-cyan/20">
          {count === 0 ? (
            <div
              className="px-4 py-6 text-center text-muted-foreground text-sm"
              data-ocid="scanner.empty_state"
            >
              No active setups right now. Market is consolidating.
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {setups.map(({ crypto, signal }, idx) => {
                const isBuy = signal.type === "buy";
                const SignalIcon = isBuy ? TrendingUp : TrendingDown;
                const signalClass = isBuy
                  ? "border-neon-green/50 text-neon-green bg-neon-green/10"
                  : "border-neon-red/50 text-neon-red bg-neon-red/10";
                const cachedEntry = indicatorsCache?.get(crypto.id);
                const hasDivergence =
                  cachedEntry?.indicators?.divergence?.bullish ||
                  cachedEntry?.indicators?.divergence?.bearish;

                return (
                  <Link
                    key={crypto.id}
                    to="/crypto/$cryptoId"
                    params={{ cryptoId: crypto.id }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-background-elevated/50 transition-all duration-200 group"
                    data-ocid={`scanner.item.${idx + 1}`}
                  >
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="h-7 w-7 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground group-hover:text-neon-cyan transition-colors duration-200">
                          {crypto.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {crypto.symbol.toUpperCase()}
                        </span>
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1 text-xs font-heading ${signalClass}`}
                        >
                          <SignalIcon className="h-3 w-3" />
                          {signal.label}
                        </Badge>
                        {signal.source === "indicators" && (
                          <span className="text-xs text-neon-purple/70 font-mono">
                            ⚡ RSI/MACD
                          </span>
                        )}
                        {signal.timeframe && (
                          <span className="text-xs text-muted-foreground font-mono border border-border/50 px-1 rounded">
                            {signal.timeframe}
                          </span>
                        )}
                        {hasDivergence && (
                          <span
                            className="text-xs text-neon-yellow/80 font-mono"
                            title="RSI divergence detected"
                          >
                            ◆ DIV
                          </span>
                        )}
                        {signal.compositeScore !== undefined && (
                          <span
                            className={`text-xs font-mono font-bold ${
                              signal.compositeScore >= 70
                                ? "text-neon-cyan"
                                : signal.compositeScore >= 40
                                  ? "text-neon-cyan/70"
                                  : "text-neon-cyan/50"
                            }`}
                            title={`Composite signal score: ${signal.compositeScore}/100`}
                          >
                            {signal.compositeScore}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {signal.reason}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`text-sm font-mono font-semibold ${
                          crypto.price_change_percentage_24h >= 0
                            ? "text-neon-green"
                            : "text-neon-red"
                        }`}
                      >
                        {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
                        {crypto.price_change_percentage_24h.toFixed(2)}%
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-neon-cyan group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
