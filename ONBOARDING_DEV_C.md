# 💹 Developer C — Alpaca API & Market Data Onboarding

## Your Role
You own **all backend finance logic** — Alpaca paper trading, market data fetching, and the trade/market API routes.

## Setup
```bash
git clone https://github.com/Karthikgaur8/Aura.git
cd Aura
npm install
cp .env.example .env.local
# Fill in your Alpaca keys in .env.local (see below)
git checkout -b feat/alpaca
npm run dev
```

### Getting Alpaca API Keys (2 minutes)
1. Go to https://app.alpaca.markets/signup — create a free account
2. Switch to **Paper Trading** mode (toggle in top bar)
3. Go to API Keys → Generate New Key
4. Copy `ALPACA_API_KEY` and `ALPACA_API_SECRET` into `.env.local`
5. Set `ALPACA_BASE_URL=https://paper-api.alpaca.markets`

## Your Files (ONLY touch these)
```
src/lib/alpaca.ts           ← Alpaca trading client
src/lib/market.ts           ← Market data fetching
src/app/api/trade/route.ts  ← Trade execution endpoint
src/app/api/market/route.ts ← Market data endpoint
```

## DO NOT touch
- `src/components/*` (Dev A)
- `src/hooks/*` (Dev B)
- `src/lib/ai.ts`, `src/lib/tools.ts` (Dev B)
- `src/app/page.tsx`, `src/app/layout.tsx` (Dev A)
- `src/app/api/chat/*` (Dev B)

## Your Tasks (in order)

### Phase 1 (~2 hours)
1. `npm install @alpacahq/alpaca-trade-api` — Alpaca SDK
2. **`src/lib/alpaca.ts`** — Initialize Alpaca client in paper mode. Implement:
   - `submitOrder(ticker, qty, side, type, stopLoss?)` — create market/limit/stop orders
   - `getAccount()` — return buying power, portfolio value, cash
   - `getPositions()` — return current positions with P&L
3. **`src/app/api/trade/route.ts`** — Already stubbed. Replace the mock with real Alpaca calls:
   - `POST` → validate inputs, check buying power, call `submitOrder()`, return order confirmation
   - `GET ?action=account` → return account summary
   - `GET ?action=positions` → return positions
4. **`src/lib/market.ts`** — Fetch real market data. Options:
   - **Alpaca Market Data API** (recommended, same keys): `GET /v2/stocks/{symbol}/bars`
   - **Alpha Vantage** (backup): free API key from https://www.alphavantage.co/support/#api-key
   - Implement: `getStockBars(ticker, period)` and `getStockQuote(ticker)`
5. **`src/app/api/market/route.ts`** — Already stubbed. Replace mock with real data:
   - `GET ?ticker=AAPL&period=1M` → return OHLCV bars
   - `GET ?ticker=AAPL&action=quote` → return current price

### Phase 2 (~3 hours)
6. Add **stop-loss / bracket order** support in `alpaca.ts`
7. Add **order validation** — reject if insufficient buying power
8. Support **all time ranges**: 1D (5min bars), 1W (15min bars), 1M (daily), 3M (daily), 1Y (weekly)
9. Add **structured error handling** — return clear JSON errors for all failure cases
10. **Pre-seed the paper account** — make a few manual trades so the demo has existing positions

### Key Types (from `src/types/index.ts`)
```typescript
interface TradeOrder { ticker, qty, side, type, limitPrice?, stopPrice? }
interface TradeResult { success, orderId?, status?, filledPrice?, error? }
interface StockBar { timestamp, open, high, low, close, volume }
interface StockQuote { ticker, price, change, changePercent, volume }
interface Position { ticker, qty, avgEntryPrice, currentPrice, unrealizedPL, unrealizedPLPercent }
interface AccountSummary { buyingPower, portfolioValue, cash, dayTradeCount }
```

## API Contract (what Dev B's tools will call)

### POST /api/trade
```json
// Request
{ "ticker": "AAPL", "qty": 5, "side": "buy", "type": "market", "stop_loss": 170.00 }
// Response
{ "success": true, "orderId": "abc-123", "status": "accepted", "filledPrice": 185.50 }
```

### GET /api/market?ticker=AAPL&period=1M
```json
// Response
{ "ticker": "AAPL", "period": "1M", "bars": [{ "timestamp": "...", "open": 180, "high": 185, "low": 179, "close": 184, "volume": 50000 }] }
```

### GET /api/market?ticker=AAPL&action=quote
```json
// Response
{ "ticker": "AAPL", "price": 185.50, "change": 2.30, "changePercent": 1.25, "volume": 45000000 }
```

## Testing Your Work
```bash
# Test trade endpoint
curl -X POST http://localhost:3000/api/trade -H "Content-Type: application/json" -d '{"ticker":"AAPL","qty":1,"side":"buy","type":"market"}'

# Test market data
curl "http://localhost:3000/api/market?ticker=AAPL&period=1M"

# Test quote
curl "http://localhost:3000/api/market?ticker=AAPL&action=quote"

# Test account
curl "http://localhost:3000/api/trade?action=account"
```

## Merge Strategy
You merge to `main` THIRD (after Dev A and Dev B). Your files have zero overlap with theirs.
