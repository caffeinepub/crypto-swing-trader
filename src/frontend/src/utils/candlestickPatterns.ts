import type { OHLCData } from '@/services/coingecko';

export interface CandlestickPattern {
  index: number;
  type: 'bullish' | 'bearish' | 'neutral';
  name: string;
  description: string;
}

export function detectCandlestickPatterns(ohlc: OHLCData[]): CandlestickPattern[] {
  const patterns: CandlestickPattern[] = [];

  for (let i = 1; i < ohlc.length; i++) {
    const current = ohlc[i];
    const prev = ohlc[i - 1];

    // Doji
    if (Math.abs(current.close - current.open) < (current.high - current.low) * 0.1) {
      patterns.push({
        index: i,
        type: 'neutral',
        name: 'Doji',
        description: 'Indecision in the market',
      });
    }

    // Hammer
    const body = Math.abs(current.close - current.open);
    const lowerShadow = Math.min(current.open, current.close) - current.low;
    const upperShadow = current.high - Math.max(current.open, current.close);

    if (lowerShadow > body * 2 && upperShadow < body * 0.5 && current.close > current.open) {
      patterns.push({
        index: i,
        type: 'bullish',
        name: 'Hammer',
        description: 'Potential bullish reversal',
      });
    }

    // Shooting Star
    if (upperShadow > body * 2 && lowerShadow < body * 0.5 && current.close < current.open) {
      patterns.push({
        index: i,
        type: 'bearish',
        name: 'Shooting Star',
        description: 'Potential bearish reversal',
      });
    }

    // Bullish Engulfing
    if (
      prev.close < prev.open &&
      current.close > current.open &&
      current.open < prev.close &&
      current.close > prev.open
    ) {
      patterns.push({
        index: i,
        type: 'bullish',
        name: 'Bullish Engulfing',
        description: 'Strong bullish reversal signal',
      });
    }

    // Bearish Engulfing
    if (
      prev.close > prev.open &&
      current.close < current.open &&
      current.open > prev.close &&
      current.close < prev.open
    ) {
      patterns.push({
        index: i,
        type: 'bearish',
        name: 'Bearish Engulfing',
        description: 'Strong bearish reversal signal',
      });
    }
  }

  return patterns;
}
