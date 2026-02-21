// ============================================================
// lib/market.ts — Dev C
// Market data fetching (Alpaca Market Data or Alpha Vantage)
// ============================================================

import type { StockBar, StockQuote } from '@/types';

/** Fetch stock bars (OHLCV) for a given ticker and period */
export async function getStockBars(
    ticker: string,
    period: '1D' | '1W' | '1M' | '3M' | '1Y' = '1M'
): Promise<StockBar[]> {
    // TODO: Dev C — implement using Alpaca Market Data API or Alpha Vantage
    console.log(`[Market] Fetching bars for ${ticker} (${period})`);

    // Placeholder mock data
    return [];
}

/** Fetch current stock quote snapshot */
export async function getStockQuote(ticker: string): Promise<StockQuote> {
    // TODO: Dev C — implement using Alpaca Market Data API
    console.log(`[Market] Fetching quote for ${ticker}`);

    // Placeholder mock data
    return {
        ticker,
        price: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
    };
}
