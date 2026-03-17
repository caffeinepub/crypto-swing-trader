import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { CryptoMarketData } from "@/services/coingecko";
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
}

export function getPriceSignal(crypto: CryptoMarketData): PriceSignal {
  const change = crypto.price_change_percentage_24h;
  const volumeRatio = crypto.total_volume / (crypto.market_cap || 1);
  const highVolume = volumeRatio > 0.05;

  if (change <= -8) {
    return {
      type: "buy",
      label: "Strong Buy",
      reason: `Down ${Math.abs(change).toFixed(1)}% in 24h — potential oversold bounce${highVolume ? " with high volume" : ""}`,
      priority: 1,
    };
  }
  if (change <= -3) {
    return {
      type: "buy",
      label: "Buy",
      reason: `Down ${Math.abs(change).toFixed(1)}% in 24h — pullback opportunity`,
      priority: 2,
    };
  }
  if (change >= 8) {
    return {
      type: "sell",
      label: "Strong Sell",
      reason: `Up ${change.toFixed(1)}% in 24h — potential overbought${highVolume ? " with high volume" : ""}`,
      priority: 3,
    };
  }
  if (change >= 3) {
    return {
      type: "sell",
      label: "Sell",
      reason: `Up ${change.toFixed(1)}% in 24h — consider taking profits`,
      priority: 4,
    };
  }
  return {
    type: "neutral",
    label: "Neutral",
    reason: "No strong directional signal — price action consolidating",
    priority: 99,
  };
}

interface TradeSetupScannerProps {
  cryptos: CryptoMarketData[];
}

export default function TradeSetupScanner({ cryptos }: TradeSetupScannerProps) {
  const setups = cryptos
    .map((crypto) => ({ crypto, signal: getPriceSignal(crypto) }))
    .filter(({ signal }) => signal.type !== "neutral")
    .sort((a, b) => a.signal.priority - b.signal.priority);

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

                return (
                  <Link
                    key={crypto.id}
                    to="/crypto/$cryptoId"
                    params={{ cryptoId: crypto.id }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-background-elevated/50 transition-all duration-200 group"
                    style={{
                      boxShadow: undefined,
                    }}
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
