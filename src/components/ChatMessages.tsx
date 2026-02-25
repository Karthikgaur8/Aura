// ============================================================
// ChatMessages.tsx — Dev A
// Glassmorphic chat message bubbles with typing indicator
// ============================================================
'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuoteCard from './QuoteCard';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolInvocations?: any[];
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
            className="w-full max-w-2xl mx-auto flex-1 min-h-0"
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
                            <div className="flex flex-col gap-2">
                                {/* Text Bubble (only render if there's text) */}
                                {msg.content && (
                                    <div
                                        className={`max-w-[80%] px-4 py-2.5 text-[15px] leading-relaxed ${msg.role === 'user'
                                                ? 'rounded-2xl rounded-br-sm self-end bg-zinc-100 text-zinc-950 font-medium shadow-sm'
                                                : 'rounded-2xl rounded-bl-sm self-start bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                )}

                                {/* Inline Tool Rendering (Cards) */}
                                {msg.toolInvocations?.map((invocation, idx) => {
                                    if (invocation.toolName === 'get_stock_quote' && invocation.state === 'result') {
                                        return (
                                            <div key={idx} className="self-start">
                                                <QuoteCard quote={invocation.result} />
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
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
                                className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3 bg-zinc-900 border border-zinc-800 shadow-sm"
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.span
                                        key={i}
                                        className="block w-1.5 h-1.5 rounded-full bg-zinc-500"
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
