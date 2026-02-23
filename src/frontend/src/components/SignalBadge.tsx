import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TradingSignal } from '@/utils/tradingSignals';

interface SignalBadgeProps {
  signal: TradingSignal;
}

export default function SignalBadge({ signal }: SignalBadgeProps) {
  const Icon = signal.type === 'buy' ? TrendingUp : signal.type === 'sell' ? TrendingDown : Minus;

  const variant = signal.type === 'buy' ? 'default' : signal.type === 'sell' ? 'destructive' : 'secondary';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className="gap-1 cursor-help">
            <Icon className="h-3 w-3" />
            {signal.type.toUpperCase()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{signal.reason}</p>
            <p className="text-xs text-muted-foreground">
              Confidence: {signal.confidence} | {signal.indicator}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
