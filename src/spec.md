# Specification

## Summary
**Goal:** Add a comprehensive trade alerts system with in-app notifications and history tracking, plus a market heatmap visualization with toggleable analytical layers.

**Planned changes:**
- Implement toast notifications for swing trading signals (RSI, MACD, support/resistance breaks) that auto-dismiss after 5-7 seconds
- Create Alert History page showing all triggered alerts with filters by cryptocurrency and signal type
- Store alert data in Motoko backend associated with user principals
- Build Market Heatmap page displaying all tracked cryptocurrencies as blocks sized by market cap and colored by 24h price change
- Add toggleable overlay layers to heatmap: Volume Change (unusual spikes), Volatility, BTC Correlation, and RSI Levels
- Calculate and display volume analysis showing unusual activity (>2x average)
- Add Fibonacci retracement level overlays to candlestick charts with toggle control
- Enhance mobile-first responsive design for all new features with touch-friendly controls and adaptive layouts

**User-visible outcome:** Users receive real-time in-app notifications for trading signals, can review their complete alert history with filtering options, visualize the entire crypto market at a glance through an interactive heatmap with multiple analytical layers, and access Fibonacci retracement levels on price charts - all optimized for mobile devices.
