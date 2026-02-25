// ============================================================
// page.tsx — Dev A
// Main page — Integrated with Dev B hooks:
//   useAuraChat (Vercel AI SDK → /api/chat → OpenAI → tools)
//   useVoice (Web Speech STT + ElevenLabs/browser TTS)
//   useTradeExecution (POST /api/trade → Alpaca)
//
// Flow:
//   1. Cinematic intro → Wake screen → Main app
//   2. appState managed automatically by useAuraChat via tool calls
//   3. Voice + Chat both send text through chat.submitMessage()
// ============================================================
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'framer-motion';
import type { TradeOrder } from '@/types';

// Dev B hooks
import { useAuraChat } from '@/hooks/useAuraChat';
import { useTradeExecution } from '@/hooks/useTradeExecution';

import ChatInput from '@/components/ChatInput';
import StockChart from '@/components/StockChart';
import TradeReceiptCard from '@/components/TradeReceipt';
import SlideToConfirm from '@/components/SlideToConfirm';
import ConfettiSuccess from '@/components/ConfettiSuccess';
import ChatMessages, { type ChatMessage } from '@/components/ChatMessages';
import PortfolioDashboard from '@/components/PortfolioDashboard';
import AIThinkingChain from '@/components/AIThinkingChain';
import StatusPill from '@/components/StatusPill';



// ── Page transition variants ─────────────────────────────────
const pageTransition = {
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -20, filter: 'blur(8px)' },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function Home() {
  // ── Hooks ──
  const chat = useAuraChat();
  const trade = useTradeExecution();

  // UI state
  const [showConfetti, setShowConfetti] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  // appState comes from chat hook (auto-managed by tool invocations)
  const appState = chat.appState;



  // ── Watch for appState changes to dismiss thinking ──
  useEffect(() => {
    if (appState !== 'entry') {
      setShowThinking(false);
    }
  }, [appState]);

  // ── Also dismiss thinking when loading finishes ──
  useEffect(() => {
    if (!chat.isLoading && showThinking) {
      // Small delay to let animations complete
      const t = setTimeout(() => setShowThinking(false), 500);
      return () => clearTimeout(t);
    }
  }, [chat.isLoading, showThinking]);

  // ── Adapt messages for ChatMessages component ──
  const adaptedMessages: ChatMessage[] = chat.messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .filter((m) => m.content || (m.toolInvocations && m.toolInvocations.length > 0))
    .map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      toolInvocations: m.toolInvocations,
    }));

  // ── Handlers ──
  const handleChatSubmit = useCallback(() => {
    setShowThinking(true);
    chat.handleSubmit(new Event('submit') as unknown as React.FormEvent);
  }, [chat]);

  const handleTradeConfirm = useCallback(async () => {
    if (!chat.tradeReceipt) return;
    const order: TradeOrder = {
      ticker: chat.tradeReceipt.ticker,
      qty: chat.tradeReceipt.qty,
      side: chat.tradeReceipt.side,
      type: chat.tradeReceipt.orderType as TradeOrder['type'],
    };
    const result = await trade.executeTrade(order);
    if (result.success) {
      chat.clearReceipt();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [chat, trade]);

  const resetToEntry = useCallback(() => {
    chat.clearChart();
    chat.clearReceipt();
    setShowConfetti(false);
    setShowThinking(false);
  }, [chat]);

  // Determine if AI is thinking
  const isThinking = chat.isLoading || showThinking;

  // ════════════════════════════════════════════════════════
  //  MAIN APP LAYOUT
  // ════════════════════════════════════════════════════════
  return (
    <LayoutGroup>
      <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 text-zinc-50">

        {/* ── Content ── */}
        <div className="relative z-10 min-h-screen flex flex-col pt-4">

          {/* ── Top header bar ── */}
          <AnimatePresence>
            {appState !== 'entry' && (
              <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-0 left-0 right-0 z-40 px-6 py-4 bg-zinc-950/80 backdrop-blur-md border-b border-white/5"
              >
                <div className="flex items-center gap-3 w-full max-w-5xl mx-auto">
                  <div className="cursor-pointer flex items-center gap-2" onClick={resetToEntry} title="Back to home">
                    <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center">
                      {isThinking && <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse" />}
                    </div>
                    <span className="text-sm font-bold tracking-wide text-white">Aura</span>
                  </div>

                  <div className="ml-auto flex items-center gap-4">
                    <StatusPill
                      text={
                        chat.isLoading ? 'Processing…' :
                          appState === 'trade-confirm' ? 'Awaiting confirmation' :
                            'Ready'
                      }
                      icon={
                        chat.isLoading ? '🧠' :
                          appState === 'trade-confirm' ? '⚠️' :
                            '✨'
                      }
                      visible={true}
                      variant={appState === 'trade-confirm' ? 'warning' : 'default'}
                    />
                  </div>
                </div>
              </motion.header>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════
              STATE 1: ENTRY
             ═══════════════════════════════════════════ */}
          <AnimatePresence mode="wait">
            {appState === 'entry' && (
              <motion.div
                key="entry"
                className="flex-1 flex flex-col w-full items-center px-4 md:px-6"
                {...pageTransition}
              >
                {/* ─── NO MESSAGES: Centered hero ─── */}
                {adaptedMessages.length === 0 && !showThinking && (
                  <div className="flex-1 flex flex-col w-full items-center justify-center gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center gap-4 text-center mb-2"
                    >
                      <div className="w-12 h-12 rounded-[14px] bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                        <div className={`w-4 h-4 rounded-full bg-zinc-950 ${isThinking ? 'animate-pulse' : ''}`} />
                      </div>
                      <div>
                        <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
                          Aura
                        </h1>
                        <p className="text-sm tracking-widest uppercase text-zinc-500">
                          See · Trade · Profit
                        </p>
                      </div>
                    </motion.div>

                    <StatusPill
                      text="Type your question below"
                      icon="💬"
                      visible={true}
                    />

                    <div className="w-full max-w-2xl mt-4">
                      <ChatInput
                        value={chat.input}
                        onChange={(val) => chat.setInput(val)}
                        onSubmit={handleChatSubmit}
                        isLoading={chat.isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* ─── HAS MESSAGES: Messaging layout ─── */}
                {(adaptedMessages.length > 0 || showThinking) && (
                  <div className="flex-1 flex flex-col w-full max-w-2xl min-h-0 pt-20">
                    {/* Compact header — Aura branding top-left */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 py-4 shrink-0"
                    >
                      <div className="w-6 h-6 rounded-[8px] bg-white flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full bg-zinc-950 ${isThinking ? 'animate-pulse' : ''}`} />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold tracking-tight text-white leading-none">Aura</h2>
                        <p className="text-[10px] tracking-widest uppercase mt-0.5 text-zinc-500">
                          {chat.isLoading ? 'Typing…' : 'Online'}
                        </p>
                      </div>
                    </motion.div>

                    {/* Messages area — scrollable */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0 pb-4">
                      <ChatMessages messages={adaptedMessages} isLoading={chat.isLoading} />

                      {/* AI Thinking Chain */}
                      <AnimatePresence>
                        {showThinking && (
                          <AIThinkingChain isActive={showThinking} onComplete={() => { }} />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Pinned chat input at bottom */}
                    <div className="shrink-0 pb-4 pt-2 w-full max-w-2xl mx-auto">
                      <ChatInput
                        value={chat.input}
                        onChange={(val) => chat.setInput(val)}
                        onSubmit={handleChatSubmit}
                        isLoading={chat.isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Error display */}
                {chat.error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-400 max-w-md text-center"
                  >
                    ⚠️ {chat.error.message}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════
                STATE 2: DATA RENDER
               ═══════════════════════════════════════════ */}
            {appState === 'data-render' && (
              <motion.div
                key="data-render"
                className="flex-1 flex flex-col items-center justify-center px-6 py-20"
                {...pageTransition}
              >
                <div className="w-full max-w-4xl flex flex-col gap-5">
                  {/* Portfolio dashboard */}
                  <PortfolioDashboard />

                  {/* Chat messages */}
                  {adaptedMessages.length > 0 && (
                    <ChatMessages messages={adaptedMessages} isLoading={chat.isLoading} />
                  )}

                  {/* Chart — from real API data */}
                  {chat.chartData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <StockChart
                        ticker={chat.chartData.ticker}
                        data={chat.chartData.bars}
                        period={chat.chartData.period}
                      />
                    </motion.div>
                  )}

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center gap-3 justify-center"
                  >
                    <button
                      onClick={() => {
                        setShowThinking(true);
                        chat.submitMessage(`Buy 5 shares of ${chat.chartData?.ticker || 'AAPL'}`);
                      }}
                      className="px-6 py-3 rounded-xl text-sm font-medium text-white magnetic-hover"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
                        border: '1px solid rgba(34,197,94,0.3)',
                        boxShadow: '0 0 20px rgba(34,197,94,0.15)',
                      }}
                    >
                      📈 Execute Trade
                    </button>
                    <button
                      onClick={resetToEntry}
                      className="px-6 py-3 rounded-xl text-sm font-medium glass magnetic-hover"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      ← Back
                    </button>
                  </motion.div>

                  {/* Chat input */}
                  <div className="mt-2">
                    <ChatInput
                      value={chat.input}
                      onChange={(val) => chat.setInput(val)}
                      onSubmit={handleChatSubmit}
                      isLoading={chat.isLoading}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════
              STATE 3: TRADE CONFIRM
             ═══════════════════════════════════════════ */}
          <AnimatePresence>
            {appState === 'trade-confirm' && chat.tradeReceipt && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-30 backdrop-dim"
                  onClick={() => chat.clearReceipt()}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-6"
                >
                  <TradeReceiptCard receipt={chat.tradeReceipt} />
                  {!chat.tradeReceipt.error && (
                    <SlideToConfirm onConfirm={handleTradeConfirm} isLoading={trade.isExecuting} />
                  )}

                  {/* Trade result feedback */}
                  {trade.result && !trade.result.success && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-red-400"
                    >
                      ⚠️ {trade.result.error || 'Trade failed'}
                    </motion.p>
                  )}

                  <button
                    onClick={() => chat.clearReceipt()}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    Cancel
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>



          {/* Confetti */}
          <ConfettiSuccess show={showConfetti} />

          {/* ── Demo controls ── */}
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {appState === 'entry' && !showThinking && (
              <button
                onClick={() => {
                  setShowThinking(true);
                  chat.submitMessage("How's Apple doing?");
                }}
                className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-500 hover:text-white transition-colors"
              >
                Demo: AAPL →
              </button>
            )}
            {appState === 'data-render' && (
              <button
                onClick={() => {
                  chat.submitMessage(`Buy 5 shares of ${chat.chartData?.ticker || 'AAPL'}`);
                }}
                className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-500 hover:text-white transition-colors"
              >
                Demo: Trade →
              </button>
            )}
            {(appState !== 'entry' || showThinking) && (
              <button
                onClick={resetToEntry}
                className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-500 hover:text-white transition-colors"
              >
                ← Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}
