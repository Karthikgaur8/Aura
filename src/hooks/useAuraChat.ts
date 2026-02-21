// ============================================================
// hooks/useAuraChat.ts — Dev B
// Chat state management hook wrapping Vercel AI SDK useChat
// Parses tool invocations to extract chart data & trade receipts
// ============================================================

'use client';

import { useChat, type Message } from 'ai/react';
import { useState, useCallback, useEffect, useMemo } from 'react';
import type { StockBar, TradeReceipt, AppState } from '@/types';

/** Chart data extracted from a render_stock_chart tool call */
export interface ChartData {
    ticker: string;
    period: string;
    bars: StockBar[];
}

export function useAuraChat(options?: { onFinish?: (text: string) => void }) {
    const chat = useChat({
        api: '/api/chat',
        initialMessages: [],
        onFinish: (message) => {
            if (options?.onFinish && message.content) {
                options.onFinish(message.content);
            }
        },
    });

    // Derived state from tool invocations
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [tradeReceipt, setTradeReceipt] = useState<TradeReceipt | null>(null);
    const [appState, setAppState] = useState<AppState>('entry');

    // Parse tool invocations from the latest assistant message
    useEffect(() => {
        const lastAssistantMessage = [...chat.messages]
            .reverse()
            .find((m: Message) => m.role === 'assistant');

        if (!lastAssistantMessage?.toolInvocations) return;

        for (const invocation of lastAssistantMessage.toolInvocations) {
            if (invocation.state !== 'result') continue;

            if (invocation.toolName === 'render_stock_chart' && invocation.result) {
                const result = invocation.result as ChartData;
                setChartData(result);
                setAppState('data-render');
            }

            if (invocation.toolName === 'generate_trade_receipt' && invocation.result) {
                const result = invocation.result as TradeReceipt;
                setTradeReceipt(result);
                setAppState('trade-confirm');
            }
        }
    }, [chat.messages]);

    /** Clear chart data and return to entry state */
    const clearChart = useCallback(() => {
        setChartData(null);
        setAppState('entry');
    }, []);

    /** Clear trade receipt — after execution or cancel */
    const clearReceipt = useCallback(() => {
        setTradeReceipt(null);
        // Go back to chart if we have one, otherwise entry
        setAppState(chartData ? 'data-render' : 'entry');
    }, [chartData]);

    /** Submit a message (works for both typed and voice input) */
    const submitMessage = useCallback(
        (text: string) => {
            chat.setInput(text);
            // Use a microtask to ensure setInput has taken effect
            setTimeout(() => {
                chat.handleSubmit(new Event('submit') as unknown as React.FormEvent);
            }, 0);
        },
        [chat]
    );

    /** Get the latest text response from the assistant (for TTS) */
    const latestAssistantText = useMemo(() => {
        const lastMsg = [...chat.messages]
            .reverse()
            .find((m: Message) => m.role === 'assistant' && m.content);
        return lastMsg?.content || '';
    }, [chat.messages]);

    return {
        // Core chat
        messages: chat.messages,
        input: chat.input,
        setInput: chat.setInput,
        handleSubmit: chat.handleSubmit,
        handleInputChange: chat.handleInputChange,
        isLoading: chat.isLoading,
        error: chat.error,
        submitMessage,

        // Parsed tool results
        chartData,
        tradeReceipt,
        appState,
        setAppState,
        latestAssistantText,

        // Actions
        clearChart,
        clearReceipt,
    };
}
