// ============================================================
// api/trade/route.ts — Dev C
// Trade execution endpoint — proxies to Python FastAPI backend
// ============================================================

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('[Trade API POST] Received body from frontend:', JSON.stringify(body));
        console.log('[Trade API POST] Forwarding to:', `${BACKEND_URL}/api/trade`);

        const res = await fetch(`${BACKEND_URL}/api/trade`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        console.log('[Trade API POST] Backend response status:', res.status, 'data:', JSON.stringify(data));

        if (!res.ok) {
            return NextResponse.json(
                { success: false, error: data.detail || 'Trade failed' },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Trade API] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (!action) {
        return NextResponse.json({ error: "Missing 'action' query param. Use 'account' or 'positions'." }, { status: 400 });
    }

    try {
        const res = await fetch(`${BACKEND_URL}/api/trade?action=${action}`);
        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { error: data.detail || 'Request failed' },
                { status: res.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[Trade API] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
