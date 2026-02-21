// ============================================================
// TradeReceipt.tsx — Dev A
// Glassmorphic trade confirmation card with slide-up animation
// ============================================================
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { TradeReceipt as TradeReceiptType } from '@/types';

interface TradeReceiptProps {
    receipt: TradeReceiptType;
}

export default function TradeReceipt({ receipt }: TradeReceiptProps) {
    const isBuy = receipt.side === 'buy';
    const accentColor = isBuy ? '#22c55e' : '#ef4444';
    const accentGlow = isBuy
        ? '0 0 30px rgba(34,197,94,0.2)'
        : '0 0 30px rgba(239,68,68,0.2)';

    return (
        <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-sm mx-auto rounded-2xl p-6 glass-card"
            style={{ boxShadow: accentGlow }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-white">Trade Confirmation</h3>
                <span
                    className="text-xs font-bold uppercase px-3 py-1 rounded-full"
                    style={{
                        background: `${accentColor}20`,
                        color: accentColor,
                        border: `1px solid ${accentColor}40`,
                        boxShadow: `0 0 12px ${accentColor}30`,
                    }}
                >
                    {receipt.side}
                </span>
            </div>

            {/* Ticker + Price hero */}
            <div className="text-center mb-5">
                <div className="text-3xl font-bold text-white mb-1" style={{ textShadow: `0 0 20px ${accentColor}40` }}>
                    {receipt.ticker}
                </div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    ${receipt.currentPrice.toFixed(2)} per share
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />

            {/* Details rows */}
            <div className="flex flex-col gap-3">
                <Row label="Shares" value={receipt.qty.toString()} />
                <Row label="Order Type" value={receipt.orderType} />
                <Row
                    label="Estimated Total"
                    value={`$${receipt.estimatedTotal.toFixed(2)}`}
                    highlight
                    color={accentColor}
                />
                {receipt.stopLoss && (
                    <Row label="Stop Loss" value={`$${receipt.stopLoss.toFixed(2)}`} />
                )}
            </div>
        </motion.div>
    );
}

function Row({ label, value, highlight, color }: {
    label: string;
    value: string;
    highlight?: boolean;
    color?: string;
}) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            <span
                className={`text-sm font-medium ${highlight ? 'font-bold' : ''}`}
                style={{ color: highlight && color ? color : '#fff' }}
            >
                {value}
            </span>
        </div>
    );
}
