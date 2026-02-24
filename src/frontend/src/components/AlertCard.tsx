import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react';
import type { Alert } from '@/backend';
import { SignalType } from '@/backend';

interface AlertCardProps {
  alert: Alert;
  cryptos: Array<{ id: string; name: string; symbol: string; image: string }>;
}

export default function AlertCard({ alert, cryptos }: AlertCardProps) {
  const crypto = cryptos.find((c) => c.id === alert.crypto);
  const cryptoName = crypto?.name || alert.crypto.toUpperCase();
  const cryptoSymbol = crypto?.symbol.toUpperCase() || alert.crypto.toUpperCase();
  const cryptoImage = crypto?.image;

  const signalType =
    alert.signalType === SignalType.buy ? 'buy' : alert.signalType === SignalType.sell ? 'sell' : 'hold';

  const Icon = signalType === 'buy' ? TrendingUp : signalType === 'sell' ? TrendingDown : Minus;

  const variant = signalType === 'buy' ? 'default' : signalType === 'sell' ? 'destructive' : 'secondary';

  const timestamp = new Date(Number(alert.timestamp) / 1000000);
  const formattedDate = timestamp.toLocaleDateString();
  const formattedTime = timestamp.toLocaleTimeString();

  const getTriggerReasonText = () => {
    if (!alert.triggerReason) return 'Signal detected';

    const reason = alert.triggerReason;
    if ('rsiBelow30' in reason) return reason.rsiBelow30;
    if ('rsiAbove70' in reason) return reason.rsiAbove70;
    if ('macdCrossover' in reason) return reason.macdCrossover;
    if ('priceBreak' in reason) return reason.priceBreak;
    if ('stopLoss' in reason) return `Stop Loss: $${reason.stopLoss}`;
    if ('takeProfit' in reason) return `Take Profit: $${reason.takeProfit}`;
    if ('riskReward' in reason) return `Risk/Reward: ${reason.riskReward}`;
    if ('trendFollowing' in reason) return reason.trendFollowing ? 'Trend Following' : 'Trend Reversal';
    return 'Signal detected';
  };

  const getSignalGlow = () => {
    if (signalType === 'buy') return 'glow-green';
    if (signalType === 'sell') return 'glow-red';
    return 'glow-ambient';
  };

  const getSignalBorderColor = () => {
    if (signalType === 'buy') return 'border-neon-green/40';
    if (signalType === 'sell') return 'border-neon-red/40';
    return 'border-neon-cyan/30';
  };

  const getSignalTextColor = () => {
    if (signalType === 'buy') return 'text-neon-green';
    if (signalType === 'sell') return 'text-neon-red';
    return 'text-neon-cyan';
  };

  return (
    <Card className={`border ${getSignalBorderColor()} bg-card/80 ${getSignalGlow()} transition-all duration-300 hover:scale-[1.02] animate-fade-in relative overflow-hidden`}>
      <div className="absolute inset-0 scanline-effect opacity-20 pointer-events-none"></div>
      <CardContent className="p-4 space-y-3 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {cryptoImage && (
              <img src={cryptoImage} alt={cryptoName} className="h-10 w-10 rounded-full flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground truncate">{cryptoName}</div>
              <div className="text-sm text-muted-foreground font-mono">{cryptoSymbol}</div>
            </div>
          </div>
          <Badge variant={variant} className={`flex-shrink-0 gap-1 font-heading ${getSignalTextColor()} glow-hover`}>
            <Icon className="h-3 w-3" />
            <span className="uppercase font-bold">{signalType}</span>
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Trigger:</span>
            <span className="font-medium text-foreground">{getTriggerReasonText()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-mono font-semibold text-foreground">${alert.priceAtTrigger.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Confidence:</span>
            <span className={`font-bold font-mono ${Number(alert.confidence) >= 70 ? 'text-neon-green' : Number(alert.confidence) >= 50 ? 'text-yellow-400' : 'text-neon-red'} glow-text`}>
              {Number(alert.confidence)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50 font-mono">
          <Clock className="h-3 w-3" />
          <span>
            {formattedDate} at {formattedTime}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
