import { Link } from '@tanstack/react-router';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CryptoMarketData } from '@/services/coingecko';
import SignalBadge from './SignalBadge';
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators';
import { generateTradingSignals } from '@/utils/tradingSignals';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CryptoTableProps {
  cryptos: CryptoMarketData[];
  timeframe?: '1H' | '4H' | 'Daily';
}

function CryptoRow({ crypto, timeframe = '4H' }: { crypto: CryptoMarketData; timeframe?: '1H' | '4H' | 'Daily' }) {
  const { data: indicators, isLoading, error, refetch, isFetching } = useTechnicalIndicators(crypto.id, timeframe);

  const signals = indicators ? generateTradingSignals(indicators) : [];
  const primarySignal = signals.find((s) => s.type !== 'hold') || signals[0];

  // Show error state inline for this specific crypto
  if (error) {
    return (
      <TableRow className="hover:bg-card/80 border-b border-border/50">
        <TableCell className="font-medium font-mono text-muted-foreground">{crypto.market_cap_rank}</TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <img src={crypto.image} alt={crypto.name} className="h-6 w-6" />
            <div>
              <div className="font-medium">{crypto.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{crypto.symbol.toUpperCase()}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-right font-mono text-foreground font-semibold">${crypto.current_price.toLocaleString()}</TableCell>
        <TableCell className="text-right">
          <span
            className={`font-semibold font-mono ${
              crypto.price_change_percentage_24h >= 0
                ? 'text-neon-green glow-text'
                : 'text-neon-red glow-text'
            }`}
          >
            {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
            {crypto.price_change_percentage_24h.toFixed(2)}%
          </span>
        </TableCell>
        <TableCell className="text-right font-mono hidden lg:table-cell text-muted-foreground">
          ${(crypto.total_volume / 1e9).toFixed(2)}B
        </TableCell>
        <TableCell className="text-right font-mono hidden xl:table-cell text-muted-foreground">
          ${(crypto.market_cap / 1e9).toFixed(2)}B
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-neon-red" />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => refetch()}
              disabled={isFetching}
              className="h-6 px-2 text-xs"
            >
              {isFetching ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="hover:bg-card/80 cursor-pointer transition-all duration-300 hover:glow-hover border-b border-border/50">
      <TableCell className="font-medium font-mono text-muted-foreground">{crypto.market_cap_rank}</TableCell>
      <TableCell>
        <Link to="/crypto/$cryptoId" params={{ cryptoId: crypto.id }} className="flex items-center gap-2 group">
          <img src={crypto.image} alt={crypto.name} className="h-6 w-6 transition-all duration-300 group-hover:scale-110" />
          <div>
            <div className="font-medium group-hover:text-neon-cyan transition-colors duration-300">{crypto.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{crypto.symbol.toUpperCase()}</div>
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-right font-mono text-foreground font-semibold">${crypto.current_price.toLocaleString()}</TableCell>
      <TableCell className="text-right">
        <span
          className={`font-semibold font-mono ${
            crypto.price_change_percentage_24h >= 0
              ? 'text-neon-green glow-text'
              : 'text-neon-red glow-text'
          }`}
        >
          {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
          {crypto.price_change_percentage_24h.toFixed(2)}%
        </span>
      </TableCell>
      <TableCell className="text-right font-mono hidden lg:table-cell text-muted-foreground">
        ${(crypto.total_volume / 1e9).toFixed(2)}B
      </TableCell>
      <TableCell className="text-right font-mono hidden xl:table-cell text-muted-foreground">
        ${(crypto.market_cap / 1e9).toFixed(2)}B
      </TableCell>
      <TableCell>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
        ) : (
          primarySignal && <SignalBadge signal={primarySignal} />
        )}
      </TableCell>
    </TableRow>
  );
}

export default function CryptoTable({ cryptos, timeframe = '4H' }: CryptoTableProps) {
  return (
    <div className="rounded-lg border border-neon-cyan/30 bg-card glow-ambient overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-neon-cyan/30 bg-background-elevated/50">
            <TableHead className="w-16 font-heading text-neon-cyan">#</TableHead>
            <TableHead className="font-heading text-neon-cyan">Name</TableHead>
            <TableHead className="text-right font-heading text-neon-cyan">Price</TableHead>
            <TableHead className="text-right font-heading text-neon-cyan">24h %</TableHead>
            <TableHead className="text-right hidden lg:table-cell font-heading text-neon-cyan">Volume</TableHead>
            <TableHead className="text-right hidden xl:table-cell font-heading text-neon-cyan">Market Cap</TableHead>
            <TableHead className="font-heading text-neon-cyan">Signal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cryptos.map((crypto) => (
            <CryptoRow key={crypto.id} crypto={crypto} timeframe={timeframe} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
