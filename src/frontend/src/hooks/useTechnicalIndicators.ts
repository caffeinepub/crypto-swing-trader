import { fetchMarketChart15m, fetchOHLCData } from "@/services/coingecko";
import {
  type TechnicalIndicators,
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateSMA,
  detectDivergence,
} from "@/utils/technicalIndicators";
import { useQuery } from "@tanstack/react-query";

export function useTechnicalIndicators(
  coinId: string,
  timeframe: "15m" | "1H" | "4H" | "Daily",
) {
  const daysMap: Record<string, number> = {
    "1H": 1,
    "4H": 7,
    Daily: 90,
  };

  return useQuery<TechnicalIndicators>({
    queryKey: ["indicators", coinId, timeframe],
    queryFn: async () => {
      const ohlc =
        timeframe === "15m"
          ? await fetchMarketChart15m(coinId)
          : await fetchOHLCData(coinId, daysMap[timeframe]);

      const closes = ohlc.map((d) => d.close);

      const rsi = calculateRSI(closes, 14);
      const macd = calculateMACD(closes);
      const sma20 = calculateSMA(closes, 20);
      const sma50 = calculateSMA(closes, 50);
      const ema20 = calculateEMA(closes, 20);
      const bollinger = calculateBollingerBands(closes, 20, 2);

      const lastHistogram = macd.histogram[macd.histogram.length - 1] || 0;
      const prevHistogram = macd.histogram[macd.histogram.length - 2] || 0;

      // Detect divergence using full RSI series before trimming to last value
      const divergence = detectDivergence(closes, rsi);

      return {
        rsi: rsi[rsi.length - 1] || 0,
        macd: {
          macd: macd.macd[macd.macd.length - 1] || 0,
          signal: macd.signal[macd.signal.length - 1] || 0,
          histogram: lastHistogram,
          prevHistogram,
        },
        sma20: sma20[sma20.length - 1] || 0,
        sma50: sma50[sma50.length - 1] || 0,
        ema20: ema20[ema20.length - 1] || 0,
        bollingerBands: {
          upper: bollinger.upper[bollinger.upper.length - 1] || 0,
          middle: bollinger.middle[bollinger.middle.length - 1] || 0,
          lower: bollinger.lower[bollinger.lower.length - 1] || 0,
        },
        divergence,
      };
    },
    enabled: !!coinId,
    staleTime: 60000,
  });
}
