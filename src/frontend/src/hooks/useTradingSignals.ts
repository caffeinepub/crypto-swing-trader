import { useQuery } from '@tanstack/react-query';
import { useTechnicalIndicators } from './useTechnicalIndicators';
import { generateTradingSignals, type TradingSignal } from '@/utils/tradingSignals';

export function useTradingSignals(coinId: string, timeframe: '1H' | '4H' | 'Daily') {
  const { data: indicators } = useTechnicalIndicators(coinId, timeframe);

  return useQuery<TradingSignal[]>({
    queryKey: ['signals', coinId, timeframe, indicators],
    queryFn: () => {
      if (!indicators) return [];
      return generateTradingSignals(indicators);
    },
    enabled: !!indicators,
    staleTime: 60000,
  });
}
