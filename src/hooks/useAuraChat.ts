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
        api: '/api/chat',
        initialMessages: [],
        onFinish: (message) => {
            if (options?.onFinish && message.content) {
                options.onFinish(sanitizeForSpeech(message.content));
            }
        },
    });

    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [tradeReceipt, setTradeReceipt] = useState<TradeReceipt | null>(null);
    const [appState, setAppState] = useState<AppState>('entry');

    const clearedReceiptIds = useRef<Set<string>>(new Set());
    // Use refs for dedup — avoids putting chartData/tradeReceipt in the dep array
    const prevChartKey = useRef<string>('');
    const prevReceiptKey = useRef<string>('');

    // Parse tool invocations — only depends on messages, uses refs for dedup
    useEffect(() => {
        if (!chat.messages.length) return;

        let foundChart: ChartData | null = null;
        let foundReceipt: TradeReceipt | null = null;
        let foundReceiptId: string | null = null;

        for (let i = chat.messages.length - 1; i >= 0; i--) {
            const m = chat.messages[i];
            if (m.role !== 'assistant' || !m.toolInvocations) continue;

            for (const invocation of m.toolInvocations) {
                if (invocation.state !== 'result') continue;

                if (invocation.toolName === 'render_stock_chart' && invocation.result && !foundChart) {
                    foundChart = invocation.result as ChartData;
                }

                if (
                    invocation.toolName === 'generate_trade_receipt' &&
                    invocation.result &&
                    !foundReceipt &&
                    !clearedReceiptIds.current.has(invocation.toolCallId)
                ) {
                    foundReceipt = invocation.result as TradeReceipt;
                    foundReceiptId = invocation.toolCallId;
                }
            }

            if (foundChart && foundReceipt) break;
        }

        const chartKey = foundChart ? JSON.stringify(foundChart) : '';
        const receiptKey = foundReceipt ? JSON.stringify(foundReceipt) : '';

        // #region agent log
        fetch('http://127.0.0.1:7299/ingest/98580928-d973-4442-9a49-20081ca81a13',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a9847'},body:JSON.stringify({sessionId:'8a9847',location:'useAuraChat.ts:parseTools',message:'Parsing tool invocations',data:{hasChart:!!foundChart,hasReceipt:!!foundReceipt,chartChanged:chartKey!==prevChartKey.current,receiptChanged:receiptKey!==prevReceiptKey.current,msgCount:chat.messages.length},timestamp:Date.now()})}).catch(()=>{});
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
            // Use append() to directly send the message to the API
            // This bypasses the input state entirely, avoiding the race condition
            // where setInput + handleSubmit could fire before React commits the state
            chat.append({ role: 'user', content: text });
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
