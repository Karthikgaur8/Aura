// ============================================================
// lib/tools.ts — Dev B
// LLM tool definitions with server-side execute functions
// These execute on the server and return data to the client
// ============================================================

import { z } from 'zod/v3';
import type { StockBar, TradeReceipt } from '@/types';

// Call the Python backend directly — tools execute server-side inside Next.js,
// so calling Next.js API routes from here would be a self-referencing HTTP loop.
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/** Tool: Get a live stock quote */
export const getStockQuoteTool = {
    description:
        'Get a live, real-time price quote for a given stock or crypto ticker. Use this when the user asks for the current price or how a specific stock is doing right now.',
    parameters: z.object({
        ticker: z.string().describe('The stock or crypto ticker symbol, e.g. AAPL, BTC, NVDA'),
    }),
    execute: async ({ ticker }: { ticker: string }) => {
        const normalizedTicker = ticker.toUpperCase();
        // #region agent log
        fetch('http://127.0.0.1:7299/ingest/98580928-d973-4442-9a49-20081ca81a13',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a9847'},body:JSON.stringify({sessionId:'8a9847',location:'tools.ts:get_stock_quote',message:'Tool executing',data:{ticker:normalizedTicker,backendUrl:BACKEND_URL},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        try {
            const res = await fetch(
                `${BACKEND_URL}/api/market?ticker=${encodeURIComponent(normalizedTicker)}&action=quote`
            );
            if (!res.ok) {
                return { ticker: normalizedTicker, error: 'Failed to fetch quote' };
            }
            const data = await res.json();
            return data;
        } catch (error) {
            console.error('[get_stock_quote] Error:', error);
            return { ticker: normalizedTicker, error: 'Market data unavailable' };
        }
    },
};

/** Tool: Render a stock chart for a given ticker */
export const renderStockChartTool = {
    description:
        'Display a stock chart for the given ticker symbol. Use this when the user asks about a stock price, performance, or wants to see a chart.',
    parameters: z.object({
        ticker: z.string().describe('The stock ticker symbol, e.g. AAPL, TSLA, MSFT'),
        period: z.enum(['1D', '1W', '1M', '3M', '1Y']).describe('Time period for the chart. Defaults to 1M if not specified.'),
    }),
    execute: async ({ ticker, period }: { ticker: string; period: string }) => {
        const normalizedTicker = ticker.toUpperCase();
        const normalizedPeriod = period || '1M';
        // #region agent log
        fetch('http://127.0.0.1:7299/ingest/98580928-d973-4442-9a49-20081ca81a13',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a9847'},body:JSON.stringify({sessionId:'8a9847',location:'tools.ts:render_stock_chart',message:'Tool executing',data:{ticker:normalizedTicker,period:normalizedPeriod,backendUrl:BACKEND_URL},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        try {
            const res = await fetch(
                `${BACKEND_URL}/api/market?ticker=${encodeURIComponent(normalizedTicker)}&period=${normalizedPeriod}`
            );
            if (!res.ok) {
                return { ticker: normalizedTicker, period: normalizedPeriod, bars: [] as StockBar[], error: 'Failed to fetch market data' };
            }
            const data = await res.json();
            return {
                ticker: normalizedTicker,
                period: normalizedPeriod,
                bars: (data.bars || []) as StockBar[],
            };
        } catch (error) {
            console.error('[render_stock_chart] Error:', error);
            return { ticker: normalizedTicker, period: normalizedPeriod, bars: [] as StockBar[], error: 'Market data unavailable' };
        }
    },
};

/** Tool: Generate a trade receipt for user confirmation */
export const generateTradeReceiptTool = {
    description:
        'Generate a trade confirmation receipt for the user to review before executing. Use this when the user wants to buy or sell a stock.',
    parameters: z.object({
        ticker: z.string().describe('The stock ticker symbol'),
        qty: z.number().describe('Number of shares to trade, must be positive'),
        side: z.enum(['buy', 'sell']).describe('Whether to buy or sell'),
        orderType: z.enum(['market', 'limit', 'stop', 'stop_limit']).describe('The order type. Default to market if not specified.'),
        stopLoss: z.number().nullable().describe('Stop loss price if the user wants one, or null if not applicable'),
    }),
    execute: async ({
        ticker,
        qty,
        side,
        orderType,
        stopLoss,
    }: {
        ticker: string;
        qty: number;
        side: string;
        orderType: string;
        stopLoss: number | null;
    }): Promise<TradeReceipt> => {
        const normalizedTicker = ticker.toUpperCase();
        // #region agent log
        fetch('http://127.0.0.1:7299/ingest/98580928-d973-4442-9a49-20081ca81a13',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a9847'},body:JSON.stringify({sessionId:'8a9847',location:'tools.ts:generate_trade_receipt',message:'Tool executing',data:{ticker:normalizedTicker,qty,side,orderType,backendUrl:BACKEND_URL},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        let currentPrice = 0;
        try {
            const res = await fetch(
                `${BACKEND_URL}/api/market?ticker=${encodeURIComponent(normalizedTicker)}&action=quote`
            );
            if (res.ok) {
                const quote = await res.json();
                currentPrice = quote.price || 0;
            }
        } catch (error) {
            console.error('[generate_trade_receipt] Price fetch error:', error);
        }

        const estimatedTotal = currentPrice * qty;

        return {
            ticker: normalizedTicker,
            qty,
            side: side as 'buy' | 'sell',
            orderType,
            estimatedTotal,
            currentPrice,
            stopLoss: stopLoss ?? undefined,
        };
    },
};
