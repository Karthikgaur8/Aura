// ============================================================
// AIThinkingChain.tsx — Dev A
// Minimal single-line thinking indicator with spinner
// ============================================================
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AIThinkingChainProps {
    isActive: boolean;
    onComplete: () => void;
}

export default function AIThinkingChain({ isActive }: AIThinkingChainProps) {
    if (!isActive) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 px-5 py-3 rounded-xl"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
            }}
        >
            {/* Spinner */}
            <motion.div
                className="w-4 h-4 rounded-full"
                style={{
                    border: '2px solid #8b5cf6',
                    borderTopColor: 'transparent',
                }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
            <span
                className="text-sm"
                style={{ color: 'rgba(255,255,255,0.7)' }}
            >
                Searching...
            </span>
        </motion.div>
    );
}

