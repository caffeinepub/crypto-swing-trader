import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import { toast } from 'sonner';
import { Direction } from '@/backend';
import type { Trade } from '@/backend';

interface TradeCardProps {
  trade: Trade;
}

export default function TradeCard({ trade }: TradeCardProps) {
  const { removeTrade } = useJournal();
  const exitPrice = trade.exitPrice || 0;
  const pl = (exitPrice - trade.entryPrice) * trade.quantity;
  const plPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;

  const handleRemove = async () => {
    try {
      await removeTrade(trade.id);
      toast.success('Trade removed');
    } catch (error) {
      toast.error('Failed to remove trade');
    }
  };

  const isLong = trade.direction === Direction.long_;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          {isLong ? (
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          {trade.crypto}
        </CardTitle>
        <div className="flex items-center gap-2">
          {trade.exitPrice && (
            <Badge variant={pl >= 0 ? 'default' : 'destructive'}>
              {pl >= 0 ? '+' : ''}${pl.toFixed(2)} ({plPercent.toFixed(2)}%)
            </Badge>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Entry Price</div>
            <div className="font-mono font-semibold">${trade.entryPrice.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Exit Price</div>
            <div className="font-mono font-semibold">{trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : 'Open'}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Quantity</div>
            <div className="font-mono">{trade.quantity}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Date</div>
            <div className="font-mono">{trade.date}</div>
          </div>
        </div>

        {trade.rationale && (
          <div className="text-sm">
            <div className="text-muted-foreground mb-1">Rationale</div>
            <div>{trade.rationale}</div>
          </div>
        )}

        {trade.notes && (
          <div className="text-sm">
            <div className="text-muted-foreground mb-1">Notes</div>
            <div className="text-muted-foreground">{trade.notes}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
