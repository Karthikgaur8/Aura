// ============================================================
// lib/tools.ts — Dev B
// LLM tool definitions using Vercel AI SDK tool() helper
// ============================================================

import { z } from 'zod';

/** Tool: Render a stock chart for a given ticker */
export const renderStockChartTool = {
    description:
        'Display a stock chart for the given ticker symbol. Use this when the user asks about a stock price, performance, or wants to see a chart.',
    parameters: z.object({
        ticker: z.string().describe('The stock ticker symbol, e.g. AAPL, TSLA, MSFT'),
        period: z
            .enum(['1D', '1W', '1M', '3M', '1Y'])
            .optional()
            .default('1M')
            .describe('Time period for the chart'),
    }),
    execute: async ({ ticker, period }: { ticker: string; period: string }) => {
        // TODO: Dev B — call /api/market to fetch real data
        return { ticker, period, bars: [] };
    },
};

/** Tool: Generate a trade receipt for user confirmation */
export const generateTradeReceiptTool = {
    description:
        'Generate a trade confirmation receipt for the user to review before executing. Use this when the user wants to buy or sell a stock.',
    parameters: z.object({
        ticker: z.string().describe('The stock ticker symbol'),
        qty: z.number().positive().describe('Number of shares'),
        side: z.enum(['buy', 'sell']).describe('Buy or sell'),
        orderType: z
            .enum(['market', 'limit', 'stop', 'stop_limit'])
            .default('market')
            .describe('Order type'),
        stopLoss: z.number().optional().describe('Stop loss price, if applicable'),
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
        stopLoss?: number;
    }) => {
        // TODO: Dev B — fetch current price from /api/market and compute estimated total
        return {
            ticker,
            qty,
            side,
            orderType,
            estimatedTotal: 0,
            currentPrice: 0,
            stopLoss,
        };
    },
};
