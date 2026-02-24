import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { calculateMarketSentiment } from '@/utils/marketSentiment';
import type { CryptoMarketData } from '@/services/coingecko';

interface MarketSentimentPanelProps {
  cryptos: CryptoMarketData[];
}

export default function MarketSentimentPanel({ cryptos }: MarketSentimentPanelProps) {
  const sentiment = calculateMarketSentiment(cryptos);
  const isExtremeSentiment = sentiment.fearGreedIndex < 20 || sentiment.fearGreedIndex > 80;

  const getSentimentColor = () => {
    if (sentiment.overall === 'bullish') return 'text-neon-green';
    if (sentiment.overall === 'bearish') return 'text-neon-red';
    return 'text-neon-cyan';
  };

  const getSentimentGlow = () => {
    if (sentiment.overall === 'bullish') return 'glow-green';
    if (sentiment.overall === 'bearish') return 'glow-red';
    return 'glow-ambient';
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 animate-fade-in">
      <Card className={`border-neon-cyan/30 bg-card ${isExtremeSentiment ? 'glow-pulse' : 'glow-ambient'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium font-heading text-neon-cyan">Market Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`${getSentimentColor()} border-current ${getSentimentGlow()} font-heading text-base px-3 py-1`}>
                <span className="uppercase font-bold">{sentiment.overall}</span>
              </Badge>
              {sentiment.overall === 'bullish' ? (
                <TrendingUp className="h-6 w-6 text-neon-green glow-icon" />
              ) : sentiment.overall === 'bearish' ? (
                <TrendingDown className="h-6 w-6 text-neon-red glow-icon" />
              ) : (
                <div className="h-6 w-6" />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-heading">
                <span>Fear</span>
                <span>Greed</span>
              </div>
              <Progress value={sentiment.fearGreedIndex} className="h-2" />
              <div className="text-center text-sm font-medium font-mono text-neon-cyan glow-text">{Math.round(sentiment.fearGreedIndex)}/100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neon-green/30 bg-card glow-green">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 font-heading text-neon-green">
            <TrendingUp className="h-4 w-4 glow-icon" />
            Top Gainers (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sentiment.topGainers.slice(0, 3).map((crypto) => (
              <div key={crypto.id} className="flex items-center justify-between text-sm p-2 rounded border border-neon-green/20 bg-neon-green/5 transition-all duration-300 hover:glow-hover">
                <span className="font-medium truncate font-heading">{crypto.symbol.toUpperCase()}</span>
                <span className="text-neon-green font-semibold font-mono glow-text">
                  +{crypto.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-neon-red/30 bg-card glow-red">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2 font-heading text-neon-red">
            <TrendingDown className="h-4 w-4 glow-icon" />
            Top Losers (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sentiment.topLosers.slice(0, 3).map((crypto) => (
              <div key={crypto.id} className="flex items-center justify-between text-sm p-2 rounded border border-neon-red/20 bg-neon-red/5 transition-all duration-300 hover:glow-hover">
                <span className="font-medium truncate font-heading">{crypto.symbol.toUpperCase()}</span>
                <span className="text-neon-red font-semibold font-mono glow-text">
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
