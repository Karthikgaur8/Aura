// ============================================================
// SlideToConfirm.tsx — Dev A
// Satisfying drag-to-confirm using Framer Motion drag
// ============================================================
'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface SlideToConfirmProps {
    onConfirm: () => void;
    isLoading: boolean;
    label?: string;
}

const KNOB_SIZE = 52;
const TRACK_PADDING = 4;

export default function SlideToConfirm({ onConfirm, isLoading, label = 'Slide to Execute' }: SlideToConfirmProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [confirmed, setConfirmed] = useState(false);
    const x = useMotionValue(0);

    // Glow trail width follows drag position
    const trailWidth = useTransform(x, (val) => val + KNOB_SIZE + TRACK_PADDING);
    const trailOpacity = useTransform(x, [0, 100], [0.2, 0.8]);

    const getMaxDrag = () => {
        if (!trackRef.current) return 200;
        return trackRef.current.clientWidth - KNOB_SIZE - TRACK_PADDING * 2;
    };

    const handleDragEnd = () => {
        const maxDrag = getMaxDrag();
        if (x.get() > maxDrag * 0.8) {
            setConfirmed(true);
            onConfirm();
        }
    };

    if (isLoading || confirmed) {
        return (
            <div className="w-full max-w-sm mx-auto">
                <motion.div
                    className="flex items-center justify-center rounded-full py-4"
                    style={{
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
                        border: '1px solid rgba(34,197,94,0.3)',
                        boxShadow: '0 0 30px rgba(34,197,94,0.2)',
                    }}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                >
                    <motion.span
                        className="block w-5 h-5 border-2 border-green-400/40 border-t-green-400 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    <span className="ml-3 text-sm font-medium" style={{ color: '#22c55e' }}>
                        Executing...
                    </span>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm mx-auto">
            <div
                ref={trackRef}
                className="relative flex items-center rounded-full overflow-hidden"
                style={{
                    height: KNOB_SIZE + TRACK_PADDING * 2,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: TRACK_PADDING,
                }}
            >
                {/* Green glow trail */}
                <motion.div
                    className="absolute top-0 left-0 bottom-0 rounded-full"
                    style={{
                        width: trailWidth,
                        opacity: trailOpacity,
                        background: 'linear-gradient(90deg, rgba(34,197,94,0.3), rgba(34,197,94,0.15))',
                        boxShadow: '0 0 20px rgba(34,197,94,0.2)',
                    }}
                />

                {/* Label */}
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {label}
                </span>

                {/* Draggable knob */}
                <motion.div
                    className="relative z-10 flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing"
                    style={{
                        width: KNOB_SIZE,
                        height: KNOB_SIZE,
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        boxShadow: '0 0 20px rgba(34,197,94,0.4), 0 2px 8px rgba(0,0,0,0.3)',
                        x,
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: getMaxDrag() }}
                    dragElastic={0.05}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    whileTap={{ scale: 1.08 }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </motion.div>
            </div>
        </div>
    );
}
