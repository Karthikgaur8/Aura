// ============================================================
// ModeToggle.tsx — Dev A
// Sleek toggle between Voice 🎙️ and Chat 💬 with animated pill
// ============================================================
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { InteractionMode } from '@/types';

interface ModeToggleProps {
    mode: InteractionMode;
    onToggle: (mode: InteractionMode) => void;
}

export default function ModeToggle({ mode, onToggle }: ModeToggleProps) {
    return (
        <div className="relative flex items-center gap-0 rounded-full p-1 glass-strong"
            style={{ minWidth: 220 }}>
            {/* Animated sliding pill */}
            <motion.div
                className="absolute top-1 bottom-1 rounded-full"
                style={{
                    width: 'calc(50% - 4px)',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(139,92,246,0.2))',
                    boxShadow: '0 0 20px rgba(139,92,246,0.3)',
                    border: '1px solid rgba(139,92,246,0.3)',
                }}
                animate={{
                    left: mode === 'voice' ? 4 : 'calc(50%)',
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />

            <button
                className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-colors duration-200"
                style={{
                    color: mode === 'voice' ? '#fff' : 'rgba(255,255,255,0.5)',
                }}
                onClick={() => onToggle('voice')}
            >
                <span className="text-base">🎙️</span>
                Voice
            </button>

            <button
                className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-medium transition-colors duration-200"
                style={{
                    color: mode === 'chat' ? '#fff' : 'rgba(255,255,255,0.5)',
                }}
                onClick={() => onToggle('chat')}
            >
                <span className="text-base">💬</span>
                Chat
            </button>
        </div>
    );
}
