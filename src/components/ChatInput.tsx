'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export default function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-focus on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    // Smooth Auto-resize
    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = '0px'; // Reset to calculate scrollHeight correctly
            const scrollHeight = el.scrollHeight;
            el.style.height = Math.min(scrollHeight, 200) + 'px';
        }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !isLoading) onSubmit();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl mx-auto px-4 pb-8"
            >
                <div
                    className="relative flex flex-col w-full transition-all duration-300 ease-in-out rounded-[26px] bg-zinc-900/50 backdrop-blur-2xl border border-white/[0.08] hover:border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                >
                    <div className="flex items-end gap-2 px-4 py-3">
                        <textarea
                            ref={textareaRef}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message Aura..."
                            disabled={isLoading}
                            rows={1}
                            className="flex-1 bg-transparent text-zinc-100 text-[16px] leading-[1.6] outline-none placeholder:text-zinc-500 resize-none py-2 max-h-[200px] overflow-y-auto scrollbar-none"
                            style={{ caretColor: '#a855f7' }}
                        />

                        <motion.button
                            type="button"
                            onClick={() => value.trim() && !isLoading && onSubmit()}
                            disabled={isLoading || !value.trim()}
                            className="flex items-center justify-center rounded-full h-10 w-10 shrink-0 mb-0.5 transition-all disabled:opacity-0"
                            animate={{
                                backgroundColor: value.trim() ? '#ffffff' : 'rgba(255,255,255,0.05)',
                                scale: value.trim() ? 1 : 0.95
                            }}
                            whileHover={value.trim() ? { scale: 1.05 } : {}}
                            whileTap={value.trim() ? { scale: 0.92 } : {}}
                        >
                            {isLoading ? (
                                <motion.span
                                    className="block w-4 h-4 border-2 border-zinc-800 border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                                />
                            ) : (
                                <ArrowUp
                                    size={20}
                                    className={value.trim() ? "text-zinc-950" : "text-zinc-600"}
                                    strokeWidth={2.5}
                                />
                            )}
                        </motion.button>
                    </div>
                </div>

                <p className="text-[11px] text-zinc-500 text-center mt-3 tracking-wide">
                    Aura can make mistakes. Check important info.
                </p>
            </motion.div>
        </AnimatePresence>
    );
}