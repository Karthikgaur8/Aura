// ============================================================
// lib/alpaca.ts — Dev C
// Alpaca Paper Trading client and helper functions
// ============================================================

// TODO: Dev C — import and initialize Alpaca client
// import Alpaca from '@alpacahq/alpaca-trade-api';

interface AlpacaConfig {
    keyId: string;
    secretKey: string;
    baseUrl: string;
    paper: boolean;
}

function getAlpacaConfig(): AlpacaConfig {
    return {
        keyId: process.env.ALPACA_API_KEY || '',
        secretKey: process.env.ALPACA_API_SECRET || '',
        baseUrl: process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets',
        paper: true,
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
    const config = getAlpacaConfig();

    // TODO: Dev C — implement actual Alpaca API call
    // const alpaca = new Alpaca(config);
    // const order = await alpaca.createOrder({ ... });

    console.log(`[Alpaca] Submitting order: ${side} ${qty}x ${ticker} (${type})`);

    // Placeholder response
    return {
        success: true,
        orderId: `mock-${Date.now()}`,
        status: 'accepted',
        filledPrice: 0,
    };
}

/** Get account details */
export async function getAccount() {
    const config = getAlpacaConfig();
    // TODO: Dev C — implement
    console.log('[Alpaca] Getting account info');
    return {
        buyingPower: 100000,
        portfolioValue: 100000,
        cash: 100000,
        dayTradeCount: 0,
    };
}

/** Get current positions */
export async function getPositions() {
    const config = getAlpacaConfig();
    // TODO: Dev C — implement
    console.log('[Alpaca] Getting positions');
    return [];
}
