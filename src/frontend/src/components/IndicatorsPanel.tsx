import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TechnicalIndicators } from '@/utils/technicalIndicators';

interface IndicatorsPanelProps {
  indicators: TechnicalIndicators;
}

export default function IndicatorsPanel({ indicators }: IndicatorsPanelProps) {
  const rsiColor =
    indicators.rsi < 30
      ? 'text-green-600 dark:text-green-400'
      : indicators.rsi > 70
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">RSI (14)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className={`text-3xl font-bold ${rsiColor}`}>{indicators.rsi.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">
              {indicators.rsi < 30 ? 'Oversold' : indicators.rsi > 70 ? 'Overbought' : 'Neutral'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">MACD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MACD:</span>
              <span className="font-mono">{indicators.macd.macd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Signal:</span>
              <span className="font-mono">{indicators.macd.signal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Histogram:</span>
              <span
                className={`font-mono ${
                  indicators.macd.histogram > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {indicators.macd.histogram.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Moving Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMA 20:</span>
              <span className="font-mono">${indicators.sma20.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMA 50:</span>
              <span className="font-mono">${indicators.sma50.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">EMA 20:</span>
              <span className="font-mono">${indicators.ema20.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Bollinger Bands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Upper</div>
              <div className="font-mono font-semibold">${indicators.bollingerBands.upper.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Middle</div>
              <div className="font-mono font-semibold">${indicators.bollingerBands.middle.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Lower</div>
              <div className="font-mono font-semibold">${indicators.bollingerBands.lower.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
