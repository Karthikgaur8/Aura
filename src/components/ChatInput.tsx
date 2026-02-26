// ============================================================
// ChatInput.tsx — Dev A
// Floating glassmorphic chat input bar
// ============================================================
'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paper, InputBase, IconButton, CircularProgress } from '@mui/material';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

const MotionIconButton = motion(IconButton);

export default function ChatInput({ value = '', onChange, onSubmit, isLoading }: ChatInputProps) {
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
                className="w-full max-w-3xl mx-auto"
            >
                <Paper
                    component="form"
                    onSubmit={(e: React.SubmitEvent) => {
                        e.preventDefault();
                        if (value.trim() && !isLoading) onSubmit();
                    }}
                    elevation={0}
                    className="relative flex items-center gap-4 rounded-3xl pl-8 pr-6 py-4 transition-all duration-300 bg-zinc-800/60 hover:bg-zinc-800/80 focus-within:bg-zinc-700/80 focus-within:ring-2 focus-within:ring-white/20 focus-within:scale-[1.02] shadow-xl"
                    sx={{ backgroundColor: 'transparent', backgroundImage: 'none' }}
                >
                    <InputBase
                        inputRef={inputRef}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="What's the move today?"
                        disabled={isLoading}
                        className="flex-1 text-base md:text-lg"
                        sx={{
                            color: 'white',
                            caretColor: 'white',
                            '& .MuiInputBase-input': {
                                padding: '8px 0 8px 8px',
                            },
                            '& .MuiInputBase-input::placeholder': {
                                color: '#a1a1aa',
                                opacity: 1,
                            },
                        }}
                    />

                    <MotionIconButton
                        type="submit"
                        disabled={isLoading || !value.trim()}
                        className="flex items-center justify-center transition-colors disabled:opacity-30 bg-white hover:bg-zinc-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        sx={{
                            color: 'black',
                            width: 48,
                            height: 48,
                            borderRadius: '16px',
                            backgroundColor: 'white',
                            '&:hover': {
                                backgroundColor: '#e4e4e7',
                            },
                            '&.Mui-disabled': {
                                backgroundColor: 'white',
                                opacity: 0.3,
                                color: 'black',
                            }
                        }}
                    >
                        {isLoading ? (
                            <CircularProgress size={20} sx={{ color: 'black' }} />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        )}
                    </MotionIconButton>
                </Paper>
            </motion.div>
        </AnimatePresence>
    );
}
