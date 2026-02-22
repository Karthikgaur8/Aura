// ============================================================
// hooks/useTradeExecution.ts — Dev B
// Calls /api/trade to execute confirmed trades
// ============================================================

'use client';

import { useState, useCallback } from 'react';
import type { TradeOrder, TradeResult } from '@/types';

export function useTradeExecution() {
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<TradeResult | null>(null);

    const executeTrade = useCallback(async (order: TradeOrder): Promise<TradeResult> => {
        setIsExecuting(true);
        setResult(null);

        console.log('[useTradeExecution] Sending order:', JSON.stringify(order, null, 2));

        try {
            const response = await fetch('/api/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order),
            });

            console.log('[useTradeExecution] Response status:', response.status);
            const data: TradeResult = await response.json();
            console.log('[useTradeExecution] Response data:', JSON.stringify(data, null, 2));
            setResult(data);
            return data;
        } catch (error) {
            const errorResult: TradeResult = {
                success: false,
                error: error instanceof Error ? error.message : 'Trade execution failed',
            };
            setResult(errorResult);
            return errorResult;
        } finally {
            setIsExecuting(false);
        }
    }, []);

    const reset = useCallback(() => {
        setResult(null);
        setIsExecuting(false);
    }, []);

    return { executeTrade, isExecuting, result, reset };
}
