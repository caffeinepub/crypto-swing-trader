# Crypto Swing Trader

## Current State
App supports three chart timeframes: 1H (days=1, 30-min candles), 4H (days=7, 4-hour candles), Daily (days=90, daily candles). The timeframe type is `"1H" | "4H" | "Daily"` used throughout TimeframeSelector, useChartData, useTechnicalIndicators, useTradingSignals, CryptoDetail, CandlestickChart, TradeSetupScanner, and CryptoTable.

CoinGecko free OHLC endpoint minimum is 30-min candles (days=1). However, the `/market_chart?days=1` endpoint returns ~5-minute price points, which can be bucketed into 15-minute synthetic OHLC candles.

## Requested Changes (Diff)

### Add
- "15m" as a new timeframe option (before 1H) on chart and TimeframeSelector
- `fetchMarketChartOHLC(coinId)` in coingecko.ts using `/market_chart?vs_currency=usd&days=1&interval=minutely` to get granular price data, then bucket into 15-min OHLC candles
- 15m timeframe support in useChartData (uses market_chart approach to get ~15m candles)
- 15m signals in TradeSetupScanner and signal column (tagged with timeframe label)
- Trade Setup Scanner now shows which timeframe a setup was detected on (15m, 1H, 4H, Daily)

### Modify
- Timeframe type union: `"15m" | "1H" | "4H" | "Daily"` everywhere it appears
- TimeframeSelector: add 15m tab
- useChartData daysMap: add 15m entry (special case using market_chart)
- useTechnicalIndicators and useTradingSignals: accept new type
- CryptoDetail: default state uses "4H", no change needed except type
- CandlestickChart: accepts new type, no behavioral change
- TradeSetupScanner: show timeframe label on each setup row

### Remove
- Nothing removed

## Implementation Plan
1. Add `fetchMarketChart15m` to coingecko.ts: fetch market_chart for 1 day, bucket prices into 15-min OHLC
2. Update timeframe type union in useChartData, useTechnicalIndicators, useTradingSignals
3. Add 15m branch in useChartData queryFn
4. Update TimeframeSelector to show 15m tab
5. Update CryptoDetail state type
6. Update TradeSetupScanner to show timeframe badges on each setup row
