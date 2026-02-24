import type { OHLCData } from '@/services/coingecko';

export interface CandlestickPattern {
  index: number;
  type: 'bullish' | 'bearish' | 'neutral';
  name: string;
  description: string;
  tradingAction?: string;
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
        description: 'Indecision in the market - price opened and closed at nearly the same level',
        tradingAction: 'Wait for confirmation from next candle before entering position',
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
        description: 'Potential bullish reversal - buyers rejected lower prices',
        tradingAction: 'Consider entering long position if confirmed by next candle closing higher',
      });
    }

    // Shooting Star
    if (upperShadow > body * 2 && lowerShadow < body * 0.5 && current.close < current.open) {
      patterns.push({
        index: i,
        type: 'bearish',
        name: 'Shooting Star',
        description: 'Potential bearish reversal - sellers rejected higher prices',
        tradingAction: 'Consider entering short position or taking profits on long positions',
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
        description: 'Strong bullish reversal signal - buyers overwhelmed sellers',
        tradingAction: 'Strong buy signal - consider entering long position with stop below pattern low',
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
        description: 'Strong bearish reversal signal - sellers overwhelmed buyers',
        tradingAction: 'Strong sell signal - consider entering short position or exiting long positions',
      });
    }
  }

  return patterns;
}
