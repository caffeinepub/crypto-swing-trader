import { useQuery } from '@tanstack/react-query';
import { fetchTopCryptos, type CryptoMarketData } from '@/services/coingecko';
import { useRef, useEffect } from 'react';

interface CryptoPriceResult {
  data: CryptoMarketData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
  isInitialLoading: boolean;
  retryAttempt: number;
}

export function useCryptoPrices(): CryptoPriceResult {
  const isFirstLoad = useRef(true);
  const retryAttemptRef = useRef(0);

  const query = useQuery<CryptoMarketData[]>({
    queryKey: ['cryptoPrices'],
    queryFn: async () => {
      // Staggered batch loading on initial load
      if (isFirstLoad.current) {
        const batch1 = [
          'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'usd-coin',
          'ripple', 'cardano', 'dogecoin', 'tron'
        ];
        const batch2 = [
          'avalanche-2', 'polkadot', 'chainlink', 'polygon', 'shiba-inu',
          'litecoin', 'bitcoin-cash', 'uniswap', 'stellar', 'monero'
        ];
        const batch3 = [
          'ethereum-classic', 'okb', 'cosmos', 'filecoin', 'hedera-hashgraph',
          'aptos', 'near', 'vechain', 'algorand', 'internet-computer'
        ];

        // Fetch first batch
        const result1 = await fetchTopCryptos(10);
        
        // Wait 150ms before second batch
        await new Promise(resolve => setTimeout(resolve, 150));
        const result2 = await fetchTopCryptos(20);
        
        // Wait 150ms before third batch
        await new Promise(resolve => setTimeout(resolve, 150));
        const result3 = await fetchTopCryptos(30);
        
        isFirstLoad.current = false;
        return result3; // Return full result
      }
      
      // Normal fetch for subsequent loads
      return fetchTopCryptos(30);
    },
    staleTime: 30000,
    refetchInterval: 45000,
    retry: (failureCount, error) => {
      // Enhanced retry for initial load
      const maxRetries = isFirstLoad.current ? 5 : 3;
      retryAttemptRef.current = failureCount;
      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => {
      // Longer delays for initial load
      if (isFirstLoad.current) {
        return Math.min(2000 * 2 ** attemptIndex, 10000); // 2s, 4s, 8s, 10s, 10s
      }
      return Math.min(1000 * 2 ** attemptIndex, 30000); // 1s, 2s, 4s
    },
  });

  useEffect(() => {
    if (query.isSuccess) {
      retryAttemptRef.current = 0;
    }
  }, [query.isSuccess]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    isInitialLoading: query.isLoading && isFirstLoad.current,
    retryAttempt: retryAttemptRef.current,
  };
}
