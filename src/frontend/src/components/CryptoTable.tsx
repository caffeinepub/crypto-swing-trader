import { Link } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import type { CryptoMarketData } from '@/services/coingecko';
import SignalBadge from './SignalBadge';
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators';
import { generateTradingSignals } from '@/utils/tradingSignals';

interface CryptoTableProps {
  cryptos: CryptoMarketData[];
}

function CryptoRow({ crypto }: { crypto: CryptoMarketData }) {
  const { identity } = useInternetIdentity();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { data: indicators } = useTechnicalIndicators(crypto.id, '4H');
  const inWatchlist = isInWatchlist(crypto.id);

  const signals = indicators ? generateTradingSignals(indicators) : [];
  const primarySignal = signals.find((s) => s.type !== 'hold') || signals[0];

  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!identity) return;

    try {
      if (inWatchlist) {
        await removeFromWatchlist(crypto.id);
      } else {
        await addToWatchlist(crypto.id);
      }
    } catch (error) {
      console.error('Failed to update watchlist:', error);
    }
  };

  return (
    <TableRow className="hover:bg-muted/50 cursor-pointer">
      <TableCell>
        {identity && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleWatchlistToggle}
          >
            <Star className={`h-4 w-4 ${inWatchlist ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </Button>
        )}
      </TableCell>
      <TableCell className="font-medium">{crypto.market_cap_rank}</TableCell>
      <TableCell>
        <Link to="/crypto/$cryptoId" params={{ cryptoId: crypto.id }} className="flex items-center gap-2">
          <img src={crypto.image} alt={crypto.name} className="h-6 w-6" />
          <div>
            <div className="font-medium">{crypto.name}</div>
            <div className="text-xs text-muted-foreground">{crypto.symbol.toUpperCase()}</div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-right font-mono">${crypto.current_price.toLocaleString()}</TableCell>
      <TableCell className="text-right">
        <span
          className={`font-semibold ${
            crypto.price_change_percentage_24h >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
          {crypto.price_change_percentage_24h.toFixed(2)}%
        </span>
      </TableCell>
      <TableCell className="text-right font-mono hidden lg:table-cell">
        ${(crypto.total_volume / 1e9).toFixed(2)}B
      </TableCell>
      <TableCell className="text-right font-mono hidden xl:table-cell">
        ${(crypto.market_cap / 1e9).toFixed(2)}B
      </TableCell>
      <TableCell>{primarySignal && <SignalBadge signal={primarySignal} />}</TableCell>
    </TableRow>
  );
}

export default function CryptoTable({ cryptos }: CryptoTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="w-16">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">24h %</TableHead>
            <TableHead className="text-right hidden lg:table-cell">Volume</TableHead>
            <TableHead className="text-right hidden xl:table-cell">Market Cap</TableHead>
            <TableHead>Signal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cryptos.map((crypto) => (
            <CryptoRow key={crypto.id} crypto={crypto} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
