// ============================================================
// ChatMessages.tsx — Dev A
// Glassmorphic chat message bubbles with typing indicator
// ============================================================
'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface ChatMessagesProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    if (messages.length === 0 && !isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-xl mx-auto flex-1 min-h-0"
        >
            <div
                ref={scrollRef}
                className="flex flex-col gap-3 overflow-y-auto max-h-[40vh] px-1 py-2 scrollbar-thin"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)',
                }}
            >
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                                        ? 'rounded-br-md'
                                        : 'rounded-bl-md'
                                    }`}
                                style={
                                    msg.role === 'user'
                                        ? {
                                            background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(139,92,246,0.15))',
                                            border: '1px solid rgba(139,92,246,0.2)',
                                            color: '#e4e4e7',
                                        }
                                        : {
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: '#d4d4d8',
                                        }
                                }
                            >
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex justify-start"
                        >
                            <div
                                className="flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3"
                                style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        className="block w-1.5 h-1.5 rounded-full"
                                        style={{ background: '#8b5cf6' }}
                                        animate={{
                                            opacity: [0.3, 1, 0.3],
                                            scale: [0.85, 1.15, 0.85],
                                        }}
                                        transition={{
                                            duration: 1,
                                            repeat: Infinity,
                                            delay: i * 0.2,
                                        }}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
