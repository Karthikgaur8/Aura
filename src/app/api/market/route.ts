// ============================================================
// api/market/route.ts — Dev C
// Market data endpoint — proxies to Python FastAPI backend
// ============================================================

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');
    const period = searchParams.get('period') || '1M';
    const action = searchParams.get('action') || 'bars';

    if (!ticker) {
        return NextResponse.json({ error: 'Missing required parameter: ticker' }, { status: 400 });
    }

    try {
        const params = new URLSearchParams({ ticker, action, period });
        const res = await fetch(`${BACKEND_URL}/api/market?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: data.detail || 'Request failed' },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Market API] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
