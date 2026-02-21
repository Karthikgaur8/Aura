// ============================================================
// AIThinkingChain.tsx — Dev A
// Animated step-by-step AI thinking status chain
// ============================================================
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThinkingStep {
    icon: string;
    label: string;
    durationMs: number;
}

interface AIThinkingChainProps {
    isActive: boolean;
    onComplete: () => void;
    steps?: ThinkingStep[];
}

const DEFAULT_STEPS: ThinkingStep[] = [
    { icon: '🔍', label: 'Searching markets...', durationMs: 1200 },
    { icon: '📊', label: 'Analyzing AAPL data...', durationMs: 1500 },
    { icon: '📈', label: 'Generating chart...', durationMs: 1000 },
    { icon: '💡', label: 'Preparing insights...', durationMs: 800 },
];

export default function AIThinkingChain({
    isActive,
    onComplete,
    steps = DEFAULT_STEPS,
}: AIThinkingChainProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    useEffect(() => {
        if (!isActive) {
            setCurrentStep(0);
            setCompletedSteps([]);
            return;
        }

        if (currentStep >= steps.length) {
            onComplete();
            return;
        }

        const timer = setTimeout(() => {
            setCompletedSteps((prev) => [...prev, currentStep]);
            setCurrentStep((prev) => prev + 1);
        }, steps[currentStep].durationMs);

        return () => clearTimeout(timer);
    }, [isActive, currentStep, steps, onComplete]);

    if (!isActive && completedSteps.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-md mx-auto rounded-xl p-4"
            style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
            }}
        >
            <div className="flex flex-col gap-2.5">
                <AnimatePresence>
                    {steps.map((step, index) => {
                        const isCompleted = completedSteps.includes(index);
                        const isCurrent = currentStep === index && isActive;
                        const isVisible = index <= currentStep;

                        if (!isVisible) return null;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                className="flex items-center gap-3"
                            >
                                {/* Status indicator */}
                                <div className="relative flex items-center justify-center w-6 h-6">
                                    {isCompleted ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <motion.path
                                                    d="M3 8L6.5 11.5L13 4.5"
                                                    stroke="#22c55e"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </svg>
                                        </motion.div>
                                    ) : isCurrent ? (
                                        <motion.div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                border: '2px solid #8b5cf6',
                                                borderTopColor: 'transparent',
                                            }}
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                                ease: 'linear',
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: 'rgba(255,255,255,0.15)' }}
                                        />
                                    )}
                                </div>

                                {/* Label */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">{step.icon}</span>
                                    <span
                                        className="text-sm transition-colors"
                                        style={{
                                            color: isCompleted
                                                ? 'rgba(255,255,255,0.5)'
                                                : isCurrent
                                                    ? 'rgba(255,255,255,0.9)'
                                                    : 'rgba(255,255,255,0.3)',
                                        }}
                                    >
                                        {step.label}
                                    </span>
                                </div>

                                {/* Progress bar for current step */}
                                {isCurrent && (
                                    <div className="flex-1 ml-2">
                                        <div
                                            className="h-0.5 rounded-full overflow-hidden"
                                            style={{ background: 'rgba(255,255,255,0.06)' }}
                                        >
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ background: '#8b5cf6' }}
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{
                                                    duration: step.durationMs / 1000,
                                                    ease: 'easeInOut',
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
