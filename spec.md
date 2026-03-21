# Crypto Swing Trader

## Current State
App has RSI (Wilder's smoothing), MACD crossover detection, MA crossover, Bollinger Band signals. Trade Setup Scanner sorts by priority (1-4). No divergence detection. No composite scoring.

## Requested Changes (Diff)

### Add
- RSI Divergence Detection in technicalIndicators.ts
- Composite Signal Score (0-100) in tradingSignals.ts
- Score display + sort in TradeSetupScanner
- Divergence as high-confidence signal in generateTradingSignals

### Modify
- TechnicalIndicators interface: add divergence field
- useTechnicalIndicators.ts: compute divergence from full series
- TradeSetupScanner.tsx: sort by composite score, show score badge
- Dashboard.tsx: compute composite scores

### Remove
- Nothing

## Implementation Plan
1. Add DivergenceResult + detectDivergence to technicalIndicators.ts
2. Update useTechnicalIndicators.ts to include divergence
3. Add calculateCompositeScore + divergence signal to tradingSignals.ts
4. Update TradeSetupScanner.tsx with score display and sorting
5. Validate build
