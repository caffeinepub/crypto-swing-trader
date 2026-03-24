import {
  type OHLCData,
  fetchMarketChart15m,
  fetchOHLCData,
} from "@/services/coingecko";
import {
  type CandlestickPattern,
  detectCandlestickPatterns,
} from "@/utils/candlestickPatterns";
import {
  type SupportResistanceLevel,
  calculateSupportResistance,
} from "@/utils/supportResistance";
import { useQuery } from "@tanstack/react-query";

interface ChartData {
  ohlc: OHLCData[];
  patterns: CandlestickPattern[];
  supportResistance: SupportResistanceLevel[];
}

export function useChartData(
  coinId: string,
  timeframe: "15m" | "1H" | "4H" | "Daily",
) {
  const daysMap = {
    "1H": 1,
    "4H": 7,
    Daily: 90,
  };

  return useQuery<ChartData>({
    queryKey: ["chartData", coinId, timeframe],
    queryFn: async () => {
      let ohlc: OHLCData[];
      if (timeframe === "15m") {
        ohlc = await fetchMarketChart15m(coinId);
      } else {
        ohlc = await fetchOHLCData(coinId, daysMap[timeframe]);
      }
      const patterns = detectCandlestickPatterns(ohlc);
      const supportResistance = calculateSupportResistance(ohlc);

      return { ohlc, patterns, supportResistance };
    },
    enabled: !!coinId,
    staleTime: 60000,
    retry: 4,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
  });
}
