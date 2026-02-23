import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { toast } from 'sonner';
import type { CryptoMarketData } from '@/services/coingecko';

interface AddPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cryptos: CryptoMarketData[];
}

export default function AddPositionDialog({ open, onOpenChange, cryptos }: AddPositionDialogProps) {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const { addPosition, isAdding } = usePortfolio();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symbol || !quantity) {
      toast.error('Please fill all fields');
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error('Invalid quantity');
      return;
    }

    try {
      await addPosition({ symbol, quantity: qty });
      toast.success('Position added');
      setSymbol('');
      setQuantity('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to add position');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Position
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Portfolio Position</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">Cryptocurrency</Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger id="symbol">
                <SelectValue placeholder="Select cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {cryptos.map((crypto) => (
                  <SelectItem key={crypto.id} value={crypto.symbol}>
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.00000001"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Position'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
