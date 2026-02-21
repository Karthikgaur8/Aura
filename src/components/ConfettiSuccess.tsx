// ============================================================
// ConfettiSuccess.tsx — Dev A
// Confetti burst animation on trade success using canvas-confetti
// ============================================================
'use client';

import React, { useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiSuccessProps {
    show: boolean;
}

export default function ConfettiSuccess({ show }: ConfettiSuccessProps) {
    const fireConfetti = useCallback(() => {
        // Burst from left
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { x: 0.2, y: 0.6 },
            colors: ['#8b5cf6', '#a78bfa', '#22c55e', '#f59e0b', '#ffffff'],
            scalar: 1.2,
        });

        // Burst from right
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { x: 0.8, y: 0.6 },
            colors: ['#8b5cf6', '#a78bfa', '#22c55e', '#f59e0b', '#ffffff'],
            scalar: 1.2,
        });

        // Center burst (delayed)
        setTimeout(() => {
            confetti({
                particleCount: 50,
                spread: 100,
                origin: { x: 0.5, y: 0.5 },
                colors: ['#8b5cf6', '#22c55e', '#f59e0b'],
                scalar: 1.5,
                gravity: 0.8,
            });
        }, 200);
    }, []);

    useEffect(() => {
        if (show) {
            fireConfetti();
        }
    }, [show, fireConfetti]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                        className="flex flex-col items-center gap-3 px-8 py-6 rounded-2xl glass-card pointer-events-auto"
                        style={{
                            boxShadow: '0 0 60px rgba(34,197,94,0.3), 0 0 120px rgba(139,92,246,0.15)',
                        }}
                    >
                        <motion.span
                            className="text-5xl"
                            initial={{ rotate: -20, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                        >
                            ✅
                        </motion.span>
                        <h2 className="text-xl font-bold text-white text-glow-green">
                            Trade Executed!
                        </h2>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Your order has been placed successfully
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
