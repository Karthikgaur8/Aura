// ============================================================
// api/trade/route.ts — Dev C
// Trade execution endpoint — POST to submit orders
// ============================================================

import { NextResponse } from 'next/server';
import { submitOrder, getAccount, getPositions } from '@/lib/alpaca';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { ticker, qty, side, type, stop_loss } = body;

        // Validate required fields
        if (!ticker || !qty || !side || !type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: ticker, qty, side, type' },
                { status: 400 }
            );
        }

        // TODO: Dev C — check buying power before submitting
        // const account = await getAccount();

        const result = await submitOrder(ticker, qty, side, type, stop_loss);

        return NextResponse.json(result);
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

    try {
        if (action === 'account') {
            const account = await getAccount();
            return NextResponse.json(account);
        }

        if (action === 'positions') {
            const positions = await getPositions();
            return NextResponse.json(positions);
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error) {
        console.error('[Trade API] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
