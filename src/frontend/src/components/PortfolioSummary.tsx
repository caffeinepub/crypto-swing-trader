import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PositionWithPrice } from '@/hooks/usePortfolio';

interface PortfolioSummaryProps {
  positions: PositionWithPrice[];
}

export default function PortfolioSummary({ positions }: PortfolioSummaryProps) {
  const totalValue = positions.reduce((sum, pos) => sum + pos.currentPrice * pos.quantity, 0);
  const totalPositions = positions.length;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalPositions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Position Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            ${totalPositions > 0 ? (totalValue / totalPositions).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
