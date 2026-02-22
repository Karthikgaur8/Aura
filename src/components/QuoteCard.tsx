// ============================================================
// QuoteCard.tsx — Dev A
// Mini widget showing live stock quote inline in chat
// ============================================================
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { StockQuote } from '@/types';

export default function QuoteCard({ quote }: { quote: StockQuote }) {
    if (quote.error || quote.price === undefined) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-sm rounded-2xl p-4 my-2 border glass backdrop-blur-md"
                style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.05), rgba(239,68,68,0.01))',
                    borderColor: 'rgba(239,68,68,0.2)',
                }}
            >
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-white">{quote.ticker || 'Unknown Ticker'}</h3>
                    <p className="text-xs text-red-400 mt-1">⚠️ {quote.error || 'Failed to fetch quote.'}</p>
                </div>
            </motion.div>
        );
    }

    const isPositive = quote.change >= 0;
    const colorClass = isPositive ? 'text-green-400' : 'text-red-400';
    const bgClass = isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
    const Sign = isPositive ? '+' : '';

    const formattedTime = quote.asOf
        ? new Date(quote.asOf).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
        : 'Just now';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-sm rounded-2xl p-4 my-2 border glass backdrop-blur-md"
            style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                borderColor: 'rgba(255,255,255,0.1)',
            }}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-xl font-bold tracking-tight text-white">{quote.ticker}</h3>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">Live Quote</p>
                </div>
                <div
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${colorClass}`}
                    style={{ background: bgClass }}
                >
                    {isPositive ? '↑' : '↓'}
                    {Math.abs(quote.changePercent).toFixed(2)}%
                </div>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
                <span className="text-3xl font-medium tracking-tighter text-white">
                    ${quote.price.toFixed(2)}
                </span>
                <span className={`text-sm font-medium ${colorClass}`}>
                    {Sign}{quote.change.toFixed(2)}
                </span>
            </div>

            <div className="mt-4 flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-wider">
                <span>Vol: {(quote.volume / 1000000).toFixed(1)}M</span>
                <span>As of {formattedTime}</span>
            </div>
        </motion.div>
    );
}
