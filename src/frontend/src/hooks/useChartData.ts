import { useQuery } from '@tanstack/react-query';
import { fetchOHLCData, type OHLCData } from '@/services/coingecko';
import { detectCandlestickPatterns, type CandlestickPattern } from '@/utils/candlestickPatterns';
import { calculateSupportResistance, type SupportResistanceLevel } from '@/utils/supportResistance';

interface ChartData {
  ohlc: OHLCData[];
  patterns: CandlestickPattern[];
  supportResistance: SupportResistanceLevel[];
}

export function useChartData(coinId: string, timeframe: '1H' | '4H' | 'Daily') {
  const daysMap = {
    '1H': 1,
    '4H': 7,
    Daily: 90,
  };

  return useQuery<ChartData>({
    queryKey: ['chartData', coinId, timeframe],
    queryFn: async () => {
      const ohlc = await fetchOHLCData(coinId, daysMap[timeframe]);
      const patterns = detectCandlestickPatterns(ohlc);
      const supportResistance = calculateSupportResistance(ohlc);

      return { ohlc, patterns, supportResistance };
    },
    enabled: !!coinId,
    staleTime: 60000,
  });
}
