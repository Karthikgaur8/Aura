// ============================================================
// api/chat/route.ts — Dev B
// LLM streaming endpoint using Vercel AI SDK
// Handles text streaming + tool calls (chart, trade receipt)
// ============================================================

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { SYSTEM_PROMPT } from '@/lib/ai';
import { renderStockChartTool, generateTradeReceiptTool, getStockQuoteTool } from '@/lib/tools';

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: SYSTEM_PROMPT,
            messages,
            tools: {
                get_stock_quote: getStockQuoteTool,
                render_stock_chart: renderStockChartTool,
                generate_trade_receipt: generateTradeReceiptTool,
            },
            maxToolRoundtrips: 3,
        });

        return result.toDataStreamResponse();
    } catch (error: unknown) {
        console.error('[/api/chat] Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
