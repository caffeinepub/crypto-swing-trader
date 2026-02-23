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

  const timestamp = new Date(Number(alert.timestamp) / 1000000); // Convert nanoseconds to milliseconds
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
    if ('trendFollowing' in reason) return reason.trendFollowing ? 'Trend Following' : 'Counter Trend';

    return 'Signal detected';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Crypto Info */}
          <div className="flex items-center gap-3 flex-1">
            {cryptoImage && <img src={cryptoImage} alt={cryptoName} className="h-10 w-10 rounded-full" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{cryptoName}</h3>
                <span className="text-sm text-muted-foreground">{cryptoSymbol}</span>
              </div>
              <p className="text-sm text-muted-foreground">${alert.priceAtTrigger.toFixed(2)}</p>
            </div>
          </div>

          {/* Signal Badge */}
          <div className="flex items-center gap-3">
            <Badge variant={variant} className="gap-1 px-3 py-1">
              <Icon className="h-4 w-4" />
              {signalType.toUpperCase()}
            </Badge>
          </div>

          {/* Details */}
          <div className="flex flex-col sm:items-end gap-1 sm:min-w-[200px]">
            <p className="text-sm font-medium">{getTriggerReasonText()}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formattedDate} {formattedTime}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Confidence: {Number(alert.confidence)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
