import type { OHLCData } from '@/services/coingecko';

export interface SupportResistanceLevel {
  price: number;
  type: 'support' | 'resistance';
  strength: number;
}

export function calculateSupportResistance(ohlc: OHLCData[], lookback = 20): SupportResistanceLevel[] {
  if (ohlc.length < lookback) return [];

  const levels: SupportResistanceLevel[] = [];
  const recentData = ohlc.slice(-lookback);

  // Find local minima (support)
  for (let i = 2; i < recentData.length - 2; i++) {
    const current = recentData[i].low;
    if (
      current < recentData[i - 1].low &&
      current < recentData[i - 2].low &&
      current < recentData[i + 1].low &&
      current < recentData[i + 2].low
    ) {
      levels.push({
        price: current,
        type: 'support',
        strength: 1,
      });
    }
  }

  // Find local maxima (resistance)
  for (let i = 2; i < recentData.length - 2; i++) {
    const current = recentData[i].high;
    if (
      current > recentData[i - 1].high &&
      current > recentData[i - 2].high &&
      current > recentData[i + 1].high &&
      current > recentData[i + 2].high
    ) {
      levels.push({
        price: current,
        type: 'resistance',
        strength: 1,
      });
    }
  }

  // Merge similar levels
  const merged: SupportResistanceLevel[] = [];
  const threshold = 0.02; // 2% threshold

  for (const level of levels) {
    const existing = merged.find(
      (l) => l.type === level.type && Math.abs(l.price - level.price) / level.price < threshold
    );

    if (existing) {
      existing.strength += 1;
      existing.price = (existing.price + level.price) / 2;
    } else {
      merged.push({ ...level });
    }
  }

  return merged.sort((a, b) => b.strength - a.strength).slice(0, 5);
}
