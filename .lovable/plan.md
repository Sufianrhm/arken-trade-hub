
# Premium Exchange UI Redesign - ARKENX

## Overview
Transform ARKENX into a professional-grade trading platform matching the visual quality and feature set of Hyperliquid and Binance. This includes a new landing page, enhanced trading interface, comprehensive simulated trading features, and viral growth mechanics.

---

## Architecture Summary

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           ARKENX Application                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Routes                                                                  │
│  ├─ /          → Landing Page (Hero + Features + CTA)                   │
│  ├─ /trade     → Trading Terminal (Chart + OrderPanel + OrderBook)      │
│  ├─ /portfolio → Portfolio Overview (Equity + Positions + History)      │
│  └─ /leaderboard → Rankings + Share Cards                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Real-time Data                                                          │
│  ├─ WebSocket → Binance kline + depth (7 pairs only)                    │
│  └─ Fallback  → Mock data simulation                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  State Management (LocalStorage)                                         │
│  ├─ User accounts + USDX balance                                        │
│  ├─ Positions + Limit Orders                                            │
│  ├─ Trade history + PnL tracking                                        │
│  └─ ARKX rewards + leaderboard                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Reduce to Top 7 Crypto Pairs

### Update `src/types/trading.ts`
- Limit `MarketSymbol` to: BTC, ETH, SOL, BNB, XRP, DOGE, SUI
- Update `MARKET_SYMBOLS` and `MARKET_DISPLAY_NAMES` accordingly
- Update `DEFAULT_PRICES` with current market values

---

## Phase 2: Create Landing Page

### New File: `src/pages/Landing.tsx`
Premium hero section with:
- Full-screen dark background with subtle grid pattern
- Large "ARKENX" wordmark with tagline
- Live price ticker showing 7 pairs
- Two CTAs: "Start Trading" and "View Leaderboard"
- Features grid: Zero fees, 50x leverage, Instant execution, Paper trading
- Statistics bar: Simulated volume, trades, users
- Connect wallet button

### Update `src/App.tsx`
- Add `/` route for Landing page
- Move current Index to `/trade` route
- Add `/portfolio` and `/leaderboard` routes

---

## Phase 3: Enhanced Trading Terminal

### Update `src/components/arken/TradeTab.tsx`
New Binance/Hyperliquid-style layout:
```text
┌───────────────────────────────────────────────────────────┐
│ Market Bar: [BTC/USDT ▼] $97,000 +2.4% | 24H H/L/Vol     │
├─────────┬─────────────────────────────────┬───────────────┤
│ Order   │                                 │    Order      │
│ Book    │      TradingView Chart         │    Panel      │
│ (bids/  │      + Timeframe Selector      │  (buy/sell)   │
│  asks)  │      + Drawing Tools           │  + TP/SL      │
├─────────┴─────────────────────────────────┴───────────────┤
│ Recent Trades Tape (live prints)                          │
├───────────────────────────────────────────────────────────┤
│ Tabs: [Positions] [Open Orders] [Trade History]           │
│ Position data with live PnL, ROI%, liq price              │
└───────────────────────────────────────────────────────────┘
```

### Update `src/components/arken/OrderPanel.tsx`
- Add fees display (0.1% maker / 0.1% taker - simulated)
- USDX balance display with icon
- Enhanced TP/SL with percentage quick-select
- Leverage slider 1x-50x with notch marks at 1, 5, 10, 25, 50
- Cost/Fee breakdown before order

### Update `src/components/arken/ChartPanel.tsx`
- Clean TradingView-style appearance
- Timeframe buttons styled like Binance
- Drawing tools toolbar (horizontal line, trendline)
- Symbol badge with PERP label

---

## Phase 4: Enhanced Order Book & Recent Trades

### Update `src/components/arken/OrderBook.tsx`
- Depth visualization bars (green/red)
- Spread percentage display
- Click-to-fill price functionality
- Cumulative total column

### Update `src/components/arken/RecentTrades.tsx`
- Live trade prints tape
- Color-coded by buyer/seller
- Time display (HH:MM:SS)
- Quantity in base asset

---

## Phase 5: Positions & Orders Management

### Update `src/components/arken/TradingTabs.tsx`
Three tabs styled like Binance:
1. **Positions**: Live PnL (USD + %), ROI, entry, mark, liq price, close button
2. **Open Orders**: Pending limit orders with cancel button
3. **Trade History**: Completed trades with export CSV

### Update `src/components/arken/PositionsTable.tsx`
- Add ROI % column
- Add liquidation price with warning color if close
- Share PnL button per position
- Compact mode for trading tab

---

## Phase 6: USDX Balance System

### Update `src/hooks/useTradingStore.ts`
- Rename "balance" display to "USDX"
- Track deposits/withdrawals as USDX
- Initial paper balance: 10,000 USDX

### Update `src/components/arken/AccountHub.tsx`
- USDX balance prominently displayed
- Deposit/Withdraw buttons with amounts
- Transaction history

---

## Phase 7: ARKX Rewards System

### New Type: `src/types/trading.ts`
```typescript
interface ARKXReward {
  amount: number;
  reason: 'trade' | 'referral' | 'streak' | 'achievement';
  timestamp: number;
}
```

### New Component: `src/components/arken/RewardsPanel.tsx`
- ARKX token balance display
- Earning methods (trade volume, referrals, daily streak)
- Simulated rewards history
- "Earn ARKX" section with tasks

### Update `src/hooks/useTradingStore.ts`
- Track ARKX balance per user
- Award ARKX on trades (0.01 per $100 volume)
- Award ARKX on referrals (10 ARKX per signup)

---

## Phase 8: PnL Share Card (Viral Feature)

### New Component: `src/components/arken/PnLShareCard.tsx`
Shareable card design:
```text
┌─────────────────────────────────┐
│  ARKENX                         │
│  ─────────────────────────────  │
│  BTC/USDT LONG                  │
│  +$1,234.56 (+24.5% ROI)        │
│  ─────────────────────────────  │
│  Entry: $95,000                 │
│  Mark:  $97,500                 │
│  Leverage: 10x                  │
│  ─────────────────────────────  │
│  Trade on ARKENX.io             │
└─────────────────────────────────┘
```
- Generate as canvas/image
- Share to Twitter button
- Copy image button

---

## Phase 9: Enhanced Leaderboard

### Update `src/components/arken/Leaderboard.tsx`
- Weekly/Monthly/All-time tabs
- Top 3 podium display
- Rank badges (Bronze → Diamond)
- PnL + ROI % columns
- "Share Rank" button with card

---

## Phase 10: Real-time Price Updates

### Update `src/hooks/usePriceData.ts`
- Reduce to 7 pairs only for efficiency
- Keep 1.5s polling for 24h stats
- Add price change flash animation trigger

### Update `src/hooks/useBinanceWebSocket.ts`
- Stream real-time klines for selected pair
- Update order book with depth data
- Smooth candle updates on tick

---

## Phase 11: Premium UI Polish

### Update `src/index.css`
Additional utility classes:
- `.price-up` / `.price-down` flash animations
- `.btn-primary-glow` for main CTAs
- Table row hover effects
- Input focus states

### Update All Components
- Consistent 4px/8px/16px spacing grid
- All-caps labels with `tracking-[0.08em]`
- Tabular numbers for all prices
- Fast 75-100ms transitions
- Sharp borders, no rounded corners over 8px

---

## Phase 12: Wallet Connect (Optional)

### New Component: `src/components/arken/WalletButton.tsx`
- "Connect Wallet" button (UI only, no actual connection)
- Shows "Coming Soon" tooltip
- Placeholder for future Web3 integration

---

## Technical Notes

### Files to Create
1. `src/pages/Landing.tsx` - New landing page
2. `src/components/arken/PnLShareCard.tsx` - Viral share card
3. `src/components/arken/RewardsPanel.tsx` - ARKX rewards display
4. `src/components/arken/WalletButton.tsx` - Wallet connect placeholder
5. `src/components/arken/FeesDisplay.tsx` - Trading fees breakdown

### Files to Modify
1. `src/App.tsx` - Add new routes
2. `src/types/trading.ts` - Reduce pairs, add ARKX types
3. `src/hooks/useTradingStore.ts` - ARKX rewards, USDX naming
4. `src/hooks/usePriceData.ts` - 7 pairs only
5. `src/components/arken/TradeTab.tsx` - New layout
6. `src/components/arken/OrderPanel.tsx` - Fees, enhanced inputs
7. `src/components/arken/ChartPanel.tsx` - Premium styling
8. `src/components/arken/OrderBook.tsx` - Click-to-fill
9. `src/components/arken/RecentTrades.tsx` - Live tape
10. `src/components/arken/TradingTabs.tsx` - Enhanced tabs
11. `src/components/arken/PositionsTable.tsx` - ROI, share button
12. `src/components/arken/Navbar.tsx` - USDX display, navigation
13. `src/components/arken/Leaderboard.tsx` - Time filters, podium
14. `src/components/arken/AccountHub.tsx` - USDX branding
15. `src/components/arken/PortfolioTab.tsx` - Enhanced stats
16. `src/index.css` - New animations

---

## Estimated Implementation Order
1. Reduce to 7 pairs (quick win)
2. Create landing page
3. Update routing
4. Enhance trading terminal layout
5. Add fees display
6. Implement PnL share card
7. Add ARKX rewards
8. Polish all components
9. Test end-to-end flow
