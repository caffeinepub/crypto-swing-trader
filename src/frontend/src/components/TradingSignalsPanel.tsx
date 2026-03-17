import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SupportResistanceLevel } from "@/utils/supportResistance";
import type { TradingSignal } from "@/utils/tradingSignals";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import SignalBadge from "./SignalBadge";

interface TradingSignalsPanelProps {
  signals: TradingSignal[];
  supportResistance?: SupportResistanceLevel[];
}

export default function TradingSignalsPanel({
  signals,
  supportResistance,
}: TradingSignalsPanelProps) {
  const _buySignals = signals.filter((s) => s.type === "buy");
  const _sellSignals = signals.filter((s) => s.type === "sell");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            Active Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {signals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signals detected</p>
          ) : (
            signals.map((signal, _i) => (
              <div
                key={`signal-${signal.indicator}-${signal.type}`}
                className="flex items-start gap-3"
              >
                <SignalBadge signal={signal} />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{signal.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {signal.indicator} • {signal.confidence} confidence
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Support & Resistance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {supportResistance && supportResistance.length > 0 ? (
            supportResistance.map((level) => (
              <div
                key={`sr-${level.type}-${level.price.toFixed(2)}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="capitalize">{level.type}</span>
                <span className="font-mono font-semibold">
                  ${level.price.toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No levels detected</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
