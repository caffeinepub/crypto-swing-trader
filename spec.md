# Crypto Swing Trader

## Current State
- Dashboard shows MarketSentimentPanel and CryptoTable with a Signal column (price-action based: buy/sell/neutral badges with tooltips)
- No dedicated panel surfacing only actionable setups at a glance
- TradingSignalsPanel exists but is used only on CryptoDetail pages

## Requested Changes (Diff)

### Add
- **TradeSetupScanner component**: Collapsible panel on Dashboard (above CryptoTable) that scans all loaded coins and lists only those with BUY or SELL signals (not neutral). Shows coin name/symbol/icon, signal label, reason, and a "View" link to the detail page. Header shows count badge (e.g. "7 Setups Found"). Uses the same getPriceSignal logic already in CryptoTable — zero extra API calls.
- **Setup count badge** in Dashboard header area next to the timeframe selector showing live count of actionable setups.

### Modify
- Dashboard.tsx: Import and render TradeSetupScanner between the header and MarketSentimentPanel, passing the cryptos array.

### Remove
- Nothing removed.

## Implementation Plan
1. Create `src/frontend/src/components/TradeSetupScanner.tsx`
   - Accept `cryptos: CryptoMarketData[]` prop
   - Filter to coins where signal type is "buy" or "sell" using shared getPriceSignal logic
   - Render collapsible card with cyberpunk styling (neon-cyan border, glow-ambient)
   - Show count badge in header; "No setups right now" empty state
   - Each row: coin icon, name, symbol, signal badge, reason text, arrow link to /crypto/:id
   - Default expanded when setups > 0, collapsed otherwise
2. Update Dashboard.tsx to import and place TradeSetupScanner above MarketSentimentPanel
