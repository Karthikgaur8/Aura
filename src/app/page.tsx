// ============================================================
// page.tsx — Dev A
// Main page with 3 visual states:
//   1. Entry: centered orb + mode toggle
//   2. Data Render: orb shrinks to top-left, chart appears
//   3. Trade Confirm: dim backdrop, receipt slides up, slide-to-confirm
// ============================================================
'use client';

import React, { useState, useCallback } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'framer-motion';
import type { InteractionMode, AppState, StockBar, TradeReceipt as TradeReceiptType } from '@/types';

// Components
import VoiceOrb from '@/components/VoiceOrb';
import ModeToggle from '@/components/ModeToggle';
import ChatInput from '@/components/ChatInput';
import StockChart from '@/components/StockChart';
import TradeReceiptCard from '@/components/TradeReceipt';
import SlideToConfirm from '@/components/SlideToConfirm';
import ConfettiSuccess from '@/components/ConfettiSuccess';

// Dev B hooks (stubbed — will be wired when Dev B finishes)
// import { useAuraChat } from '@/hooks/useAuraChat';
// import { useVoice } from '@/hooks/useVoice';
// import { useTradeExecution } from '@/hooks/useTradeExecution';

// ── Mock data for standalone demo ─────────────────────────────
const MOCK_STOCK_DATA: StockBar[] = generateMockOHLCV('2025-01-02', 60);

const MOCK_RECEIPT: TradeReceiptType = {
  ticker: 'AAPL',
  qty: 10,
  side: 'buy',
  orderType: 'market',
  estimatedTotal: 2342.50,
  currentPrice: 234.25,
};

function generateMockOHLCV(startDate: string, count: number): StockBar[] {
  const bars: StockBar[] = [];
  let price = 230;
  const start = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const change = (Math.random() - 0.48) * 6;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    const volume = Math.floor(Math.random() * 50000000) + 10000000;

    bars.push({
      timestamp: date.toISOString().split('T')[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });

    price = close;
  }
  return bars;
}

// ── Main Page ─────────────────────────────────────────────────
export default function Home() {
  const [mode, setMode] = useState<InteractionMode>('voice');
  const [appState, setAppState] = useState<AppState>('entry');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTradeExecuting, setIsTradeExecuting] = useState(false);

  // ── Handlers ──
  const handleChatSubmit = useCallback(() => {
    if (!chatInput.trim()) return;
    setIsLoading(true);
    // Simulate AI response → transition to data-render
    setTimeout(() => {
      setIsLoading(false);
      setAppState('data-render');
      setChatInput('');
    }, 1200);
  }, [chatInput]);

  const handleTradeConfirm = useCallback(() => {
    setIsTradeExecuting(true);
    setTimeout(() => {
      setIsTradeExecuting(false);
      setShowConfetti(true);
      // Auto-dismiss confetti
      setTimeout(() => {
        setShowConfetti(false);
        setAppState('entry');
      }, 3000);
    }, 1500);
  }, []);

  const handleOrbClick = useCallback(() => {
    if (mode === 'voice' && appState === 'entry') {
      // Simulate voice activation → data render
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setAppState('data-render');
      }, 1500);
    }
  }, [mode, appState]);

  return (
    <LayoutGroup>
      <div className="relative min-h-screen w-full overflow-hidden"
        style={{ background: '#0a0a0f' }}>

        {/* ── Background ambient glow ── */}
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }} />
        </div>

        {/* ── Content Layer ── */}
        <div className="relative z-10 min-h-screen flex flex-col">

          {/* ── Top bar (compact orb lives here in data-render/trade-confirm) ── */}
          <AnimatePresence>
            {appState !== 'entry' && (
              <motion.header
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed top-0 left-0 right-0 z-40 flex items-center gap-4 px-6 py-4"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setAppState('entry')}
                  title="Back to home"
                >
                  <VoiceOrb isCompact isActive={isLoading} />
                </div>
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-semibold text-white text-glow-purple"
                >
                  Aura
                </motion.span>
              </motion.header>
            )}
          </AnimatePresence>

          {/* ══════════════════════════════════════════════════
                        STATE 1: ENTRY — centered orb + toggle
                       ══════════════════════════════════════════════════ */}
          {appState === 'entry' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
              {/* Brand */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-4"
              >
                <h1 className="text-4xl font-bold text-white text-glow-purple mb-2">
                  Aura
                </h1>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Talk. See. Trade.
                </p>
              </motion.div>

              {/* Center orb */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="cursor-pointer"
                onClick={handleOrbClick}
              >
                <VoiceOrb isCompact={false} isActive={isLoading} />
              </motion.div>

              {/* Instruction text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm animate-float"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              >
                {mode === 'voice'
                  ? 'Tap the orb to start talking'
                  : 'Type your question below'}
              </motion.p>

              {/* Chat input (chat mode only) */}
              <AnimatePresence>
                {mode === 'chat' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="w-full max-w-xl"
                  >
                    <ChatInput
                      value={chatInput}
                      onChange={setChatInput}
                      onSubmit={handleChatSubmit}
                      isLoading={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
                        STATE 2: DATA RENDER — chart display
                       ══════════════════════════════════════════════════ */}
          {appState === 'data-render' && (
            <div className="flex-1 flex flex-col pt-24 px-6 pb-6">
              <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-6">
                {/* Chart */}
                <StockChart
                  ticker="AAPL"
                  data={MOCK_STOCK_DATA}
                  period="3M"
                />

                {/* Action area */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row items-center gap-3 justify-center"
                >
                  <button
                    onClick={() => setAppState('trade-confirm')}
                    className="px-6 py-3 rounded-xl text-sm font-medium text-white transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
                      border: '1px solid rgba(34,197,94,0.3)',
                      boxShadow: '0 0 20px rgba(34,197,94,0.15)',
                    }}
                  >
                    📈 Execute Trade
                  </button>
                  <button
                    onClick={() => setAppState('entry')}
                    className="px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105 glass"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    ← Back
                  </button>
                </motion.div>

                {/* Chat input at bottom */}
                {mode === 'chat' && (
                  <div className="mt-auto pt-4">
                    <ChatInput
                      value={chatInput}
                      onChange={setChatInput}
                      onSubmit={handleChatSubmit}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
                        STATE 3: TRADE CONFIRM — dim + receipt + slider
                       ══════════════════════════════════════════════════ */}
          <AnimatePresence>
            {appState === 'trade-confirm' && (
              <>
                {/* Dim backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-30 backdrop-dim"
                  onClick={() => setAppState('data-render')}
                />

                {/* Receipt + Slider */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-6"
                >
                  <TradeReceiptCard receipt={MOCK_RECEIPT} />
                  <SlideToConfirm
                    onConfirm={handleTradeConfirm}
                    isLoading={isTradeExecuting}
                  />
                  <button
                    onClick={() => setAppState('data-render')}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    Cancel
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Mode Toggle (fixed bottom) ── */}
          {appState === 'entry' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30"
            >
              <ModeToggle mode={mode} onToggle={setMode} />
            </motion.div>
          )}

          {/* ── Confetti ── */}
          <ConfettiSuccess show={showConfetti} />

          {/* ── Demo controls (for standalone testing) ── */}
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {appState === 'entry' && (
              <button
                onClick={() => setAppState('data-render')}
                className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-400 hover:text-white transition-colors"
              >
                Demo: Chart →
              </button>
            )}
            {appState === 'data-render' && (
              <button
                onClick={() => setAppState('trade-confirm')}
                className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-400 hover:text-white transition-colors"
              >
                Demo: Trade →
              </button>
            )}
            {appState !== 'entry' && (
              <button
                onClick={() => {
                  setAppState('entry');
                  setShowConfetti(false);
                }}
                className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-400 hover:text-white transition-colors"
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
