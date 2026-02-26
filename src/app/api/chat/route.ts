// ============================================================
// api/chat/route.ts — Dev B
// LLM streaming endpoint using Vercel AI SDK
// Handles text streaming + tool calls (chart, trade receipt)
// ============================================================

import { z } from 'zod';
import { streamText, tool, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SYSTEM_PROMPT } from '@/lib/ai';
import { renderStockChartTool, generateTradeReceiptTool, getStockQuoteTool } from '@/lib/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;
        console.log('[/api/chat] Incoming message count:', messages?.length);
        console.log('[/api/chat] Last message:', JSON.stringify(messages?.[messages.length - 1]).slice(0, 300));

        // Convert UIMessage[] (parts-based) to ModelMessage[] (content-based) for streamText
        const modelMessages = await convertToModelMessages(messages);
        console.log('[/api/chat] Converted model message count:', modelMessages.length);
        console.log('[/api/chat] Last model message:', JSON.stringify(modelMessages[modelMessages.length - 1]).slice(0, 300));

        const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: SYSTEM_PROMPT,
            messages: modelMessages,
            tools: {
                get_stock_quote: {
                    description: getStockQuoteTool.description,
                    inputSchema: z.object({
                        ticker: z.string().describe('The stock or crypto ticker symbol, e.g. AAPL, BTC, NVDA'),
                    }),
                    execute: async (args: any) => getStockQuoteTool.execute(args)
                },
                render_stock_chart: {
                    description: renderStockChartTool.description,
                    inputSchema: z.object({
                        ticker: z.string().describe('The stock ticker symbol, e.g. AAPL, TSLA, MSFT'),
                        period: z.enum(['1D', '1W', '1M', '3M', '1Y']).optional().describe('Time period for the chart. Defaults to 1M if not specified.'),
                    }),
                    execute: async (args: any) => renderStockChartTool.execute(args as any)
                },
                generate_trade_receipt: {
                    description: generateTradeReceiptTool.description,
                    inputSchema: z.object({
                        ticker: z.string().describe('The stock ticker symbol'),
                        qty: z.number().describe('Number of shares to trade, must be positive'),
                        side: z.enum(['buy', 'sell']).describe('Whether to buy or sell'),
                        orderType: z.enum(['market', 'limit', 'stop', 'stop_limit']).optional().default('market').describe('The order type. Default to market if not specified.'),
                        stopLoss: z.number().nullable().optional().describe('Stop loss price if the user wants one, or null if not applicable'),
                    }),
                    execute: async (args: any) => generateTradeReceiptTool.execute(args as any)
                },
            },
        });

        return result.toUIMessageStreamResponse();
    } catch (error: unknown) {
        console.error('[/api/chat] Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
