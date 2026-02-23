import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';
import { toast } from 'sonner';
import { Direction } from '@/backend';

interface AddTradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTradeDialog({ open, onOpenChange }: AddTradeDialogProps) {
  const [crypto, setCrypto] = useState('');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rationale, setRationale] = useState('');
  const [notes, setNotes] = useState('');
  const { addTrade } = useJournal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!crypto || !entryPrice || !quantity || !date) {
      toast.error('Please fill required fields');
      return;
    }

    const entry = parseFloat(entryPrice);
    const exit = exitPrice ? parseFloat(exitPrice) : undefined;
    const qty = parseFloat(quantity);

    if (isNaN(entry) || isNaN(qty) || qty <= 0) {
      toast.error('Invalid values');
      return;
    }

    try {
      const directionValue: Direction = direction === 'long' ? Direction.long_ : Direction.short_;

      await addTrade({
        id: BigInt(Date.now()),
        crypto,
        direction: directionValue,
        entryPrice: entry,
        exitPrice: exit,
        quantity: qty,
        date,
        rationale,
        outcome: exit ? (exit > entry ? 'profit' : 'loss') : 'open',
        notes,
      });

      toast.success('Trade added');
      setCrypto('');
      setEntryPrice('');
      setExitPrice('');
      setQuantity('');
      setRationale('');
      setNotes('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to add trade');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Trade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Trade to Journal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="crypto">Cryptocurrency *</Label>
            <Input id="crypto" placeholder="BTC" value={crypto} onChange={(e) => setCrypto(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select value={direction} onValueChange={(v) => setDirection(v as 'long' | 'short')}>
              <SelectTrigger id="direction">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">Long</SelectItem>
                <SelectItem value="short">Short</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price *</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit Price</Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.00000001"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rationale">Trade Rationale</Label>
            <Textarea
              id="rationale"
              placeholder="Why did you take this trade?"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Trade
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
