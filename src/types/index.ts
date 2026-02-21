// ============================================================
// Aura — Shared TypeScript Types
// ============================================================

/** The current UI interaction mode */
export type InteractionMode = 'voice' | 'chat';

/** Visual states of the main page */
export type AppState = 'entry' | 'data-render' | 'trade-confirm';

/** Stock chart data point (OHLCV) */
export interface StockBar {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** Stock quote snapshot */
export interface StockQuote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

/** Trade order request */
export interface TradeOrder {
  ticker: string;
  qty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  limitPrice?: number;
  stopPrice?: number;
}

/** Trade order response from Alpaca */
export interface TradeResult {
  success: boolean;
  orderId?: string;
  status?: string;
  filledPrice?: number;
  error?: string;
}

/** Trade receipt shown to user before confirmation */
export interface TradeReceipt {
  ticker: string;
  qty: number;
  side: 'buy' | 'sell';
  orderType: string;
  estimatedTotal: number;
  currentPrice: number;
  stopLoss?: number;
}

/** Portfolio position */
export interface Position {
  ticker: string;
  qty: number;
  avgEntryPrice: number;
  currentPrice: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
}

/** Account summary */
export interface AccountSummary {
  buyingPower: number;
  portfolioValue: number;
  cash: number;
  dayTradeCount: number;
}

/** LLM tool call payloads */
export interface RenderStockChartArgs {
  ticker: string;
  period?: '1D' | '1W' | '1M' | '3M' | '1Y';
}

export interface GenerateTradeReceiptArgs {
  ticker: string;
  qty: number;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  stopLoss?: number;
}
