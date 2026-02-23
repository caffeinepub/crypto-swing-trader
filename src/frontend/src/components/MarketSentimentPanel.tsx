import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { calculateMarketSentiment } from '@/utils/marketSentiment';
import type { CryptoMarketData } from '@/services/coingecko';

interface MarketSentimentPanelProps {
  cryptos: CryptoMarketData[];
}

export default function MarketSentimentPanel({ cryptos }: MarketSentimentPanelProps) {
  const sentiment = calculateMarketSentiment(cryptos);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold capitalize">{sentiment.overall}</span>
              {sentiment.overall === 'bullish' ? (
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : sentiment.overall === 'bearish' ? (
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              ) : (
                <div className="h-6 w-6" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fear</span>
                <span>Greed</span>
              </div>
              <Progress value={sentiment.fearGreedIndex} className="h-2" />
              <div className="text-center text-sm font-medium">{Math.round(sentiment.fearGreedIndex)}/100</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            Top Gainers (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sentiment.topGainers.slice(0, 3).map((crypto) => (
              <div key={crypto.id} className="flex items-center justify-between text-sm">
                <span className="font-medium truncate">{crypto.symbol.toUpperCase()}</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  +{crypto.price_change_percentage_24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            Top Losers (24h)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sentiment.topLosers.slice(0, 3).map((crypto) => (
              <div key={crypto.id} className="flex items-center justify-between text-sm">
                <span className="font-medium truncate">{crypto.symbol.toUpperCase()}</span>
                <span className="text-red-600 dark:text-red-400 font-semibold">
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
