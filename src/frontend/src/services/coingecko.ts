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

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Response cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const responseCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL = 35000; // 35 seconds (slightly less than 45s refresh to ensure fresh data)

// In-flight request cache for deduplication
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

export async function fetchTopCryptos(limit = 30): Promise<CryptoMarketData[]> {
  try {
    // Build comma-separated list of top coin IDs for batch request
    const coinIds = [
      'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'usd-coin',
      'ripple', 'cardano', 'dogecoin', 'tron', 'avalanche-2', 'polkadot',
      'chainlink', 'polygon', 'shiba-inu', 'litecoin', 'bitcoin-cash',
      'uniswap', 'stellar', 'monero', 'ethereum-classic', 'okb', 'cosmos',
      'filecoin', 'hedera-hashgraph', 'aptos', 'near', 'vechain', 'algorand',
      'internet-computer'
    ].slice(0, limit).join(',');

    const cacheKey = `markets-${coinIds}`;
    
    // Check cache first
    const cached = getCachedResponse<CryptoMarketData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if request is already in flight
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // Make new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(
          `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch cryptocurrency data');
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
    console.error('Error fetching crypto data:', error);
    throw error;
  }
}

export async function fetchOHLCData(coinId: string, days: number): Promise<OHLCData[]> {
  try {
    const cacheKey = `ohlc-${coinId}-${days}`;
    
    // Check cache first
    const cached = getCachedResponse<OHLCData[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if request is already in flight
    const inFlight = inFlightRequests.get(cacheKey);
    if (inFlight) {
      return inFlight;
    }

    // Make new request
    const requestPromise = (async () => {
      try {
        const response = await fetch(`${COINGECKO_API_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`);

        if (!response.ok) {
          throw new Error('Failed to fetch OHLC data');
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
    console.error('Error fetching OHLC data:', error);
    throw error;
  }
}
