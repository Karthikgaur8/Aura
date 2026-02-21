// ============================================================
// ChatInput.tsx — Dev A
// Floating glassmorphic chat input bar
// ============================================================
'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export default function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus input on mount
        inputRef.current?.focus();
    }, []);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-xl mx-auto"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (value.trim() && !isLoading) onSubmit();
                    }}
                    className="relative flex items-center gap-3 rounded-2xl px-5 py-3 glass-strong animate-border-glow"
                    style={{
                        boxShadow: '0 0 30px rgba(139,92,246,0.1), 0 4px 20px rgba(0,0,0,0.3)',
                    }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="What's the move today?"
                        disabled={isLoading}
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-zinc-500"
                        style={{ caretColor: '#8b5cf6' }}
                    />

                    <motion.button
                        type="submit"
                        disabled={isLoading || !value.trim()}
                        className="flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-30"
                        style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            boxShadow: '0 0 15px rgba(139,92,246,0.3)',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {isLoading ? (
                            <motion.span
                                className="block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                            />
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </AnimatePresence>
    );
}
