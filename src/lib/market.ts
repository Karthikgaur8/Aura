// ============================================================
// lib/market.ts — Dev C (patched by Dev B bugfix)
// Market data fetching via Alpaca Market Data v2 REST API
// ============================================================

import type { StockBar, StockQuote } from '@/types';

const ALPACA_API_KEY = process.env.ALPACA_API_KEY || '';
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET || '';
const ALPACA_DATA_URL = 'https://data.alpaca.markets/v2';

function alpacaHeaders(): HeadersInit {
    return {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
        'Content-Type': 'application/json',
    };
}

/** Convert our period string to Alpaca timeframe + start date */
function periodToParams(period: string): { timeframe: string; start: string } {
    const now = new Date();
    let start: Date;
    let timeframe: string;

    switch (period) {
        case '1D':
            start = new Date(now);
            start.setDate(start.getDate() - 1);
            timeframe = '15Min';
            break;
        case '1W':
            start = new Date(now);
            start.setDate(start.getDate() - 7);
            timeframe = '1Hour';
            break;
        case '1M':
            start = new Date(now);
            start.setMonth(start.getMonth() - 1);
            timeframe = '1Day';
            break;
        case '3M':
            start = new Date(now);
            start.setMonth(start.getMonth() - 3);
            timeframe = '1Day';
            break;
        case '1Y':
            start = new Date(now);
            start.setFullYear(start.getFullYear() - 1);
            timeframe = '1Week';
            break;
        default:
            start = new Date(now);
            start.setMonth(start.getMonth() - 1);
            timeframe = '1Day';
    }

    return {
        timeframe,
        start: start.toISOString().split('T')[0], // YYYY-MM-DD
    };
}

/** Fetch stock bars (OHLCV) for a given ticker and period */
export async function getStockBars(
    ticker: string,
    period: '1D' | '1W' | '1M' | '3M' | '1Y' = '1M'
): Promise<StockBar[]> {
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
        console.warn('[Market] No Alpaca API keys configured, returning mock data');
        return getMockBars(ticker);
    }

    const { timeframe, start } = periodToParams(period);

    try {
        const url = `${ALPACA_DATA_URL}/stocks/${encodeURIComponent(ticker)}/bars?timeframe=${timeframe}&start=${start}&limit=100&adjustment=raw&feed=iex`;
        console.log(`[Market] Fetching bars: ${url}`);

        const res = await fetch(url, { headers: alpacaHeaders() });

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[Market] Alpaca API error ${res.status}: ${errText}`);
            return getMockBars(ticker);
        }

        const data = await res.json();
        const bars = data.bars || [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return bars.map((bar: any) => ({
            timestamp: bar.t,
            open: bar.o,
            high: bar.h,
            low: bar.l,
            close: bar.c,
            volume: bar.v,
        }));
    } catch (error) {
        console.error('[Market] Failed to fetch bars:', error);
        return getMockBars(ticker);
    }
}

/** Fetch current stock quote snapshot */
export async function getStockQuote(ticker: string): Promise<StockQuote> {
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
        console.warn('[Market] No Alpaca API keys configured, returning mock quote');
        return getMockQuote(ticker);
    }

    try {
        const url = `${ALPACA_DATA_URL}/stocks/${encodeURIComponent(ticker)}/snapshot?feed=iex`;
        console.log(`[Market] Fetching quote: ${url}`);

        const res = await fetch(url, { headers: alpacaHeaders() });

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[Market] Alpaca quote error ${res.status}: ${errText}`);
            return getMockQuote(ticker);
        }

        const data = await res.json();
        const latestTrade = data.latestTrade || {};
        const prevDayBar = data.prevDailyBar || {};
        const price = latestTrade.p || 0;
        const prevClose = prevDayBar.c || price;
        const change = price - prevClose;
        const changePercent = prevClose ? (change / prevClose) * 100 : 0;

        return {
            ticker,
            price,
            change,
            changePercent,
            volume: data.dailyBar?.v || 0,
        };
    } catch (error) {
        console.error('[Market] Failed to fetch quote:', error);
        return getMockQuote(ticker);
    }
}

// ── Fallback mock data (when no API keys or API fails) ───────
function getMockBars(ticker: string): StockBar[] {
    const basePrice = getBasePriceForTicker(ticker);
    const bars: StockBar[] = [];
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const variation = (Math.random() - 0.48) * basePrice * 0.03;
        const open = basePrice + variation;
        const close = open + (Math.random() - 0.45) * basePrice * 0.02;
        const high = Math.max(open, close) + Math.random() * basePrice * 0.01;
        const low = Math.min(open, close) - Math.random() * basePrice * 0.01;

        bars.push({
            timestamp: date.toISOString().split('T')[0],
            open: +open.toFixed(2),
            high: +high.toFixed(2),
            low: +low.toFixed(2),
            close: +close.toFixed(2),
            volume: Math.floor(30000000 + Math.random() * 50000000),
        });
    }
    return bars;
}

function getMockQuote(ticker: string): StockQuote {
    const price = getBasePriceForTicker(ticker);
    const change = +(Math.random() * 6 - 2).toFixed(2);
    return {
        ticker,
        price,
        change,
        changePercent: +((change / price) * 100).toFixed(2),
        volume: Math.floor(40000000 + Math.random() * 30000000),
    };
}

function getBasePriceForTicker(ticker: string): number {
    const prices: Record<string, number> = {
        AAPL: 234.56, TSLA: 248.92, MSFT: 428.15, AMZN: 192.34,
        GOOGL: 175.80, NVDA: 875.60, META: 585.20, NFLX: 925.40,
        AMD: 165.30, SPY: 520.10, QQQ: 450.60,
    };
    return prices[ticker.toUpperCase()] || 150 + Math.random() * 100;
}
