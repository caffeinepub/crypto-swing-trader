import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TechnicalIndicators } from "@/utils/technicalIndicators";
import { Info } from "lucide-react";

interface IndicatorsPanelProps {
  indicators: TechnicalIndicators;
}

function InfoTooltip({ content }: { content: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help hover:text-neon-cyan transition-colors" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs border-neon-cyan/30 bg-card">
          <p className="text-xs leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function IndicatorsPanel({ indicators }: IndicatorsPanelProps) {
  const rsiColor =
    indicators.rsi < 30
      ? "text-neon-green glow-text"
      : indicators.rsi > 70
        ? "text-neon-red glow-text"
        : "text-muted-foreground";

  const isRsiExtreme = indicators.rsi < 30 || indicators.rsi > 70;

  const rsiStatus =
    indicators.rsi < 30
      ? {
          label: "Oversold",
          color: "border-neon-green/50 text-neon-green bg-neon-green/10",
          action: "Potential buy zone - price may bounce up",
        }
      : indicators.rsi > 70
        ? {
            label: "Overbought",
            color: "border-neon-red/50 text-neon-red bg-neon-red/10",
            action: "Potential sell zone - price may pull back",
          }
        : indicators.rsi > 55
          ? {
              label: "Bullish",
              color: "border-neon-yellow/50 text-neon-yellow bg-neon-yellow/10",
              action: "Moderate upward momentum",
            }
          : indicators.rsi < 45
            ? {
                label: "Bearish",
                color:
                  "border-neon-purple/50 text-neon-purple bg-neon-purple/10",
                action: "Moderate downward pressure",
              }
            : {
                label: "Neutral",
                color: "border-border text-muted-foreground bg-muted/20",
                action: "No strong directional bias",
              };

  const macdBullish = indicators.macd.histogram > 0;
  const macdTrend = macdBullish
    ? "Bullish momentum - buyers in control"
    : "Bearish momentum - sellers in control";

  const pricevsSMA =
    indicators.sma20 > 0
      ? indicators.sma20 > indicators.sma50
        ? "Short-term trend above long-term (bullish)"
        : "Short-term trend below long-term (bearish)"
      : "Calculating...";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {/* RSI */}
      <Card
        className={`border-neon-cyan/30 bg-card ${isRsiExtreme ? "glow-pulse" : "glow-ambient"}`}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium font-heading text-neon-cyan flex items-center gap-2">
            RSI (14)
            <InfoTooltip content="Relative Strength Index (0-100). Below 30 = oversold (potential buy). Above 70 = overbought (potential sell). Between 30-70 = neutral." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className={`text-3xl font-bold font-mono ${rsiColor}`}>
              {indicators.rsi.toFixed(2)}
            </div>
            <div className="space-y-2">
              <Badge variant="outline" className={`text-xs ${rsiStatus.color}`}>
                {rsiStatus.label}
              </Badge>
              <p className="text-xs text-muted-foreground">
                {rsiStatus.action}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MACD */}
      <Card className="border-neon-cyan/30 bg-card glow-ambient">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium font-heading text-neon-cyan flex items-center gap-2">
            MACD
            <InfoTooltip content="Moving Average Convergence Divergence. Measures momentum. When MACD crosses above Signal line = bullish. Below = bearish. Histogram shows the strength of the crossover." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MACD:</span>
              <span className="font-mono text-foreground">
                {indicators.macd.macd.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Signal:</span>
              <span className="font-mono text-foreground">
                {indicators.macd.signal.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Histogram:</span>
              <span
                className={`font-mono font-semibold ${
                  macdBullish
                    ? "text-neon-green glow-text"
                    : "text-neon-red glow-text"
                }`}
              >
                {indicators.macd.histogram > 0 ? "+" : ""}
                {indicators.macd.histogram.toFixed(4)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
              {macdTrend}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Moving Averages */}
      <Card className="border-neon-cyan/30 bg-card glow-ambient">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium font-heading text-neon-cyan flex items-center gap-2">
            Moving Averages
            <InfoTooltip content="Average price over a period. SMA20 = 20-period average. SMA50 = 50-period average. When price is above these levels it's bullish, below is bearish." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMA 20:</span>
              <span className="font-mono text-foreground">
                $
                {indicators.sma20.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMA 50:</span>
              <span className="font-mono text-foreground">
                $
                {indicators.sma50.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">EMA 20:</span>
              <span className="font-mono text-foreground">
                $
                {indicators.ema20.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
              {pricevsSMA}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bollinger Bands */}
      <Card className="md:col-span-2 lg:col-span-3 border-neon-cyan/30 bg-card glow-ambient">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium font-heading text-neon-cyan flex items-center gap-2">
            Bollinger Bands
            <InfoTooltip content="Three lines around price. Middle = 20-period average. Upper/Lower bands show high or low price zones. Price touching Lower Band = potential buy. Touching Upper Band = potential sell." />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Upper Band</div>
              <div className="font-mono font-semibold text-neon-red">
                $
                {indicators.bollingerBands.upper.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                Sell zone if price reaches here
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Middle (Avg)</div>
              <div className="font-mono font-semibold text-foreground">
                $
                {indicators.bollingerBands.middle.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                20-period average price
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Lower Band</div>
              <div className="font-mono font-semibold text-neon-green">
                $
                {indicators.bollingerBands.lower.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                Buy zone if price reaches here
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
