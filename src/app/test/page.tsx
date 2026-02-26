// ============================================================
// app/test/page.tsx — Dev B test page
// Quick & dirty chat UI for testing the AI pipeline
// Dev A will replace this with the real UI later
// ============================================================

'use client';

import { useAuraChat } from '@/hooks/useAuraChat';
import { useVoice } from '@/hooks/useVoice';
import { useTradeExecution } from '@/hooks/useTradeExecution';
import type { TradeOrder } from '@/types';

export default function TestPage() {
    const { isListening, isSpeaking, transcript, isSupported, startListening, stopListening, speak, voiceError } =
        useVoice();

    const {
        messages,
        input,
        handleSubmit,
        handleInputChange,
        isLoading,
        error,
        submitMessage,
        chartData,
        tradeReceipt,
        appState,
        clearReceipt,
    } = useAuraChat({ onFinish: speak });

    const { executeTrade, isExecuting, result: tradeResult } = useTradeExecution();

    const handleVoiceToggle = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening((text: string) => {
                submitMessage(text);
            });
        }
    };

    const handleExecuteTrade = async () => {
        if (!tradeReceipt) return;
        const order: TradeOrder = {
            ticker: tradeReceipt.ticker,
            qty: tradeReceipt.qty,
            side: tradeReceipt.side,
            type: tradeReceipt.orderType as TradeOrder['type'],
        };
        const result = await executeTrade(order);
        if (result.success) {
            clearReceipt();
        }
    };

    return (
        <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'system-ui', color: '#e0e0e0', background: '#0a0a0f', minHeight: '100vh', padding: 24 }}>
            <h1 style={{ fontSize: 28, marginBottom: 4 }}>🔮 Aura — Dev B Test Console</h1>
            <p style={{ color: '#888', marginBottom: 24 }}>Testing AI pipeline, tools, and voice. This page is at <code>/test</code>.</p>

            {/* App State Indicator */}
            <div style={{ padding: '8px 16px', background: '#1a1a2e', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                <strong>App State:</strong> <span style={{ color: appState === 'entry' ? '#888' : appState === 'data-render' ? '#22c55e' : '#f59e0b' }}>{appState}</span>
                {chartData && <span> | 📊 Chart: {chartData.ticker} ({chartData.period}, {chartData.bars.length} bars)</span>}
                {tradeReceipt && <span> | 🧾 Receipt: {tradeReceipt.side} {tradeReceipt.qty}x {tradeReceipt.ticker}</span>}
            </div>

            {/* Error display */}
            {error && (
                <div style={{ padding: 12, background: '#3b1111', border: '1px solid #f44', borderRadius: 8, marginBottom: 16 }}>
                    ❌ <strong>Error:</strong> {error.message}
                </div>
            )}

            {/* Messages */}
            <div style={{ border: '1px solid #333', borderRadius: 12, padding: 16, marginBottom: 16, maxHeight: 400, overflowY: 'auto', background: '#111' }}>
                {messages.length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>No messages yet. Try typing &quot;How&apos;s Apple doing?&quot; or &quot;Buy 5 shares of Tesla&quot;</p>}
                {messages.map((m) => (
                    <div key={m.id} style={{ marginBottom: 12, padding: 8, borderRadius: 8, background: m.role === 'user' ? '#1a1a3e' : '#1a2e1a' }}>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
                            {m.role === 'user' ? '👤 You' : '🔮 Aura'}
                        </div>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{(m as any).content}</div>
                        {/* Show tool invocations */}
                        {(m as any).toolInvocations && (m as any).toolInvocations.map((tool: any, i: number) => (
                            <div key={i} style={{ marginTop: 8, padding: 8, background: '#222', borderRadius: 6, fontSize: 12 }}>
                                <div style={{ color: '#8b5cf6' }}>🔧 Tool: {tool.toolName}</div>
                                <div style={{ color: '#888' }}>Args: {JSON.stringify(tool.args)}</div>
                                {tool.state === 'result' && (
                                    <div style={{ color: '#22c55e', marginTop: 4 }}>Result: {JSON.stringify(tool.result).slice(0, 200)}...</div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
                {isLoading && <div style={{ color: '#8b5cf6' }}>⏳ Aura is thinking...</div>}
            </div>

            {/* Trade Receipt Preview */}
            {tradeReceipt && (
                <div style={{ border: '1px solid #f59e0b', borderRadius: 12, padding: 16, marginBottom: 16, background: '#1a1a0a' }}>
                    <h3 style={{ margin: '0 0 8px', color: '#f59e0b' }}>🧾 Trade Receipt</h3>
                    <table style={{ width: '100%', fontSize: 14 }}>
                        <tbody>
                            <tr><td style={{ color: '#888' }}>Ticker</td><td style={{ textAlign: 'right' }}>{tradeReceipt.ticker}</td></tr>
                            <tr><td style={{ color: '#888' }}>Side</td><td style={{ textAlign: 'right' }}>{tradeReceipt.side.toUpperCase()}</td></tr>
                            <tr><td style={{ color: '#888' }}>Qty</td><td style={{ textAlign: 'right' }}>{tradeReceipt.qty}</td></tr>
                            <tr><td style={{ color: '#888' }}>Order Type</td><td style={{ textAlign: 'right' }}>{tradeReceipt.orderType}</td></tr>
                            <tr><td style={{ color: '#888' }}>Price</td><td style={{ textAlign: 'right' }}>${tradeReceipt.currentPrice.toFixed(2)}</td></tr>
                            <tr><td style={{ color: '#888' }}>Est. Total</td><td style={{ textAlign: 'right', fontWeight: 'bold' }}>${tradeReceipt.estimatedTotal.toFixed(2)}</td></tr>
                            {tradeReceipt.stopLoss && <tr><td style={{ color: '#888' }}>Stop Loss</td><td style={{ textAlign: 'right' }}>${tradeReceipt.stopLoss.toFixed(2)}</td></tr>}
                        </tbody>
                    </table>
                    <button
                        onClick={handleExecuteTrade}
                        disabled={isExecuting}
                        style={{ marginTop: 12, width: '100%', padding: 12, background: isExecuting ? '#444' : '#22c55e', border: 'none', borderRadius: 8, color: '#000', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}
                    >
                        {isExecuting ? 'Executing...' : '✅ Execute Trade'}
                    </button>
                    {tradeResult && (
                        <div style={{ marginTop: 8, color: tradeResult.success ? '#22c55e' : '#f44', fontSize: 13 }}>
                            {tradeResult.success ? `✅ Order ${tradeResult.orderId} — ${tradeResult.status}` : `❌ ${tradeResult.error}`}
                        </div>
                    )}
                </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask Aura anything... (e.g. &quot;How's Apple doing?&quot;)"
                    disabled={isLoading}
                    style={{ flex: 1, padding: '12px 16px', background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, color: '#e0e0e0', fontSize: 15, outline: 'none' }}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    style={{ padding: '12px 24px', background: '#8b5cf6', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    Send
                </button>
            </form>

            {/* Voice Controls */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                    onClick={handleVoiceToggle}
                    disabled={!isSupported}
                    style={{ padding: '10px 20px', background: isListening ? '#f44336' : '#1a1a2e', border: '1px solid #333', borderRadius: 8, color: '#e0e0e0', cursor: 'pointer' }}
                >
                    {isListening ? '🔴 Stop Listening' : '🎙️ Voice Input'}
                </button>
                {!isSupported && <span style={{ color: '#888', fontSize: 12 }}>Speech API not supported</span>}
                {transcript && <span style={{ color: '#aaa', fontSize: 13 }}>Heard: &quot;{transcript}&quot;</span>}
                {isSpeaking && <span style={{ color: '#22c55e', fontSize: 13 }}>🔊 Speaking...</span>}
            </div>

            {/* Show explicit voice error if one occurred */}
            {voiceError && (
                <div style={{ marginTop: 8, padding: 8, background: '#3b1111', border: '1px solid #f44', borderRadius: 8, fontSize: 13 }}>
                    ❌ <strong>Mic Error:</strong> {voiceError} (Check browser site permissions)
                </div>
            )}

            {/* TTS test */}
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                {messages.length > 0 && (
                    <button
                        onClick={() => {
                            const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant' && (m as any).content);
                            if (lastAssistant) speak((lastAssistant as any).content);
                        }}
                        style={{ padding: '8px 16px', background: '#1a2e1a', border: '1px solid #333', borderRadius: 8, color: '#e0e0e0', cursor: 'pointer', fontSize: 13 }}
                    >
                        🔊 Speak Last Response
                    </button>
                )}
                <button
                    onClick={() => speak("Testing audio output. Hello world!")}
                    style={{ padding: '8px 16px', background: '#2e1a1a', border: '1px solid #333', borderRadius: 8, color: '#e0e0e0', cursor: 'pointer', fontSize: 13 }}
                >
                    🔔 Test TTS (Click to hear audio)
                </button>
            </div>
        </div>
    );
}
