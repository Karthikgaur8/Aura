// ============================================================
// PortfolioDashboard.tsx — Dev A
// Glassmorphic mini portfolio cards showing key metrics
// ============================================================
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MetricCard {
    label: string;
    value: string;
    subValue?: string;
    accent: string;
    icon: string;
}

const MOCK_METRICS: MetricCard[] = [
    {
        label: 'Portfolio Value',
        value: '$127,842.50',
        subValue: '+$2,340.12 today',
        accent: '#8b5cf6',
        icon: '💎',
    },
    {
        label: 'Buying Power',
        value: '$34,215.00',
        accent: '#22c55e',
        icon: '💰',
    },
    {
        label: 'Day P&L',
        value: '+$2,340.12',
        subValue: '+1.86%',
        accent: '#22c55e',
        icon: '📈',
    },
    {
        label: 'Open Positions',
        value: '12',
        subValue: '8 green · 4 red',
        accent: '#60a5fa',
        icon: '📊',
    },
];

export default function PortfolioDashboard() {
    return (
        <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {MOCK_METRICS.map((metric, index) => (
                <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                        delay: index * 0.1,
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="relative rounded-xl p-3.5 overflow-hidden group cursor-default"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        backdropFilter: 'blur(16px)',
                    }}
                >
                    {/* Accent glow */}
                    <div
                        className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
                        style={{
                            background: `radial-gradient(circle, ${metric.accent}, transparent)`,
                            filter: 'blur(12px)',
                        }}
                    />

                    <div className="relative flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm">{metric.icon}</span>
                            <span className="text-[10px] font-medium uppercase tracking-wider"
                                style={{ color: 'rgba(255,255,255,0.35)' }}>
                                {metric.label}
                            </span>
                        </div>
                        <span className="text-base font-bold text-white">
                            {metric.value}
                        </span>
                        {metric.subValue && (
                            <span className="text-[11px] font-medium" style={{ color: metric.accent }}>
                                {metric.subValue}
                            </span>
                        )}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
}
