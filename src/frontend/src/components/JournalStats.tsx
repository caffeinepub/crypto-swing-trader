import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Trade } from '@/backend';

interface JournalStatsProps {
  trades: Trade[];
}

export default function JournalStats({ trades }: JournalStatsProps) {
  const completedTrades = trades.filter((t) => t.exitPrice !== undefined);
  const totalTrades = completedTrades.length;

  const profitableTrades = completedTrades.filter((t) => {
    const exitPrice = t.exitPrice || 0;
    return exitPrice > t.entryPrice;
  }).length;

  const winRate = totalTrades > 0 ? (profitableTrades / totalTrades) * 100 : 0;

  const totalPL = completedTrades.reduce((sum, t) => {
    const exitPrice = t.exitPrice || 0;
    return sum + (exitPrice - t.entryPrice) * t.quantity;
  }, 0);

  const avgPL = totalTrades > 0 ? totalPL / totalTrades : 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalTrades}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{winRate.toFixed(1)}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total P/L</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${totalPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${totalPL.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg P/L</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${avgPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${avgPL.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
