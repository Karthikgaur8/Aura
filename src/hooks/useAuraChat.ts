// ============================================================
// hooks/useAuraChat.ts — Dev B
// Chat state management hook wrapping Vercel AI SDK useChat
// Parses tool invocations to extract chart data & trade receipts
// ============================================================

'use client';

import { useChat, type Message } from 'ai/react';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { StockBar, TradeReceipt, AppState } from '@/types';

/** Chart data extracted from a render_stock_chart tool call */
export interface ChartData {
    ticker: string;
    period: string;
    bars: StockBar[];
}

export function useAuraChat() {
    const chat = useChat({
        api: '/api/chat',
        initialMessages: [],
    });

    // Derived state from tool invocations
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [tradeReceipt, setTradeReceipt] = useState<TradeReceipt | null>(null);
    const [appState, setAppState] = useState<AppState>('entry');

    // Track which tool invocations we've already processed/cleared so old receipts don't resurface
    const processedToolCallIds = useRef<Set<string>>(new Set());

    // Parse tool invocations from ALL assistant messages, but skip already-processed ones
    useEffect(() => {
        let latestChart: ChartData | null = null;
        let latestReceipt: { data: TradeReceipt; id: string } | null = null;

        for (const msg of chat.messages) {
            if (msg.role !== 'assistant' || !msg.toolInvocations) continue;

            for (const invocation of msg.toolInvocations) {
                if (invocation.state !== 'result') continue;
                const callId = `${msg.id}-${invocation.toolName}`;

                // Skip invocations we've already processed and cleared
                if (processedToolCallIds.current.has(callId)) continue;

                if (invocation.toolName === 'render_stock_chart' && invocation.result) {
                    latestChart = invocation.result as ChartData;
                }

                if (invocation.toolName === 'generate_trade_receipt' && invocation.result) {
                    latestReceipt = { data: invocation.result as TradeReceipt, id: callId };
                }
            }
        }

        if (latestChart) {
            setChartData(latestChart);
            setAppState('data-render');
        }
        if (latestReceipt) {
            setTradeReceipt(latestReceipt.data);
            setAppState('trade-confirm');
        }
    }, [chat.messages]);

    /** Clear chart data and return to entry state */
    const clearChart = useCallback(() => {
        setChartData(null);
        setAppState('entry');
    }, []);

    /** Clear trade receipt — mark its tool call ID as processed so it won't resurface */
    const clearReceipt = useCallback(() => {
        // Mark ALL current receipt invocations as processed
        for (const msg of chat.messages) {
            if (msg.role !== 'assistant' || !msg.toolInvocations) continue;
            for (const invocation of msg.toolInvocations) {
                if (invocation.toolName === 'generate_trade_receipt' && invocation.state === 'result') {
                    processedToolCallIds.current.add(`${msg.id}-${invocation.toolName}`);
                }
            }
        }
        setTradeReceipt(null);
        // Go back to chart if we have one, otherwise entry
        setAppState(chartData ? 'data-render' : 'entry');
    }, [chartData, chat.messages]);

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
