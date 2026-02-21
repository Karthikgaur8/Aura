// ============================================================
// TickerTape.tsx — Dev A
// Bloomberg-style scrolling stock ticker tape
// ============================================================
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TickerItem {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
}

const MOCK_TICKERS: TickerItem[] = [
    { symbol: 'AAPL', price: 234.25, change: 3.42, changePercent: 1.48 },
    { symbol: 'GOOGL', price: 178.92, change: -1.23, changePercent: -0.68 },
    { symbol: 'MSFT', price: 442.18, change: 5.67, changePercent: 1.30 },
    { symbol: 'TSLA', price: 248.50, change: 12.30, changePercent: 5.21 },
    { symbol: 'AMZN', price: 198.74, change: 2.15, changePercent: 1.09 },
    { symbol: 'NVDA', price: 875.30, change: -8.45, changePercent: -0.96 },
    { symbol: 'META', price: 612.40, change: 7.89, changePercent: 1.30 },
    { symbol: 'JPM', price: 198.55, change: 1.12, changePercent: 0.57 },
    { symbol: 'V', price: 285.60, change: -0.95, changePercent: -0.33 },
    { symbol: 'SPY', price: 523.18, change: 4.32, changePercent: 0.83 },
];

function TickerItemDisplay({ item }: { item: TickerItem }) {
    const isPositive = item.change >= 0;

    return (
        <div className="flex items-center gap-2 px-4 whitespace-nowrap">
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {item.symbol}
            </span>
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
                ${item.price.toFixed(2)}
            </span>
            <span
                className="text-xs font-mono font-medium"
                style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
            >
                {isPositive ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
            </span>
        </div>
    );
}

export default function TickerTape() {
    // Duplicate array for seamless loop
    const items = [...MOCK_TICKERS, ...MOCK_TICKERS];

    return (
        <div
            className="w-full overflow-hidden"
            style={{
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                height: '32px',
            }}
        >
            <motion.div
                className="flex items-center h-full"
                animate={{ x: ['0%', '-50%'] }}
                transition={{
                    x: {
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear',
                    },
                }}
            >
                {items.map((item, i) => (
                    <TickerItemDisplay key={`${item.symbol}-${i}`} item={item} />
                ))}
            </motion.div>
        </div>
    );
}
