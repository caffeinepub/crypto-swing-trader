import PriceTargetDialog from "@/components/PriceTargetDialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { usePriceTargets } from "@/hooks/usePriceTargets";
import type { CryptoMarketData } from "@/services/coingecko";
import { Link } from "@tanstack/react-router";
import { Bell, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";

interface CryptoTableProps {
  cryptos: CryptoMarketData[];
  timeframe?: "15m" | "1H" | "4H" | "Daily";
}

// Generate signal from price data only - no extra API calls needed
function getPriceSignal(crypto: CryptoMarketData): {
  type: "buy" | "sell" | "neutral";
  label: string;
  reason: string;
} {
  const change = crypto.price_change_percentage_24h;
  const volumeRatio = crypto.total_volume / (crypto.market_cap || 1);
  const highVolume = volumeRatio > 0.05;

  if (change <= -8) {
    return {
      type: "buy",
      label: "Strong Buy",
      reason: `Down ${Math.abs(change).toFixed(1)}% in 24h - potential oversold bounce${highVolume ? " with high volume" : ""}`,
    };
  }
  if (change <= -3) {
    return {
      type: "buy",
      label: "Buy",
      reason: `Down ${Math.abs(change).toFixed(1)}% in 24h - pullback opportunity`,
    };
  }
  if (change >= 8) {
    return {
      type: "sell",
      label: "Strong Sell",
      reason: `Up ${change.toFixed(1)}% in 24h - potential overbought${highVolume ? " with high volume" : ""}`,
    };
  }
  if (change >= 3) {
    return {
      type: "sell",
      label: "Sell",
      reason: `Up ${change.toFixed(1)}% in 24h - consider taking profits`,
    };
  }
  return {
    type: "neutral",
    label: "Neutral",
    reason: "No strong directional signal - price action consolidating",
  };
}

function CryptoRow({
  crypto,
  activeTargetCoinIds,
}: {
  crypto: CryptoMarketData;
  activeTargetCoinIds: Set<string>;
}) {
  const signal = getPriceSignal(crypto);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const hasActiveTarget = activeTargetCoinIds.has(crypto.id);

  const signalColors = {
    buy: "border-neon-green/50 text-neon-green bg-neon-green/10",
    sell: "border-neon-red/50 text-neon-red bg-neon-red/10",
    neutral: "border-border text-muted-foreground bg-muted/20",
  };

  const SignalIcon =
    signal.type === "buy"
      ? TrendingUp
      : signal.type === "sell"
        ? TrendingDown
        : Minus;

  return (
    <>
      <TableRow className="hover:bg-card/80 cursor-pointer transition-all duration-300 hover:glow-hover border-b border-border/50">
        <TableCell className="font-medium font-mono text-muted-foreground">
          {crypto.market_cap_rank}
        </TableCell>
        <TableCell>
          <Link
            to="/crypto/$cryptoId"
            params={{ cryptoId: crypto.id }}
            className="flex items-center gap-2 group"
          >
            <img
              src={crypto.image}
              alt={crypto.name}
              className="h-6 w-6 transition-all duration-300 group-hover:scale-110"
            />
            <div>
              <div className="font-medium group-hover:text-neon-cyan transition-colors duration-300">
                {crypto.name}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {crypto.symbol.toUpperCase()}
              </div>
            </div>
          </Link>
        </TableCell>
        <TableCell className="text-right font-mono text-foreground font-semibold">
          ${crypto.current_price.toLocaleString()}
        </TableCell>
        <TableCell className="text-right">
          <span
            className={`font-semibold font-mono ${
              crypto.price_change_percentage_24h >= 0
                ? "text-neon-green glow-text"
                : "text-neon-red glow-text"
            }`}
          >
            {crypto.price_change_percentage_24h >= 0 ? "+" : ""}
            {crypto.price_change_percentage_24h.toFixed(2)}%
          </span>
        </TableCell>
        <TableCell className="text-right font-mono hidden lg:table-cell text-muted-foreground">
          ${(crypto.total_volume / 1e9).toFixed(2)}B
        </TableCell>
        <TableCell className="text-right font-mono hidden xl:table-cell text-muted-foreground">
          ${(crypto.market_cap / 1e9).toFixed(2)}B
        </TableCell>
        <TableCell>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1 cursor-default ${signalColors[signal.type]}`}
                  >
                    <SignalIcon className="h-3 w-3" />
                    <span className="text-xs font-heading">{signal.label}</span>
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="max-w-xs border-neon-cyan/30 bg-card"
              >
                <p className="text-xs">{signal.reason}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click the coin for full technical analysis
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setDialogOpen(true)}
                  className={`p-1.5 rounded transition-all duration-200 ${
                    hasActiveTarget
                      ? "text-neon-cyan glow-icon hover:bg-neon-cyan/20"
                      : "text-muted-foreground/40 hover:text-neon-cyan/70 hover:bg-neon-cyan/10"
                  }`}
                  data-ocid="crypto_table.open_modal_button"
                >
                  <Bell className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="border-neon-cyan/30 bg-card"
              >
                <p className="text-xs">
                  {!identity
                    ? "Sign in to set price alerts"
                    : hasActiveTarget
                      ? "Active price alert — click to set another"
                      : "Set price alert"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      </TableRow>
      <PriceTargetDialog
        coin={crypto}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}

export default function CryptoTable({ cryptos }: CryptoTableProps) {
  const { targets } = usePriceTargets();
  const activeTargetCoinIds = new Set(
    targets.filter((t) => !t.triggered).map((t) => t.coinId),
  );

  return (
    <div className="rounded-lg border border-neon-cyan/30 bg-card glow-ambient overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-neon-cyan/30 bg-background-elevated/50">
            <TableHead className="w-16 font-heading text-neon-cyan">
              #
            </TableHead>
            <TableHead className="font-heading text-neon-cyan">Name</TableHead>
            <TableHead className="text-right font-heading text-neon-cyan">
              Price
            </TableHead>
            <TableHead className="text-right font-heading text-neon-cyan">
              24h %
            </TableHead>
            <TableHead className="text-right hidden lg:table-cell font-heading text-neon-cyan">
              Volume
            </TableHead>
            <TableHead className="text-right hidden xl:table-cell font-heading text-neon-cyan">
              Market Cap
            </TableHead>
            <TableHead className="font-heading text-neon-cyan">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help border-b border-dotted border-neon-cyan/50">
                      Signal
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="border-neon-cyan/30 bg-card max-w-xs">
                    <p className="text-xs">
                      Price-action signal based on 24h momentum. Click any coin
                      for full RSI/MACD analysis.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
            <TableHead className="w-10 font-heading text-neon-cyan">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <Bell className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="border-neon-cyan/30 bg-card">
                    <p className="text-xs">Set price target alert</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cryptos.map((crypto) => (
            <CryptoRow
              key={crypto.id}
              crypto={crypto}
              activeTargetCoinIds={activeTargetCoinIds}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
