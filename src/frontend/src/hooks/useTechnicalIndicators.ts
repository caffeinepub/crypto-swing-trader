import { useQuery } from '@tanstack/react-query';
import { fetchOHLCData } from '@/services/coingecko';
import {
  calculateRSI,
  calculateMACD,
  calculateSMA,
  calculateEMA,
  calculateBollingerBands,
  type TechnicalIndicators,
} from '@/utils/technicalIndicators';

export function useTechnicalIndicators(coinId: string, timeframe: '1H' | '4H' | 'Daily') {
  const daysMap = {
    '1H': 1,
    '4H': 7,
    Daily: 90,
  };

  return useQuery<TechnicalIndicators>({
    queryKey: ['indicators', coinId, timeframe],
    queryFn: async () => {
      const ohlc = await fetchOHLCData(coinId, daysMap[timeframe]);
      const closes = ohlc.map((d) => d.close);

      const rsi = calculateRSI(closes, 14);
      const macd = calculateMACD(closes);
      const sma20 = calculateSMA(closes, 20);
      const sma50 = calculateSMA(closes, 50);
      const ema20 = calculateEMA(closes, 20);
      const bollinger = calculateBollingerBands(closes, 20, 2);

      return {
        rsi: rsi[rsi.length - 1] || 0,
        macd: {
          macd: macd.macd[macd.macd.length - 1] || 0,
          signal: macd.signal[macd.signal.length - 1] || 0,
          histogram: macd.histogram[macd.histogram.length - 1] || 0,
        },
        sma20: sma20[sma20.length - 1] || 0,
        sma50: sma50[sma50.length - 1] || 0,
        ema20: ema20[ema20.length - 1] || 0,
        bollingerBands: {
          upper: bollinger.upper[bollinger.upper.length - 1] || 0,
          middle: bollinger.middle[bollinger.middle.length - 1] || 0,
          lower: bollinger.lower[bollinger.lower.length - 1] || 0,
        },
      };
    },
    enabled: !!coinId,
    staleTime: 60000,
  });
}
