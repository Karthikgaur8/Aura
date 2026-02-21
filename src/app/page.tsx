// ============================================================
// page.tsx — Dev A
// Main page — Killer flow:
//   1. Cinematic intro: morphing orb coalesces + title types + fade
//   2. Wake screen: "Hey Aura" with aurora background + status pill
//   3. Main app: entry → data-render → trade-confirm
//      - Aurora borealis canvas + particle field + cursor glow
//      - Film grain overlay for cinematic depth
//      - Morphing SVG orb (replaces flat CSS orb)
//      - AI thinking chain with progress bars
//      - Portfolio dashboard + ticker tape
//      - Liquid glass state transitions
// ============================================================
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LayoutGroup, motion, AnimatePresence } from 'framer-motion';
import type { InteractionMode, AppState, StockBar, TradeReceipt as TradeReceiptType } from '@/types';

// Components
import MorphingOrb from '@/components/MorphingOrb';
import ModeToggle from '@/components/ModeToggle';
import ChatInput from '@/components/ChatInput';
import StockChart from '@/components/StockChart';
import TradeReceiptCard from '@/components/TradeReceipt';
import SlideToConfirm from '@/components/SlideToConfirm';
import ConfettiSuccess from '@/components/ConfettiSuccess';
import ParticleField from '@/components/ParticleField';
import CursorGlow from '@/components/CursorGlow';
import AuroraBackground from '@/components/AuroraBackground';
import ChatMessages, { type ChatMessage } from '@/components/ChatMessages';
import TickerTape from '@/components/TickerTape';
import PortfolioDashboard from '@/components/PortfolioDashboard';
import AIThinkingChain from '@/components/AIThinkingChain';
import StatusPill from '@/components/StatusPill';

// ── Mock data ────────────────────────────────────────────────
const MOCK_STOCK_DATA: StockBar[] = generateMockOHLCV('2025-01-02', 60);

const MOCK_RECEIPT: TradeReceiptType = {
  ticker: 'AAPL',
  qty: 10,
  side: 'buy',
  orderType: 'market',
  estimatedTotal: 2342.5,
  currentPrice: 234.25,
};

function generateMockOHLCV(startDate: string, count: number): StockBar[] {
  const bars: StockBar[] = [];
  let price = 230;
  const start = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
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

// ── Wake phrase detection ────────────────────────────────────
const WAKE_PHRASES = ['hey aura', 'hi aura', 'hello aura'];
function containsWakePhrase(text: string): boolean {
  return WAKE_PHRASES.some((p) => text.toLowerCase().trim().includes(p));
}

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
  // Screen phases
  const [showIntro, setShowIntro] = useState(true);
  const [isAwake, setIsAwake] = useState(false);
  const [wakeListening, setWakeListening] = useState(false);
  const [wakeTranscript, setWakeTranscript] = useState('');

  // App state
  const [mode, setMode] = useState<InteractionMode>('voice');
  const [appState, setAppState] = useState<AppState>('entry');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTradeExecuting, setIsTradeExecuting] = useState(false);

  // AI thinking chain
  const [showThinking, setShowThinking] = useState(false);

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messageIdRef = useRef(0);

  // ── Cinematic intro timer ──
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 3800);
    return () => clearTimeout(t);
  }, []);

  // ── Wake word listener ──
  useEffect(() => {
    if (showIntro || isAwake) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechAPI = typeof window !== 'undefined'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

    if (!SpeechAPI) return;

    const recognition = new SpeechAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript;
        setWakeTranscript(segment);

        if (containsWakePhrase(segment)) {
          setIsAwake(true);
          recognition.stop();
          setWakeListening(false);
          return;
        }
      }
    };

    recognition.onerror = () => {
      setTimeout(() => { try { recognition.start(); } catch { /* */ } }, 1000);
    };

    recognition.onend = () => {
      if (!isAwake) {
        setTimeout(() => { try { recognition.start(); } catch { /* */ } }, 500);
      }
    };

    try { recognition.start(); setWakeListening(true); } catch { /* */ }

    return () => { try { recognition.stop(); } catch { /* */ } };
  }, [showIntro, isAwake]);

  // ── Helpers ──
  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [...prev, { id: String(++messageIdRef.current), role, content }]);
  }, []);

  // ── Auto-enter main app when wake word detected ──
  const hasAutoEntered = useRef(false);
  useEffect(() => {
    if (isAwake && !hasAutoEntered.current) {
      hasAutoEntered.current = true;
      addMessage('user', '🎙️ "Hey Aura — show me the markets"');
      setShowThinking(true);
    }
  }, [isAwake, addMessage]);

  const handleChatSubmit = useCallback(() => {
    if (!chatInput.trim()) return;
    addMessage('user', chatInput);
    setChatInput('');
    setShowThinking(true);
  }, [chatInput, addMessage]);

  const handleThinkingComplete = useCallback(() => {
    setShowThinking(false);
    addMessage('assistant', 'Here\'s the AAPL chart for the last 3 months with your portfolio summary.');
    setAppState('data-render');
  }, [addMessage]);

  const handleTradeConfirm = useCallback(() => {
    setIsTradeExecuting(true);
    setTimeout(() => {
      setIsTradeExecuting(false);
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setAppState('entry');
        setMessages([]);
      }, 3000);
    }, 1500);
  }, []);

  const handleOrbClick = useCallback(() => {
    if (mode === 'voice' && appState === 'entry') {
      addMessage('user', '🎙️ "Show me AAPL"');
      setShowThinking(true);
    }
  }, [mode, appState, addMessage]);

  const resetToEntry = useCallback(() => {
    setAppState('entry');
    setShowConfetti(false);
    setMessages([]);
    setShowThinking(false);
  }, []);

  // ════════════════════════════════════════════════════════
  //  PHASE 1: CINEMATIC INTRO
  // ════════════════════════════════════════════════════════
  if (showIntro) {
    return (
      <div className="fixed inset-0 flex items-center justify-center film-grain"
        style={{ background: '#0a0a0f' }}>
        <motion.div className="flex flex-col items-center gap-6">
          {/* Orb coalesces from particles */}
          <motion.div
            className="relative"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glow behind orb */}
            <motion.div
              className="absolute -inset-16"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(34,197,94,0.05) 50%, transparent 70%)',
                filter: 'blur(40px)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <MorphingOrb isCompact={false} isActive={true} />
          </motion.div>

          {/* Title with stagger */}
          <motion.div
            className="overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.h1
              className="text-7xl font-bold text-gradient-animated whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              Aura
            </motion.h1>
          </motion.div>

          {/* Tagline with blur-in */}
          <motion.p
            className="text-lg tracking-[0.3em] uppercase"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            Talk · See · Trade
          </motion.p>

          {/* Horizontal line expanding */}
          <motion.div
            className="h-px rounded"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '200px', opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.8 }}
          />

          {/* Fade-out screen */}
          <motion.div
            className="fixed inset-0 pointer-events-none"
            style={{ background: '#0a0a0f' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.0, duration: 0.8 }}
          />
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  //  PHASE 2: WAKE SCREEN
  // ════════════════════════════════════════════════════════
  if (!isAwake) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center film-grain"
        style={{ background: '#0a0a0f' }}>
        <AuroraBackground />
        <ParticleField />
        <CursorGlow />

        <motion.div
          className="relative z-10 flex flex-col items-center gap-8"
          {...pageTransition}
        >
          {/* Dormant morphing orb */}
          <div className="animate-breathe">
            <MorphingOrb isCompact={false} isActive={wakeListening} />
          </div>

          <motion.h1
            className="text-6xl font-bold text-gradient-animated"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Aura
          </motion.h1>

          {/* Status pill instead of plain text */}
          <StatusPill
            text={wakeListening ? 'Listening for wake word…' : 'Initializing microphone…'}
            icon="🎙️"
            visible={true}
          />

          <motion.p
            className="text-lg"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Say <span className="font-semibold" style={{ color: '#a78bfa' }}>&quot;Hey Aura&quot;</span> to begin
          </motion.p>

          {wakeTranscript && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs max-w-xs text-center font-mono"
              style={{ color: 'rgba(255,255,255,0.15)' }}
            >
              🎙️ {wakeTranscript}
            </motion.p>
          )}

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={() => setIsAwake(true)}
            className="text-xs px-5 py-2 rounded-full glass magnetic-hover transition-all"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            or tap to enter
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  //  PHASE 3: MAIN APP
  // ════════════════════════════════════════════════════════
  return (
    <LayoutGroup>
      <div className="relative min-h-screen w-full overflow-hidden film-grain"
        style={{ background: '#0a0a0f' }}>

        {/* Background layers */}
        <AuroraBackground />
        <ParticleField />
        <CursorGlow />

        {/* ── Ticker Tape (top) ── */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <TickerTape />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 min-h-screen flex flex-col pt-8">

          {/* ── Top header bar ── */}
          <AnimatePresence>
            {appState !== 'entry' && (
              <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-8 left-0 right-0 z-40 px-6 py-3"
                style={{ background: 'linear-gradient(to bottom, rgba(10,10,15,0.95) 0%, transparent 100%)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="cursor-pointer" onClick={resetToEntry} title="Back to home">
                    <MorphingOrb isCompact isActive={isLoading || showThinking} />
                  </div>
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-bold text-gradient-animated"
                  >
                    Aura
                  </motion.span>

                  {/* Live status pill in header */}
                  <div className="ml-auto">
                    <StatusPill
                      text={showThinking ? 'Processing…' : appState === 'trade-confirm' ? 'Awaiting confirmation' : 'Ready'}
                      icon={showThinking ? '🧠' : appState === 'trade-confirm' ? '⚠️' : '✨'}
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
                className="flex-1 flex flex-col items-center justify-center gap-5 px-6"
                {...pageTransition}
              >
                {/* Brand */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-2"
                >
                  <h1 className="text-5xl font-bold text-gradient-animated mb-2">
                    Aura
                  </h1>
                  <p className="text-sm tracking-widest uppercase"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Talk · See · Trade
                  </p>
                </motion.div>

                {/* Morphing Orb */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                  className="cursor-pointer"
                  onClick={handleOrbClick}
                >
                  <MorphingOrb isCompact={false} isActive={isLoading || showThinking} />
                </motion.div>

                {/* Status pill */}
                <StatusPill
                  text={
                    showThinking ? 'Analyzing…' :
                      mode === 'voice' ? 'Tap the orb to start talking' :
                        'Type your question below'
                  }
                  icon={showThinking ? '🧠' : mode === 'voice' ? '🎙️' : '💬'}
                  visible={true}
                />

                {/* AI Thinking Chain */}
                <AnimatePresence>
                  {showThinking && (
                    <AIThinkingChain isActive={showThinking} onComplete={handleThinkingComplete} />
                  )}
                </AnimatePresence>

                {/* Chat messages + input */}
                <AnimatePresence>
                  {mode === 'chat' && !showThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="w-full max-w-xl flex flex-col gap-3"
                    >
                      <ChatMessages messages={messages} isLoading={isLoading} />
                      <ChatInput
                        value={chatInput}
                        onChange={setChatInput}
                        onSubmit={handleChatSubmit}
                        isLoading={isLoading}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  {messages.length > 0 && (
                    <ChatMessages messages={messages} isLoading={isLoading} />
                  )}

                  {/* Chart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <StockChart ticker="AAPL" data={MOCK_STOCK_DATA} period="3M" />
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center gap-3 justify-center"
                  >
                    <button
                      onClick={() => setAppState('trade-confirm')}
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
                  {mode === 'chat' && (
                    <div className="mt-2">
                      <ChatInput
                        value={chatInput}
                        onChange={setChatInput}
                        onSubmit={handleChatSubmit}
                        isLoading={isLoading}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════════
              STATE 3: TRADE CONFIRM
             ═══════════════════════════════════════════ */}
          <AnimatePresence>
            {appState === 'trade-confirm' && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-30 backdrop-dim"
                  onClick={() => setAppState('data-render')}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 px-6"
                >
                  <TradeReceiptCard receipt={MOCK_RECEIPT} />
                  <SlideToConfirm onConfirm={handleTradeConfirm} isLoading={isTradeExecuting} />
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

          {/* ── Mode Toggle ── */}
          {appState === 'entry' && !showThinking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30"
            >
              <ModeToggle mode={mode} onToggle={setMode} />
            </motion.div>
          )}

          {/* Confetti */}
          <ConfettiSuccess show={showConfetti} />

          {/* ── Demo controls ── */}
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {appState === 'entry' && !showThinking && (
              <button
                onClick={() => {
                  addMessage('user', 'Show me AAPL');
                  setShowThinking(true);
                }}
                className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-500 hover:text-white transition-colors"
              >
                Demo: Chart →
              </button>
            )}
            {appState === 'data-render' && (
              <button
                onClick={() => setAppState('trade-confirm')}
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
