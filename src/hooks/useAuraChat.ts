// ============================================================
// hooks/useAuraChat.ts — Dev B
// Chat state management hook wrapping Vercel AI SDK useChat
// Parses tool invocations to extract chart data & trade receipts
// ============================================================

'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { StockBar, TradeReceipt, AppState } from '@/types';

/** Chart data extracted from a render_stock_chart tool call */
export interface ChartData {
    ticker: string;
    period: string;
    bars: StockBar[];
}

/** Strip markdown formatting and emojis so TTS reads clean text */
function sanitizeForSpeech(text: string): string {
    return text
        // Remove markdown bold/italic
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        // Remove markdown headers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove markdown links [text](url) -> text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove emojis (Unicode emoji ranges)
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '')
        // Remove leftover special chars
        .replace(/[→←↑↓·•]/g, '')
        // Collapse multiple spaces
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export function useAuraChat(options?: { onFinish?: (text: string) => void }) {
    const chat = useChat({
        transport: new DefaultChatTransport({ api: '/api/chat' }),
        onFinish: (message: any) => {
            console.log('[useAuraChat] onFinish fired, message:', JSON.stringify(message).slice(0, 200));
            if (options?.onFinish && (message as any).content) {
                options.onFinish(sanitizeForSpeech((message as any).content));
            }
        },
        onError: (error: any) => {
            console.error('[useAuraChat] onError fired:', error);
        },
    });

    // Debug: log status and message count changes
    useEffect(() => {
        console.log('[useAuraChat] status:', chat.status, '| messages:', chat.messages.length);
    }, [chat.status, chat.messages]);

    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [tradeReceipt, setTradeReceipt] = useState<TradeReceipt | null>(null);
    const [appState, setAppState] = useState<AppState>('entry');
    const [input, setInput] = useState('');

    const clearedReceiptIds = useRef<Set<string>>(new Set());
    // Use refs for dedup — avoids putting chartData/tradeReceipt in the dep array
    const prevChartKey = useRef<string>('');
    const prevReceiptKey = useRef<string>('');

    // Parse tool invocations — only depends on messages, uses refs for dedup
    useEffect(() => {
        console.log('[useAuraChat] parseTools effect — message count:', chat.messages.length);
        if (!chat.messages.length) return;

        let foundChart: ChartData | null = null;
        let foundReceipt: TradeReceipt | null = null;
        let foundReceiptId: string | null = null;

        for (let i = chat.messages.length - 1; i >= 0; i--) {
            const m = chat.messages[i];
            if (m.role !== 'assistant' || !m.parts) continue;

            // In ai@6.x, tool parts have types like 'tool-render_stock_chart'
            const toolParts = m.parts.filter((p: any) =>
                typeof p.type === 'string' && p.type.startsWith('tool-')
            );

            for (const part of toolParts) {
                const toolName = (part as any).type.replace('tool-', '');
                const state = (part as any).state;
                const result = (part as any).output ?? (part as any).result;
                const toolCallId = (part as any).toolCallId;

                if (state !== 'output-available' && state !== 'result') continue;

                if (toolName === 'render_stock_chart' && result && !foundChart) {
                    foundChart = result as ChartData;
                }

                if (
                    toolName === 'generate_trade_receipt' &&
                    result &&
                    !foundReceipt &&
                    !clearedReceiptIds.current.has(toolCallId)
                ) {
                    foundReceipt = result as TradeReceipt;
                    foundReceiptId = toolCallId;
                }
            }

            if (foundChart && foundReceipt) break;
        }

        const chartKey = foundChart ? JSON.stringify(foundChart) : '';
        const receiptKey = foundReceipt ? JSON.stringify(foundReceipt) : '';

        // #region agent log

        // #endregion

        // Receipt takes priority over chart for appState
        if (foundReceipt && receiptKey !== prevReceiptKey.current) {
            prevReceiptKey.current = receiptKey;
            setTradeReceipt({ ...foundReceipt, toolCallId: foundReceiptId } as TradeReceipt & { toolCallId: string });
            setAppState('trade-confirm');
        } else if (foundChart && chartKey !== prevChartKey.current) {
            prevChartKey.current = chartKey;
            setChartData(foundChart);
            setAppState('data-render');
        }
    }, [chat.messages]);

    const clearChart = useCallback(() => {
        prevChartKey.current = '';
        setChartData(null);
        setAppState('entry');
    }, []);

    const clearReceipt = useCallback(() => {
        setTradeReceipt((prev) => {
            const typed = prev as (TradeReceipt & { toolCallId?: string }) | null;
            if (typed?.toolCallId) {
                clearedReceiptIds.current.add(typed.toolCallId);
            }
            return null;
        });
        prevReceiptKey.current = '';
        setChartData((prevChart) => {
            setAppState(prevChart ? 'data-render' : 'entry');
            return prevChart;
        });
    }, []);

    /** Submit a message (works for both typed and voice input) */
    const submitMessage = useCallback(
        (text: string) => {
            console.log('[useAuraChat] submitMessage called with:', text);
            console.log('[useAuraChat] current status before send:', chat.status);
            chat.sendMessage({ text });
        },
        [chat]
    );

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | string) => {
        if (typeof e === 'string') {
            setInput(e);
        } else {
            setInput(e.target.value);
        }
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('[useAuraChat] handleSubmit called, input:', JSON.stringify(input));
        if (!input.trim()) {
            console.warn('[useAuraChat] handleSubmit: input was empty, aborting');
            return;
        }
        submitMessage(input);
        setInput('');
    }, [input, submitMessage]);

    /** Get the latest text response from the assistant (for TTS) */
    const latestAssistantText = useMemo(() => {
        const lastMsg = [...chat.messages]
            .reverse()
            .find((m: UIMessage) => m.role === 'assistant' && (m as any).content);
        return (lastMsg as any)?.content || '';
    }, [chat.messages]);

    return {
        // Core chat
        messages: chat.messages,
        input,
        setInput,
        handleSubmit,
        handleInputChange,
        isLoading: chat.status === 'submitted' || chat.status === 'streaming',
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
