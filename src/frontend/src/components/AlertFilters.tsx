import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { SignalType } from '@/backend';

interface AlertFiltersProps {
  cryptos: Array<{ id: string; name: string; symbol: string }>;
  filterCrypto: string | null;
  filterSignal: SignalType | null;
  onCryptoChange: (value: string | null) => void;
  onSignalChange: (value: SignalType | null) => void;
}

export default function AlertFilters({
  cryptos,
  filterCrypto,
  filterSignal,
  onCryptoChange,
  onSignalChange,
}: AlertFiltersProps) {
  const hasFilters = filterCrypto || filterSignal;

  const handleReset = () => {
    onCryptoChange(null);
    onSignalChange(null);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
        {/* Crypto Filter */}
        <Select value={filterCrypto || 'all'} onValueChange={(v) => onCryptoChange(v === 'all' ? null : v)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All Cryptocurrencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cryptocurrencies</SelectItem>
            {cryptos.slice(0, 20).map((crypto) => (
              <SelectItem key={crypto.id} value={crypto.id}>
                {crypto.name} ({crypto.symbol.toUpperCase()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Signal Type Filter */}
        <Select
          value={filterSignal || 'all'}
          onValueChange={(v) => {
            if (v === 'all') {
              onSignalChange(null);
            } else if (v === 'buy') {
              onSignalChange(SignalType.buy);
            } else if (v === 'sell') {
              onSignalChange(SignalType.sell);
            } else if (v === 'hold') {
              onSignalChange(SignalType.hold);
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Signals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Signals</SelectItem>
            <SelectItem value="buy">Buy Signals</SelectItem>
            <SelectItem value="sell">Sell Signals</SelectItem>
            <SelectItem value="hold">Hold Signals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasFilters && (
        <Button variant="outline" size="sm" onClick={handleReset} className="w-full sm:w-auto">
          <X className="h-4 w-4 mr-2" />
          Reset
        </Button>
      )}
    </div>
  );
}
