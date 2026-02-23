import { useJournal } from '@/hooks/useJournal';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, Plus } from 'lucide-react';
import JournalStats from '@/components/JournalStats';
import JournalFilters from '@/components/JournalFilters';
import TradeCard from '@/components/TradeCard';
import AddTradeDialog from '@/components/AddTradeDialog';
import { useState } from 'react';

export default function Journal() {
  const { identity, login } = useInternetIdentity();
  const { data: trades, isLoading, filters, setFilters } = useJournal();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!identity) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">Please login to view and manage your trading journal</p>
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
        <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading journal...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
          <p className="text-muted-foreground mt-1">Track and analyze your trading performance</p>
        </div>
        <AddTradeDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>

      {trades && trades.length > 0 ? (
        <>
          <JournalStats trades={trades} />
          <JournalFilters filters={filters} onFiltersChange={setFilters} />
          <div className="grid gap-4">
            {trades.map((trade) => (
              <TradeCard key={Number(trade.id)} trade={trade} />
            ))}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <p className="text-muted-foreground">No trades recorded yet. Start logging your trades to track performance.</p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Trade
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
