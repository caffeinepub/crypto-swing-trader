import type { CryptoMarketData } from '@/services/coingecko';

export interface MarketSentiment {
  overall: 'bullish' | 'bearish' | 'neutral';
  fearGreedIndex: number;
  topGainers: CryptoMarketData[];
  topLosers: CryptoMarketData[];
}

export function calculateMarketSentiment(cryptos: CryptoMarketData[]): MarketSentiment {
  const avgChange =
    cryptos.reduce((sum, crypto) => sum + crypto.price_change_percentage_24h, 0) / cryptos.length;

  const overall: 'bullish' | 'bearish' | 'neutral' =
    avgChange > 2 ? 'bullish' : avgChange < -2 ? 'bearish' : 'neutral';

  // Simple fear/greed calculation based on average change
  const fearGreedIndex = Math.max(0, Math.min(100, 50 + avgChange * 5));

  const sorted = [...cryptos].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);

  return {
    overall,
    fearGreedIndex,
    topGainers: sorted.slice(0, 5),
    topLosers: sorted.slice(-5).reverse(),
  };
}
