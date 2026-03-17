import { type CryptoMarketData, fetchTopCryptos } from "@/services/coingecko";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface CryptoPriceResult {
  data: CryptoMarketData[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
  isInitialLoading: boolean;
  retryAttempt: number;
  lastUpdated: number | null;
  batchProgress: { loaded: number; total: number };
  errorType: "rate-limit" | "network" | "api-unavailable" | null;
  countdownSeconds: number;
}

export function useCryptoPrices(): CryptoPriceResult {
  const isFirstLoad = useRef(true);
  const retryAttemptRef = useRef(0);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [batchProgress, setBatchProgress] = useState({ loaded: 0, total: 30 });
  const [errorType, setErrorType] = useState<
    "rate-limit" | "network" | "api-unavailable" | null
  >(null);
  const [countdownSeconds, setCountdownSeconds] = useState(0);

  // Get watchlist from localStorage or use default
  const getWatchlistIds = (): string[] => {
    try {
      const stored = localStorage.getItem("watchlist");
      if (stored) {
        const watchlist = JSON.parse(stored);
        return watchlist.slice(0, 10); // Max 10 watchlist coins
      }
    } catch (e) {
      console.error("Failed to load watchlist:", e);
    }
    // Default watchlist
    return ["bitcoin", "ethereum", "solana", "cardano", "ripple"];
  };

  const query = useQuery<CryptoMarketData[]>({
    queryKey: ["cryptoPrices"],
    queryFn: async () => {
      // Progressive loading on initial load
      if (isFirstLoad.current) {
        const allCoinIds = [
          "bitcoin",
          "ethereum",
          "tether",
          "binancecoin",
          "solana",
          "usd-coin",
          "ripple",
          "cardano",
          "dogecoin",
          "tron",
          "avalanche-2",
          "polkadot",
          "chainlink",
          "polygon",
          "shiba-inu",
          "litecoin",
          "bitcoin-cash",
          "uniswap",
          "stellar",
          "monero",
          "ethereum-classic",
          "okb",
          "cosmos",
          "filecoin",
          "hedera-hashgraph",
          "aptos",
          "near",
          "vechain",
          "algorand",
          "internet-computer",
        ];

        const watchlistIds = getWatchlistIds();

        // Batch 1: Watchlist coins (priority)
        const batch1Ids = watchlistIds.filter((id) => allCoinIds.includes(id));
        const remainingIds = allCoinIds.filter((id) => !batch1Ids.includes(id));

        // Batch 2 & 3: Split remaining coins
        const midPoint = Math.ceil(remainingIds.length / 2);
        const batch2Ids = remainingIds.slice(0, midPoint);
        const _batch3Ids = remainingIds.slice(midPoint);

        setBatchProgress({ loaded: 0, total: 30 });

        // Fetch batch 1 (watchlist)
        const _result1 = await fetchTopCryptos(
          batch1Ids.length,
          batch1Ids.join(","),
        );
        setBatchProgress({ loaded: batch1Ids.length, total: 30 });

        // Wait 150ms before batch 2
        await new Promise((resolve) => setTimeout(resolve, 150));
        const _result2 = await fetchTopCryptos(
          batch1Ids.length + batch2Ids.length,
          [...batch1Ids, ...batch2Ids].join(","),
        );
        setBatchProgress({
          loaded: batch1Ids.length + batch2Ids.length,
          total: 30,
        });

        // Wait 150ms before batch 3
        await new Promise((resolve) => setTimeout(resolve, 150));
        const result3 = await fetchTopCryptos(30, allCoinIds.join(","));
        setBatchProgress({ loaded: 30, total: 30 });

        isFirstLoad.current = false;
        setLastUpdated(Date.now());
        setErrorType(null);
        return result3;
      }

      // Normal fetch for subsequent loads
      const result = await fetchTopCryptos(30);
      setLastUpdated(Date.now());
      setErrorType(null);
      return result;
    },
    staleTime: 30000,
    refetchInterval: 45000,
    retry: (failureCount, error) => {
      // Enhanced retry for initial load: 5 attempts
      // Regular retry for subsequent loads: 3 attempts
      const maxRetries = isFirstLoad.current ? 5 : 3;
      retryAttemptRef.current = failureCount;

      // Parse error type
      if (error instanceof Error) {
        if (
          error.message.includes("429") ||
          error.message.includes("rate limit")
        ) {
          setErrorType("rate-limit");
        } else if (
          error.message.includes("fetch") ||
          error.message.includes("network")
        ) {
          setErrorType("network");
        } else {
          setErrorType("api-unavailable");
        }
      }

      return failureCount < maxRetries;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff with longer delays for initial load
      let delay: number;
      if (isFirstLoad.current) {
        // Initial load: 2s, 4s, 8s, 16s, 32s (capped at 60s)
        delay = Math.min(2000 * 2 ** attemptIndex, 60000);
      } else {
        // Subsequent loads: 1s, 2s, 4s
        delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      }

      // Set countdown for UI
      setCountdownSeconds(Math.floor(delay / 1000));

      return delay;
    },
  });

  // Countdown timer effect
  useEffect(() => {
    if (countdownSeconds > 0 && query.isError) {
      const timer = setInterval(() => {
        setCountdownSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdownSeconds, query.isError]);

  useEffect(() => {
    if (query.isSuccess) {
      retryAttemptRef.current = 0;
      setErrorType(null);
      setCountdownSeconds(0);
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
    lastUpdated,
    batchProgress,
    errorType,
    countdownSeconds,
  };
}
