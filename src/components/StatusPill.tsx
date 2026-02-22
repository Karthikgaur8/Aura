// ============================================================
// StatusPill.tsx — Dev A
// A floating contextual status pill that shows what Aura is doing
// Appears below the orb with smooth animations
// ============================================================
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusPillProps {
    text: string;
    icon?: string;
    visible: boolean;
    variant?: 'default' | 'success' | 'warning';
}

const VARIANT_STYLES = {
    default: {
        bg: 'rgba(139,92,246,0.12)',
        border: 'rgba(139,92,246,0.2)',
        dot: '#8b5cf6',
    },
    success: {
        bg: 'rgba(34,197,94,0.12)',
        border: 'rgba(34,197,94,0.2)',
        dot: '#22c55e',
    },
    warning: {
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.2)',
        dot: '#f59e0b',
    },
};

export default function StatusPill({ text, icon, visible, variant = 'default' }: StatusPillProps) {
    const styles = VARIANT_STYLES[variant];

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, scale: 0.9, filter: 'blur(4px)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                    style={{
                        background: styles.bg,
                        border: `1px solid ${styles.border}`,
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    {/* Pulsing dot */}
                    <motion.div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: styles.dot, boxShadow: `0 0 6px ${styles.dot}` }}
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />

                    {icon && <span className="text-xs">{icon}</span>}

                    <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        {text}
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
