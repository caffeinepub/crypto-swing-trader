import { useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import CandlestickChart from '@/components/CandlestickChart';
import IndicatorsPanel from '@/components/IndicatorsPanel';
import TimeframeSelector from '@/components/TimeframeSelector';
import AITradeAnalysisCard from '@/components/AITradeAnalysisCard';
import { useChartData } from '@/hooks/useChartData';
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators';
import { useTradingSignals } from '@/hooks/useTradingSignals';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { generateTradeRecommendation } from '@/utils/aiTradeRecommendations';
import type { TradeRecommendation } from '@/utils/aiTradeRecommendations';

export default function CryptoDetail() {
  const { cryptoId } = useParams({ from: '/crypto/$cryptoId' });
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | 'Daily'>('4H');
  const [tradeRecommendation, setTradeRecommendation] = useState<TradeRecommendation | null>(null);

  const { data: cryptos } = useCryptoPrices();
  const crypto = cryptos?.find((c) => c.id === cryptoId);

  const { data: chartData, isLoading: chartLoading, error: chartError, refetch: refetchChart, isFetching: chartFetching } = useChartData(cryptoId, timeframe);
  const { data: indicators, isLoading: indicatorsLoading } = useTechnicalIndicators(cryptoId, timeframe);
  const { data: signals } = useTradingSignals(cryptoId, timeframe);

  // Generate trade recommendation when data is available
  useEffect(() => {
    if (chartData && indicators && signals && crypto) {
      const supportLevels = chartData.supportResistance.filter((l) => l.type === 'support').map((l) => l.price);
      const resistanceLevels = chartData.supportResistance.filter((l) => l.type === 'resistance').map((l) => l.price);

      const recommendation = generateTradeRecommendation(
        crypto.current_price,
        signals,
        indicators,
        chartData.patterns,
        supportLevels,
        resistanceLevels
      );
      setTradeRecommendation(recommendation);
    }
  }, [chartData, indicators, signals, crypto]);

  if (!crypto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-neon-cyan glow-icon" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="glow-hover">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <img src={crypto.image} alt={crypto.name} className="h-10 w-10" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading text-neon-cyan glow-text">{crypto.name}</h1>
            <p className="text-muted-foreground font-mono">{crypto.symbol.toUpperCase()}</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-heading">Timeframe:</span>
          <TimeframeSelector selected={timeframe} onSelect={setTimeframe} />
        </div>
      </div>

      {/* Price Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-neon-cyan/30 bg-card p-4 glow-ambient">
          <div className="text-sm text-muted-foreground mb-1">Current Price</div>
          <div className="text-2xl font-bold font-mono text-neon-cyan glow-text">${crypto.current_price.toLocaleString()}</div>
        </div>
        <div className="rounded-lg border border-neon-cyan/30 bg-card p-4 glow-ambient">
          <div className="text-sm text-muted-foreground mb-1">24h Change</div>
          <div
            className={`text-2xl font-bold font-mono ${
              crypto.price_change_percentage_24h >= 0 ? 'text-neon-green glow-text' : 'text-neon-red glow-text'
            }`}
          >
            {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
            {crypto.price_change_percentage_24h.toFixed(2)}%
          </div>
        </div>
        <div className="rounded-lg border border-neon-cyan/30 bg-card p-4 glow-ambient">
          <div className="text-sm text-muted-foreground mb-1">Market Cap</div>
          <div className="text-2xl font-bold font-mono text-foreground">${(crypto.market_cap / 1e9).toFixed(2)}B</div>
        </div>
      </div>

      {/* AI Trade Analysis */}
      {chartData && indicators && signals && (
        <AITradeAnalysisCard
          currentPrice={crypto.current_price}
          signals={signals}
          indicators={indicators}
          patterns={chartData.patterns}
          supportResistance={chartData.supportResistance}
        />
      )}

      {/* Chart */}
      {chartLoading ? (
        <div className="flex items-center justify-center h-[400px] rounded-lg border border-neon-cyan/30 bg-card glow-ambient">
          <Loader2 className="h-8 w-8 animate-spin text-neon-cyan glow-icon" />
        </div>
      ) : (
        <CandlestickChart
          data={chartData?.ohlc || []}
          indicators={indicators}
          patterns={chartData?.patterns}
          supportResistance={chartData?.supportResistance}
          tradeRecommendation={tradeRecommendation || undefined}
          coinId={cryptoId}
          timeframe={timeframe}
          isError={!!chartError}
          onRetry={refetchChart}
          isRetrying={chartFetching}
        />
      )}

      {/* Technical Indicators */}
      {indicatorsLoading ? (
        <div className="flex items-center justify-center h-[200px] rounded-lg border border-neon-cyan/30 bg-card glow-ambient">
          <Loader2 className="h-8 w-8 animate-spin text-neon-cyan glow-icon" />
        </div>
      ) : (
        indicators && <IndicatorsPanel indicators={indicators} />
      )}
    </div>
  );
}
