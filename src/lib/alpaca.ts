// ============================================================
// lib/alpaca.ts — Dev C (patched by Dev B bugfix)
// Alpaca Paper Trading — direct REST API calls (no SDK needed)
// ============================================================

const ALPACA_API_KEY = process.env.ALPACA_API_KEY || '';
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET || '';
const ALPACA_BASE_URL = process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';

function alpacaHeaders(): HeadersInit {
    return {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
        'Content-Type': 'application/json',
    };
}

/** Submit a trade order to Alpaca */
export async function submitOrder(
    ticker: string,
    qty: number,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop' | 'stop_limit',
    stopLoss?: number
) {
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
        console.warn('[Alpaca] No API keys configured, returning mock order');
        return {
            success: true,
            orderId: `mock-${Date.now()}`,
            status: 'accepted',
            filledPrice: 0,
        };
    }

    try {
        const orderBody: Record<string, unknown> = {
            symbol: ticker.toUpperCase(),
            qty: qty.toString(),
            side,
            type,
            time_in_force: 'day',
        };

        // If stop_limit, we need stop_price
        if ((type === 'stop' || type === 'stop_limit') && stopLoss) {
            orderBody.stop_price = stopLoss.toString();
        }

        console.log(`[Alpaca] Submitting order:`, orderBody);

        const res = await fetch(`${ALPACA_BASE_URL}/v2/orders`, {
            method: 'POST',
            headers: alpacaHeaders(),
            body: JSON.stringify(orderBody),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[Alpaca] Order error ${res.status}: ${errText}`);
            return {
                success: false,
                error: `Alpaca API error: ${errText}`,
            };
        }

        const order = await res.json();
        return {
            success: true,
            orderId: order.id,
            status: order.status,
            filledPrice: order.filled_avg_price ? parseFloat(order.filled_avg_price) : 0,
        };
    } catch (error) {
        console.error('[Alpaca] Order submission failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Order submission failed',
        };
    }
}

/** Get account details */
export async function getAccount() {
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
        return {
            buyingPower: 100000,
            portfolioValue: 100000,
            cash: 100000,
            dayTradeCount: 0,
        };
    }

    try {
        const res = await fetch(`${ALPACA_BASE_URL}/v2/account`, {
            headers: alpacaHeaders(),
        });

        if (!res.ok) {
            console.error(`[Alpaca] Account error: ${res.status}`);
            return { buyingPower: 0, portfolioValue: 0, cash: 0, dayTradeCount: 0 };
        }

        const data = await res.json();
        return {
            buyingPower: parseFloat(data.buying_power) || 0,
            portfolioValue: parseFloat(data.portfolio_value) || 0,
            cash: parseFloat(data.cash) || 0,
            dayTradeCount: data.daytrade_count || 0,
        };
    } catch (error) {
        console.error('[Alpaca] Failed to get account:', error);
        return { buyingPower: 0, portfolioValue: 0, cash: 0, dayTradeCount: 0 };
    }
}

/** Get current positions */
export async function getPositions() {
    if (!ALPACA_API_KEY || !ALPACA_API_SECRET) {
        return [];
    }

    try {
        const res = await fetch(`${ALPACA_BASE_URL}/v2/positions`, {
            headers: alpacaHeaders(),
        });

        if (!res.ok) {
            console.error(`[Alpaca] Positions error: ${res.status}`);
            return [];
        }

        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return data.map((pos: any) => ({
            ticker: pos.symbol,
            qty: parseFloat(pos.qty),
            avgEntryPrice: parseFloat(pos.avg_entry_price),
            currentPrice: parseFloat(pos.current_price),
            unrealizedPL: parseFloat(pos.unrealized_pl),
            unrealizedPLPercent: parseFloat(pos.unrealized_plpc) * 100,
        }));
    } catch (error) {
        console.error('[Alpaca] Failed to get positions:', error);
        return [];
    }
}
