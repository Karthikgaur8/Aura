// ============================================================
// AnimatedCounter.tsx — Dev A
// Smooth counting animation for currency/number values
// Numbers roll up/down when they change — Bloomberg terminal feel
// ============================================================
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    className?: string;
    duration?: number;
}

function AnimatedDigit({ digit, className }: { digit: string; className?: string }) {
    if (digit === '.' || digit === ',' || digit === '$' || digit === '+' || digit === '-' || digit === '%' || digit === ' ') {
        return <span className={className}>{digit}</span>;
    }

    const num = parseInt(digit);
    return (
        <span className="relative inline-block overflow-hidden" style={{ width: '0.6em', height: '1.2em' }}>
            <motion.span
                className={`absolute left-0 ${className}`}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                key={num}
                style={{ display: 'block', lineHeight: '1.2em' }}
            >
                {digit}
            </motion.span>
        </span>
    );
}

export default function AnimatedCounter({
    value,
    prefix = '',
    suffix = '',
    decimals = 2,
    className = '',
    duration = 1.5,
}: AnimatedCounterProps) {
    const spring = useSpring(0, { stiffness: 50, damping: 20, duration: duration * 1000 });
    const [displayValue, setDisplayValue] = useState(value);
    const prevValue = useRef(value);

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    useEffect(() => {
        const unsubscribe = spring.on('change', (latest) => {
            setDisplayValue(latest);
        });
        return unsubscribe;
    }, [spring]);

    const formatted = `${prefix}${Math.abs(displayValue).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    })}${suffix}`;

    const sign = value >= 0 && prefix !== '$' ? '+' : value < 0 ? '-' : '';
    const display = value < 0 && prefix !== '$' ? `${sign}${formatted}` : formatted;

    const isIncreasing = value > prevValue.current;
    useEffect(() => { prevValue.current = value; }, [value]);

    return (
        <motion.span
            className={`inline-flex items-baseline font-mono tabular-nums ${className}`}
            animate={{
                color: isIncreasing ? ['inherit', '#22c55e', 'inherit'] : ['inherit', '#ef4444', 'inherit'],
            }}
            transition={{ duration: 0.6 }}
        >
            {display.split('').map((char, i) => (
                <AnimatedDigit key={`${i}-${char}`} digit={char} className={className} />
            ))}
        </motion.span>
    );
}
