export interface DivergenceResult {
  bullish: boolean;
  bearish: boolean;
  description: string;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    prevHistogram: number;
  };
  sma20: number;
  sma50: number;
  ema20: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  divergence?: DivergenceResult;
}

/**
 * Wilder's smoothed RSI (industry-standard).
 * Uses EMA-style smoothing: avgGain = (prevAvgGain * (period-1) + gain) / period
 */
export function calculateRSI(prices: number[], period = 14): number[] {
  if (prices.length < period + 1) return [];

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // Seed with simple average for first period
  const seed = changes.slice(0, period);
  let avgGain = seed.filter((c) => c > 0).reduce((a, b) => a + b, 0) / period;
  let avgLoss =
    seed
      .filter((c) => c < 0)
      .map(Math.abs)
      .reduce((a, b) => a + b, 0) / period;

  const rsi: number[] = [];
  const addRsi = (ag: number, al: number) => {
    if (al === 0) {
      rsi.push(100);
      return;
    }
    const rs = ag / al;
    rsi.push(100 - 100 / (1 + rs));
  };
  addRsi(avgGain, avgLoss);

  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0;
    const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    addRsi(avgGain, avgLoss);
  }

  return rsi;
}

export function calculateMACD(
  prices: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): { macd: number[]; signal: number[]; histogram: number[] } {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);

  const macdLine: number[] = [];
  const minLength = Math.min(emaFast.length, emaSlow.length);
  for (let i = 0; i < minLength; i++) {
    macdLine.push(emaFast[i] - emaSlow[i]);
  }

  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram: number[] = [];
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(
      macdLine[macdLine.length - signalLine.length + i] - signalLine[i],
    );
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    sma.push(avg);
  }
  return sma;
}

export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];

  const k = 2 / (period + 1);
  const ema: number[] = [];

  const sma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(sma);

  for (let i = period; i < prices.length; i++) {
    const value = prices[i] * k + ema[ema.length - 1] * (1 - k);
    ema.push(value);
  }

  return ema;
}

export function calculateBollingerBands(
  prices: number[],
  period = 20,
  stdDev = 2,
): { upper: number[]; middle: number[]; lower: number[] } {
  const sma = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < sma.length; i++) {
    const slice = prices.slice(i, i + period);
    const mean = sma[i];
    const variance =
      slice.reduce((sum, val) => sum + (val - mean) ** 2, 0) / period;
    const std = Math.sqrt(variance);

    upper.push(mean + stdDev * std);
    lower.push(mean - stdDev * std);
  }

  return { upper, middle: sma, lower };
}

/**
 * Detects RSI divergence between price and RSI series.
 * Bullish: price makes lower low but RSI makes higher low (reversal signal).
 * Bearish: price makes higher high but RSI makes lower high (reversal signal).
 */
export function detectDivergence(
  closes: number[],
  rsiSeries: number[],
  lookback = 20,
): DivergenceResult {
  if (closes.length < lookback || rsiSeries.length < lookback) {
    return { bullish: false, bearish: false, description: "" };
  }

  const priceWindow = closes.slice(-lookback);
  const rsiWindow = rsiSeries.slice(-lookback);

  const half = Math.floor(lookback / 2);
  const prevPriceWindow = priceWindow.slice(0, half);
  const recentPriceWindow = priceWindow.slice(half);
  const prevRsiWindow = rsiWindow.slice(0, half);
  const recentRsiWindow = rsiWindow.slice(half);

  const prevPriceLow = Math.min(...prevPriceWindow);
  const recentPriceLow = Math.min(...recentPriceWindow);
  const prevRsiLow = Math.min(...prevRsiWindow);
  const recentRsiLow = Math.min(...recentRsiWindow);

  const prevPriceHigh = Math.max(...prevPriceWindow);
  const recentPriceHigh = Math.max(...recentPriceWindow);
  const prevRsiHigh = Math.max(...prevRsiWindow);
  const recentRsiHigh = Math.max(...recentRsiWindow);

  // Bullish: price lower low but RSI higher low (>= 3pt difference to avoid noise)
  const bullish =
    recentPriceLow < prevPriceLow * 0.995 && recentRsiLow > prevRsiLow + 3;

  // Bearish: price higher high but RSI lower high (>= 3pt difference)
  const bearish =
    recentPriceHigh > prevPriceHigh * 1.005 && recentRsiHigh < prevRsiHigh - 3;

  return {
    bullish,
    bearish,
    description: bullish
      ? "Bullish RSI divergence — price lower low but RSI higher low (reversal signal)"
      : bearish
        ? "Bearish RSI divergence — price higher high but RSI lower high (reversal signal)"
        : "",
  };
}
