import { useQuery } from '@tanstack/react-query';
import { fetchTopCryptos, type CryptoMarketData } from '@/services/coingecko';

export function useCryptoPrices() {
  return useQuery<CryptoMarketData[]>({
    queryKey: ['cryptoPrices'],
    queryFn: () => fetchTopCryptos(30),
    staleTime: 30000,
    refetchInterval: 45000,
  });
}
