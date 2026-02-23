# Specification

## Summary
**Goal:** Improve API reliability with retry logic and request batching, add dashboard timeframe selector, and implement AI-powered trade recommendations with entry points and take-profit targets.

**Planned changes:**
- Add user-friendly retry buttons to error states in CryptoTable and data-fetching components
- Implement exponential backoff retry logic in useCryptoPrices hook to handle API rate limiting
- Implement request batching in coingecko.ts to fetch multiple coins in a single API call
- Add TimeframeSelector component to Dashboard page header to control chart timeframes (1H, 4H, Daily)
- Create AI Trade Analysis card component on CryptoDetail page that analyzes technical indicators
- Build recommendation generation logic that calculates entry points, three take-profit targets (conservative 5-8%, moderate 10-15%, aggressive 20-30%), stop-loss prices, confidence scores, and risk levels
- Display recommendations in real-time with visual hierarchy showing entry point, take-profit targets, stop-loss, confidence score, risk level, and reasoning text
- Auto-recalculate recommendations when technical data updates

**User-visible outcome:** Users can manually retry failed data loads with a prominent button, experience fewer API errors due to intelligent retry logic and batching, select their preferred timeframe from the dashboard header to control chart displays, and receive AI-generated trade recommendations on coin detail pages showing specific entry points, multiple take-profit targets, stop-loss levels, and confidence scores with detailed reasoning.
