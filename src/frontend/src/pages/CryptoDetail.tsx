import { useParams, Link } from '@tanstack/react-router';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useChartData } from '@/hooks/useChartData';
import { useTechnicalIndicators } from '@/hooks/useTechnicalIndicators';
import { useTradingSignals } from '@/hooks/useTradingSignals';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import CandlestickChart from '@/components/CandlestickChart';
import TimeframeSelector from '@/components/TimeframeSelector';
import IndicatorsPanel from '@/components/IndicatorsPanel';
import TradingSignalsPanel from '@/components/TradingSignalsPanel';
import PatternLegend from '@/components/PatternLegend';
import AITradeAnalysisCard from '@/components/AITradeAnalysisCard';

export default function CryptoDetail() {
  const { cryptoId } = useParams({ from: '/crypto/$cryptoId' });
  const [timeframe, setTimeframe] = useState<'1H' | '4H' | 'Daily'>('4H');
  const { data: cryptos } = useCryptoPrices();
  const crypto = cryptos?.find((c) => c.id === cryptoId);
  const { data: chartData, isLoading: chartLoading } = useChartData(cryptoId, timeframe);
  const { data: indicators } = useTechnicalIndicators(cryptoId, timeframe);
  const { data: signals } = useTradingSignals(cryptoId, timeframe);

  if (!crypto) {
    return (
      <div className="space-y-4">
        <Link to="/">
          <Button variant="ghost" className="gap-2 glow-hover">
            <ArrowLeft className="h-4 w-4" />
            Back to Market
          </Button>
        </Link>
        <Card className="border-neon-cyan/30 bg-card glow-ambient">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Cryptocurrency not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link to="/">
          <Button variant="ghost" className="gap-2 glow-hover">
            <ArrowLeft className="h-4 w-4" />
            Back to Market
          </Button>
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-3">
          {crypto.image && <img src={crypto.image} alt={crypto.name} className="h-10 w-10" />}
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-heading text-neon-cyan glow-text">{crypto.name}</h1>
            <p className="text-muted-foreground font-mono">{crypto.symbol.toUpperCase()}</p>
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-4xl font-bold font-mono text-foreground">${crypto.current_price.toLocaleString()}</span>
          <span
            className={`text-lg font-semibold font-mono ${
              crypto.price_change_percentage_24h >= 0 ? 'text-neon-green glow-text' : 'text-neon-red glow-text'
            }`}
          >
            {crypto.price_change_percentage_24h >= 0 ? '+' : ''}
            {crypto.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
      </div>

      {signals && <TradingSignalsPanel signals={signals} supportResistance={chartData?.supportResistance} />}

      <Card className="border-neon-cyan/30 bg-card glow-ambient">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="font-heading text-neon-cyan">Price Chart</CardTitle>
          <TimeframeSelector selected={timeframe} onSelect={setTimeframe} />
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-neon-cyan glow-icon" />
            </div>
          ) : chartData ? (
            <CandlestickChart
              data={chartData.ohlc}
              indicators={indicators}
              patterns={chartData.patterns}
              supportResistance={chartData.supportResistance}
            />
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">No chart data available</div>
          )}
        </CardContent>
      </Card>

      {chartData?.patterns && chartData.patterns.length > 0 && <PatternLegend patterns={chartData.patterns} />}

      {indicators && signals && chartData && (
        <AITradeAnalysisCard
          currentPrice={crypto.current_price}
          signals={signals}
          indicators={indicators}
          patterns={chartData.patterns}
          supportResistance={chartData.supportResistance}
        />
      )}

      {indicators && <IndicatorsPanel indicators={indicators} />}
    </div>
  );
}
