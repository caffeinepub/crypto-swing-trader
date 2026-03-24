export interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  atl: number;
}

export interface OHLCData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Enhanced cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 35000; // 35 seconds

// Promise cache for request deduplication
const inFlightRequests = new Map<string, Promise<any>>();

function getCachedResponse<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    responseCache.delete(key);
    return null;
  }

  return entry.data;
}

function setCachedResponse<T>(key: string, data: T): void {
  responseCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export async function fetchTopCryptos(
  limit = 30,
  coinIds?: string,
): Promise<CryptoMarketData[]> {
  try {
    // Use provided coinIds or default list
    const ids =
      coinIds ||
      [
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
      ]
        .slice(0, limit)
        .join(",");

    const cacheKey = `markets-${ids}`;

    // Check cache first
    const cached = getCachedResponse<CryptoMarketData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if request is already in flight (promise cache)
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // Make new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(
          `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`,
        );

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limit exceeded (429)");
          }
          throw new Error(
            `Failed to fetch cryptocurrency data (${response.status})`,
          );
        }

        const data = await response.json();

        // Cache successful response
        setCachedResponse(cacheKey, data);

        return data;
      } finally {
        // Remove from in-flight cache
        inFlightRequests.delete(cacheKey);
      }
    })();

    // Store in-flight request
    inFlightRequests.set(cacheKey, requestPromise);

    return requestPromise;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    throw error;
  }
}

export async function fetchOHLCData(
  coinId: string,
  days: number,
): Promise<OHLCData[]> {
  try {
    const cacheKey = `ohlc-${coinId}-${days}`;

    // Check cache first
    const cached = getCachedResponse<OHLCData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if request is already in flight (promise cache)
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // Make new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(
          `${COINGECKO_API_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
        );

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error("Rate limit exceeded (429)");
          }
          throw new Error(`Failed to fetch OHLC data (${response.status})`);
        }

        const data: number[][] = await response.json();
        const ohlcData = data.map((item) => ({
          timestamp: item[0],
          open: item[1],
          high: item[2],
          low: item[3],
          close: item[4],
        }));

        // Cache successful response
        setCachedResponse(cacheKey, ohlcData);

        return ohlcData;
      } finally {
        // Remove from in-flight cache
        inFlightRequests.delete(cacheKey);
      }
    })();

    // Store in-flight request
    inFlightRequests.set(cacheKey, requestPromise);

    return requestPromise;
  } catch (error) {
    console.error("Error fetching OHLC data:", error);
    throw error;
  }
}

/**
 * Fetch ~5-minute price data for the last 24h from CoinGecko market_chart
 * and group into 15-minute OHLC buckets.
 */
export async function fetchMarketChart15m(coinId: string): Promise<OHLCData[]> {
  const cacheKey = `market_chart_15m-${coinId}`;

  const cached = getCachedResponse<OHLCData[]>(cacheKey);
  if (cached) return cached;

  const inFlight = inFlightRequests.get(cacheKey);
  if (inFlight) return inFlight;

  const requestPromise = (async () => {
    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=1`,
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded (429)");
        }
        throw new Error(`Failed to fetch 15m chart data (${response.status})`);
      }

      const data: { prices: number[][]; total_volumes: number[][] } =
        await response.json();

      const BUCKET_MS = 15 * 60 * 1000;

      // Group prices into 15-min buckets
      const priceBuckets = new Map<
        number,
        { prices: number[]; bucketTs: number }
      >();
      for (const [ts, price] of data.prices) {
        const bucket = Math.floor(ts / BUCKET_MS);
        if (!priceBuckets.has(bucket)) {
          priceBuckets.set(bucket, {
            prices: [],
            bucketTs: bucket * BUCKET_MS,
          });
        }
        priceBuckets.get(bucket)!.prices.push(price);
      }

      // Group volumes into same buckets
      const volumeBuckets = new Map<number, number>();
      for (const [ts, vol] of data.total_volumes) {
        const bucket = Math.floor(ts / BUCKET_MS);
        volumeBuckets.set(bucket, (volumeBuckets.get(bucket) || 0) + vol);
      }

      const ohlcData: OHLCData[] = [];
      for (const [bucket, { prices, bucketTs }] of priceBuckets) {
        if (prices.length === 0) continue;
        ohlcData.push({
          timestamp: bucketTs,
          open: prices[0],
          high: Math.max(...prices),
          low: Math.min(...prices),
          close: prices[prices.length - 1],
          volume: volumeBuckets.get(bucket) || 0,
        });
      }

      ohlcData.sort((a, b) => a.timestamp - b.timestamp);

      setCachedResponse(cacheKey, ohlcData);
      return ohlcData;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}
