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

    const response = await fetch(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cryptocurrency data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
}

export async function fetchOHLCData(coinId: string, days: number): Promise<OHLCData[]> {
  try {
    const response = await fetch(`${COINGECKO_API_BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`);

    if (!response.ok) {
      throw new Error('Failed to fetch OHLC data');
    }

    const data: number[][] = await response.json();
    return data.map((item) => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
    }));
  } catch (error) {
    console.error('Error fetching OHLC data:', error);
    throw error;
  }
}
