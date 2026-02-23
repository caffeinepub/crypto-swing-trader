import { usePortfolio } from '@/hooks/usePortfolio';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Plus } from 'lucide-react';
import PortfolioSummary from '@/components/PortfolioSummary';
import PositionCard from '@/components/PositionCard';
import AddPositionDialog from '@/components/AddPositionDialog';
import { useState } from 'react';

export default function Portfolio() {
  const { identity, login } = useInternetIdentity();
  const { data: positions, isLoading } = usePortfolio();
  const { data: cryptos } = useCryptoPrices();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!identity) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">Please login to view and manage your portfolio</p>
            <Button onClick={login} className="gap-2">
              <LogIn className="h-4 w-4" />
              Login with Internet Identity
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading portfolio...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const positionsWithPrices = positions?.map((pos) => {
    const crypto = cryptos?.find((c) => c.symbol.toLowerCase() === pos.symbol.toLowerCase());
    return {
      ...pos,
      currentPrice: crypto?.current_price || 0,
      name: crypto?.name || pos.symbol,
      image: crypto?.image,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground mt-1">Track your cryptocurrency holdings and performance</p>
        </div>
        <AddPositionDialog open={dialogOpen} onOpenChange={setDialogOpen} cryptos={cryptos || []} />
      </div>

      {positionsWithPrices && positionsWithPrices.length > 0 ? (
        <>
          <PortfolioSummary positions={positionsWithPrices} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {positionsWithPrices.map((position) => (
              <PositionCard key={position.symbol} position={position} />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">No positions yet. Add your first position to start tracking.</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Position
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
