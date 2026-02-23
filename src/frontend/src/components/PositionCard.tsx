import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { usePortfolio, type PositionWithPrice } from '@/hooks/usePortfolio';
import { toast } from 'sonner';

interface PositionCardProps {
  position: PositionWithPrice;
}

export default function PositionCard({ position }: PositionCardProps) {
  const { removePosition, isRemoving } = usePortfolio();
  const currentValue = position.currentPrice * position.quantity;

  const handleRemove = async () => {
    try {
      await removePosition(position.symbol);
      toast.success('Position removed');
    } catch (error) {
      toast.error('Failed to remove position');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {position.image && <img src={position.image} alt={position.name} className="h-5 w-5" />}
          {position.name}
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemove} disabled={isRemoving}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Quantity:</span>
          <span className="font-mono">{position.quantity}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Current Price:</span>
          <span className="font-mono">${position.currentPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold pt-2 border-t">
          <span>Total Value:</span>
          <span className="font-mono">${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </CardContent>
    </Card>
  );
}
