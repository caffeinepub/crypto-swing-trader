import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TechnicalIndicators } from '@/utils/technicalIndicators';

interface IndicatorsPanelProps {
  indicators: TechnicalIndicators;
}

export default function IndicatorsPanel({ indicators }: IndicatorsPanelProps) {
  const rsiColor =
    indicators.rsi < 30
      ? 'text-neon-green glow-text'
      : indicators.rsi > 70
        ? 'text-neon-red glow-text'
        : 'text-muted-foreground';

  const isRsiExtreme = indicators.rsi < 30 || indicators.rsi > 70;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      <Card className={`border-neon-cyan/30 bg-card ${isRsiExtreme ? 'glow-pulse' : 'glow-ambient'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium font-heading text-neon-cyan">RSI (14)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className={`text-3xl font-bold font-mono ${rsiColor}`}>{indicators.rsi.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground font-heading">
              {indicators.rsi < 30 ? 'Oversold' : indicators.rsi > 70 ? 'Overbought' : 'Neutral'}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neon-cyan/30 bg-card glow-ambient">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium font-heading text-neon-cyan">MACD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">MACD:</span>
              <span className="font-mono text-foreground">{indicators.macd.macd.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Signal:</span>
              <span className="font-mono text-foreground">{indicators.macd.signal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Histogram:</span>
              <span
                className={`font-mono ${
                  indicators.macd.histogram > 0
                    ? 'text-neon-green glow-text'
                    : 'text-neon-red glow-text'
                }`}
              >
                {indicators.macd.histogram.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neon-cyan/30 bg-card glow-ambient">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium font-heading text-neon-cyan">Moving Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMA 20:</span>
              <span className="font-mono text-foreground">${indicators.sma20.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SMA 50:</span>
              <span className="font-mono text-foreground">${indicators.sma50.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">EMA 20:</span>
              <span className="font-mono text-foreground">${indicators.ema20.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3 border-neon-cyan/30 bg-card glow-ambient">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium font-heading text-neon-cyan">Bollinger Bands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Upper</div>
              <div className="font-mono font-semibold text-neon-purple glow-text">${indicators.bollingerBands.upper.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Middle</div>
              <div className="font-mono font-semibold text-foreground">${indicators.bollingerBands.middle.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Lower</div>
              <div className="font-mono font-semibold text-neon-purple glow-text">${indicators.bollingerBands.lower.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
