// ============================================================
// api/market/route.ts — Dev C
// Market data endpoint — GET stock bars and quotes
// ============================================================

import { NextResponse } from 'next/server';
import { getStockBars, getStockQuote } from '@/lib/market';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');
    const period = searchParams.get('period') as '1D' | '1W' | '1M' | '3M' | '1Y' | null;
    const action = searchParams.get('action') || 'bars';

    if (!ticker) {
        return NextResponse.json({ error: 'Missing required parameter: ticker' }, { status: 400 });
    }

    try {
        if (action === 'quote') {
            const quote = await getStockQuote(ticker);
            return NextResponse.json(quote);
        }

        // Default: return bars
        const bars = await getStockBars(ticker, period || '1M');
        return NextResponse.json({ ticker, period: period || '1M', bars });
    } catch (error) {
        console.error('[Market API] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
