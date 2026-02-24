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
import type { InteractionMode, TradeOrder } from '@/types';

// Dev B hooks
import { useAuraChat } from '@/hooks/useAuraChat';
import { useVoice } from '@/hooks/useVoice';
import { useTradeExecution } from '@/hooks/useTradeExecution';

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
  // ── Hooks ──
  const voice = useVoice();
  const chat = useAuraChat({ onFinish: voice.speak });
  const trade = useTradeExecution();

  // Screen phases
  const [showIntro, setShowIntro] = useState(true);
  const [isAwake, setIsAwake] = useState(false);
  const [wakeListening, setWakeListening] = useState(false);
  const [wakeTranscript, setWakeTranscript] = useState('');

  // UI state
  const [mode, setModeRaw] = useState<InteractionMode>('voice');

  // When switching modes, stop voice listening immediately
  const setMode = useCallback((newMode: InteractionMode) => {
    if (newMode !== 'voice') {
      voice.stopListening();
    }
    setModeRaw(newMode);
  }, [voice]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  // appState comes from chat hook (auto-managed by tool invocations)
  const appState = chat.appState;

  // Busy ref — prevents sending messages while AI is still processing.
  // We use a ref (not state) because callbacks created by startListening
  // capture the value at call-time, not render-time.
  const isBusyRef = useRef(false);
  useEffect(() => {
    isBusyRef.current = chat.isLoading;
  }, [chat.isLoading]);

  // ── Cinematic intro timer ──
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 3800);
    return () => clearTimeout(t);
  }, []);

  // ── Wake word listener ──
  useEffect(() => {
    if (showIntro || isAwake) return;

    let isActiveListener = true;

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
      if (!isActiveListener) return;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const segment = event.results[i][0].transcript;
        setWakeTranscript(segment);

        if (containsWakePhrase(segment)) {
          isActiveListener = false;
          setIsAwake(true);
          recognition.stop();
          setWakeListening(false);
          return;
        }
      }
    };

    recognition.onerror = () => {
      if (!isActiveListener) return;
      setTimeout(() => { if (isActiveListener) { try { recognition.start(); } catch { /* */ } } }, 1000);
    };

    recognition.onend = () => {
      if (!isActiveListener) return;
      setTimeout(() => { if (isActiveListener) { try { recognition.start(); } catch { /* */ } } }, 500);
    };

    if (isActiveListener) {
      try { recognition.start(); setWakeListening(true); } catch { /* */ }
    }

    return () => {
      isActiveListener = false;
      try { recognition.stop(); } catch { /* */ }
    };
  }, [showIntro, isAwake]);

  // ── Auto-enter when wake word detected ──
  const hasAutoEntered = useRef(false);
  useEffect(() => {
    if (isAwake && !hasAutoEntered.current) {
      hasAutoEntered.current = true;
      // Greet the user and start listening
      voice.speak('Hey! How can I help you today?');
    }
  }, [isAwake, voice]);

  // ── Auto-listen loop: after Aura finishes speaking, re-open the mic ──
  const wasSpeaking = useRef(false);
  useEffect(() => {
    if (voice.isSpeaking) {
      wasSpeaking.current = true;
    }

    if (!voice.isSpeaking && wasSpeaking.current) {
      wasSpeaking.current = false;

      if (mode !== 'voice' || !isAwake) return;
      // Don't reopen mic while AI is still processing a previous request
      if (isBusyRef.current) return;

      const t = setTimeout(() => {
        if (isBusyRef.current) return;
        try {
          voice.startListening((text) => {
            if (isBusyRef.current) return;
            setShowThinking(true);
            chat.submitMessage(text);
          });
        } catch {
          // Mic grab failed — user can tap orb manually
        }
      }, 1200);

      return () => clearTimeout(t);
    }
  }, [voice.isSpeaking, mode, isAwake, voice, chat]);

  // ── Watch for appState changes to dismiss thinking ──
  useEffect(() => {
    if (appState !== 'entry') {
      setShowThinking(false);
    }
  }, [appState]);

  // ── Dismiss thinking when chat errors out ──
  useEffect(() => {
    if (chat.error) {
      setShowThinking(false);
    }
  }, [chat.error]);

  // ── Dismiss thinking only after loading has actually started and finished ──
  const hasStartedLoading = useRef(false);
  useEffect(() => {
    if (chat.isLoading) {
      hasStartedLoading.current = true;
    }

    if (!chat.isLoading && showThinking && hasStartedLoading.current) {
      const t = setTimeout(() => {
        setShowThinking(false);
        hasStartedLoading.current = false;
      }, 500);
      return () => clearTimeout(t);
    }
  }, [chat.isLoading, showThinking]);

  // ── Safety net: never let thinking spin forever ──
  useEffect(() => {
    if (!showThinking) return;
    const safety = setTimeout(() => {
      setShowThinking(false);
      hasStartedLoading.current = false;
    }, 20000);
    return () => clearTimeout(safety);
  }, [showThinking]);

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7299/ingest/98580928-d973-4442-9a49-20081ca81a13',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'8a9847'},body:JSON.stringify({sessionId:'8a9847',location:'page.tsx:stateTracker',message:'State snapshot',data:{appState,showThinking,isListening:voice.isListening,isSpeaking:voice.isSpeaking,isLoading:chat.isLoading,mode,hasChart:!!chat.chartData,hasReceipt:!!chat.tradeReceipt,hasError:!!chat.error},timestamp:Date.now()})}).catch(()=>{});
  }, [appState, showThinking, voice.isListening, voice.isSpeaking, chat.isLoading, mode, chat.chartData, chat.tradeReceipt, chat.error]);
  // #endregion

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
    if (isBusyRef.current) return;
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
      setShowConfetti(true);
      chat.clearReceipt();
      // After confetti, speak and reset
      voice.speak('Trade executed. What is the next move?');
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  }, [chat, trade, voice]);

  const handleVoiceTap = useCallback(() => {
    if (mode !== 'voice') return;

    if (voice.isListening) {
      voice.stopListening();
    } else if (!isBusyRef.current) {
      voice.startListening((text) => {
        if (isBusyRef.current) return;
        setShowThinking(true);
        chat.submitMessage(text);
      });
    }
  }, [voice, chat, mode]);

  const resetToEntry = useCallback(() => {
    chat.clearChart();
    chat.clearReceipt();
    setShowConfetti(false);
    setShowThinking(false);
  }, [chat]);

  // Determine orb active state
  const isOrbActive = voice.isListening || voice.isSpeaking || chat.isLoading || showThinking;

  // ════════════════════════════════════════════════════════
  //  PHASE 1: CINEMATIC INTRO
  // ════════════════════════════════════════════════════════
  if (showIntro) {
    return (
      <div className="fixed inset-0 flex items-center justify-center film-grain"
        style={{ background: '#0a0a0f' }}>
        <motion.div className="flex flex-col items-center gap-6">
          <motion.div
            className="relative"
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="absolute -inset-16"
              style={{
                background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(34,197,94,0.05) 50%, transparent 70%)',
                filter: 'blur(40px)',
              }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <MorphingOrb isCompact={false} isActive={true} />
          </motion.div>

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

          <motion.p
            className="text-lg tracking-[0.3em] uppercase"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            Talk · See · Trade
          </motion.p>

          <motion.div
            className="h-px rounded"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '200px', opacity: 1 }}
            transition={{ delay: 2.0, duration: 0.8 }}
          />

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
  //  PHASE 3: MAIN APP — Spatial Split Layout
  // ════════════════════════════════════════════════════════
  const isDataVisible = appState === 'data-render' || appState === 'trade-confirm';

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
        <div className="relative z-10 min-h-screen flex pt-8">

          {/* ═══════════════════════════════════════════════════
              LEFT SIDE PANEL — Orb + Controls (always present)
             ═══════════════════════════════════════════════════ */}
          <motion.div
            layout
            className="flex flex-col items-center justify-center gap-4 relative z-20"
            style={{
              width: isDataVisible ? '15%' : '100%',
              minHeight: '100vh',
              padding: isDataVisible ? '0.75rem' : '1.5rem',
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            {/* Title — only in entry */}
            <AnimatePresence>
              {appState === 'entry' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center mb-2"
                >
                  <h1 className={`font-bold text-gradient-animated mb-2 ${isDataVisible ? 'text-xl' : 'text-5xl'}`}>
                    Aura
                  </h1>
                  {!isDataVisible && (
                    <p className="text-sm tracking-widest uppercase"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Talk · See · Trade
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* "Aura" label when data is visible */}
            {isDataVisible && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold text-gradient-animated mb-1"
              >
                Aura
              </motion.span>
            )}

            {/* Morphing Orb — tap for voice */}
            <motion.div
              layout
              className="cursor-pointer"
              onClick={handleVoiceTap}
              style={{
                transform: isDataVisible ? 'scale(0.5)' : 'scale(1)',
                transition: 'transform 0.4s ease',
              }}
            >
              <MorphingOrb isCompact={false} isActive={isOrbActive} />
            </motion.div>

            {/* Status pill — hidden when AIThinkingChain is visible to avoid duplicate */}
            <StatusPill
              text={
                voice.isListening ? 'Listening...' :
                  voice.isSpeaking ? 'Speaking...' :
                    chat.isLoading ? 'Thinking...' :
                      mode === 'voice' ? 'Tap orb to talk' :
                        'Type below'
              }
              icon=""
              visible={!showThinking}
              variant={appState === 'trade-confirm' ? 'warning' : 'default'}
            />

            {/* Voice transcript preview */}
            {voice.transcript && voice.isListening && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-mono text-center max-w-[180px] truncate"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {voice.transcript}
              </motion.p>
            )}

            <AnimatePresence>
              {showThinking && (
                <AIThinkingChain isActive={showThinking} onComplete={() => { }} />
              )}
            </AnimatePresence>

            {/* Chat messages + input (in chat mode or when data visible) */}
            <AnimatePresence>
              {mode === 'chat' && !showThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="w-full flex flex-col gap-3"
                  style={{ maxWidth: isDataVisible ? '100%' : '32rem' }}
                >
                  <ChatMessages messages={adaptedMessages} isLoading={chat.isLoading} />
                  <ChatInput
                    value={chat.input}
                    onChange={(val) => chat.setInput(val)}
                    onSubmit={handleChatSubmit}
                    isLoading={chat.isLoading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error display */}
            {chat.error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-red-400 max-w-md text-center"
              >
                {chat.error.message}
              </motion.p>
            )}

            {/* Back button when data is visible */}
            {isDataVisible && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={resetToEntry}
                className="text-xs px-4 py-2 rounded-lg glass magnetic-hover mt-2"
                style={{ color: 'rgba(255,255,255,0.5)' }}
              >
                Back
              </motion.button>
            )}
          </motion.div>

          {/* ═══════════════════════════════════════════════════
              CENTER PANEL — Charts / Receipts (only when data)
             ═══════════════════════════════════════════════════ */}
          <AnimatePresence>
            {isDataVisible && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-10"
                style={{ minHeight: '100vh' }}
              >
                {/* ── DATA RENDER: Chart + Actions ── */}
                {appState === 'data-render' && (
                  <motion.div
                    key="data-panel"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-3xl flex flex-col gap-5"
                  >
                    {/* Chat messages (in the center panel) */}
                    {adaptedMessages.length > 0 && (
                      <ChatMessages messages={adaptedMessages} isLoading={chat.isLoading} />
                    )}

                    {/* Chart */}
                    {chat.chartData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <StockChart
                          ticker={chat.chartData.ticker}
                          data={chat.chartData.bars}
                          period={chat.chartData.period}
                        />
                      </motion.div>
                    )}

                    {/* Action buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 justify-center"
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
                        Execute Trade
                      </button>
                    </motion.div>
                  </motion.div>
                )}

                {/* ── TRADE CONFIRM: Receipt + Slide ── */}
                {appState === 'trade-confirm' && chat.tradeReceipt && (
                  <motion.div
                    key="trade-panel"
                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <TradeReceiptCard receipt={chat.tradeReceipt} />
                    <SlideToConfirm onConfirm={handleTradeConfirm} isLoading={trade.isExecuting} />

                    {/* Trade result feedback */}
                    {trade.result && !trade.result.success && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-400"
                      >
                        {trade.result.error || 'Trade failed'}
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
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* ── Mode Toggle (always at bottom center) ── */}
        {!showThinking && (
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
                setShowThinking(true);
                chat.submitMessage("How's Apple doing?");
              }}
              className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-500 hover:text-white transition-colors"
            >
              Demo: AAPL
            </button>
          )}
          {appState === 'data-render' && (
            <button
              onClick={() => {
                chat.submitMessage(`Buy 5 shares of ${chat.chartData?.ticker || 'AAPL'}`);
              }}
              className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-500 hover:text-white transition-colors"
            >
              Demo: Trade
            </button>
          )}
          {(appState !== 'entry' || showThinking) && (
            <button
              onClick={resetToEntry}
              className="text-xs px-3 py-1.5 rounded-lg glass text-zinc-500 hover:text-white transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </LayoutGroup>
  );
}

