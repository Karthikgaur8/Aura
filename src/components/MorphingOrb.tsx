// ============================================================
// MorphingOrb.tsx — Dev A
// REPLACES VoiceOrb with a morphing SVG blob + audio ring
// The orb constantly shifts shape, pulses to activity,
// and has a circular audio waveform ring around it
// ============================================================
'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface MorphingOrbProps {
    isCompact: boolean;
    isActive: boolean;
    audioLevel?: number; // 0-1 mic level
}

// Generate smooth SVG blob path points using superformula
function generateBlobPath(points: number, radius: number, variance: number, seed: number): string {
    const pts: [number, number][] = [];
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const r = radius + Math.sin(angle * 3 + seed) * variance + Math.cos(angle * 2 + seed * 0.7) * variance * 0.5;
        pts.push([
            Math.cos(angle) * r + radius + variance,
            Math.sin(angle) * r + radius + variance,
        ]);
    }

    // Close with smooth bezier curves
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length; i++) {
        const next = pts[(i + 1) % pts.length];
        const controlAngle = ((i + 0.5) / points) * Math.PI * 2;
        const cr = radius + Math.sin(controlAngle * 3 + seed * 1.3) * variance * 0.8;
        const cx = Math.cos(controlAngle) * cr + radius + variance;
        const cy = Math.sin(controlAngle) * cr + radius + variance;
        d += ` Q ${cx} ${cy} ${next[0]} ${next[1]}`;
    }
    d += 'Z';
    return d;
}

export default function MorphingOrb({ isCompact, isActive, audioLevel = 0 }: MorphingOrbProps) {
    const size = isCompact ? 40 : 160;
    const viewBox = isCompact ? 60 : 220;

    // Generate multiple blob shapes to morph between
    const blobPaths = useMemo(() => {
        const baseR = isCompact ? 18 : 75;
        const v = isCompact ? 4 : 18;
        return [
            generateBlobPath(8, baseR, v, 0),
            generateBlobPath(8, baseR, v, 2.1),
            generateBlobPath(8, baseR, v, 4.2),
            generateBlobPath(8, baseR, v, 6.3),
            generateBlobPath(8, baseR, v, 0),
        ];
    }, [isCompact]);

    const glowIntensity = isActive ? 0.6 + audioLevel * 0.4 : 0.3;
    const pulseScale = isActive ? [1, 1.05, 1] : [1, 1.02, 1];

    return (
        <motion.div
            layoutId="orb"
            className="relative"
            style={{ width: size, height: size }}
            animate={{ scale: pulseScale }}
            transition={{
                scale: { duration: isActive ? 1.5 : 3, repeat: Infinity, ease: 'easeInOut' },
                layout: { type: 'spring', stiffness: 200, damping: 25 },
            }}
        >
            {/* Outer glow rings */}
            {!isCompact && (
                <>
                    <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle, rgba(139,92,246,${glowIntensity * 0.15}) 0%, transparent 70%)`,
                            filter: 'blur(30px)',
                            transform: 'scale(2.5)',
                        }}
                        animate={{
                            opacity: isActive ? [0.5, 1, 0.5] : [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    {/* Audio-reactive ring */}
                    {isActive && (
                        <motion.div
                            className="absolute rounded-full"
                            style={{
                                inset: -20,
                                border: '1px solid rgba(139,92,246,0.2)',
                                borderRadius: '50%',
                            }}
                            animate={{
                                scale: [1, 1.1 + audioLevel * 0.3, 1],
                                opacity: [0.3, 0.6, 0.3],
                                borderColor: [
                                    'rgba(139,92,246,0.2)',
                                    `rgba(34,197,94,${0.3 + audioLevel * 0.4})`,
                                    'rgba(139,92,246,0.2)',
                                ],
                            }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    )}
                    {/* Second audio ring */}
                    {isActive && (
                        <motion.div
                            className="absolute rounded-full"
                            style={{
                                inset: -35,
                                border: '1px solid rgba(34,197,94,0.1)',
                                borderRadius: '50%',
                            }}
                            animate={{
                                scale: [1, 1.15 + audioLevel * 0.2, 1],
                                opacity: [0.2, 0.4, 0.2],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                        />
                    )}
                </>
            )}

            {/* SVG morphing blob */}
            <svg
                viewBox={`0 0 ${viewBox} ${viewBox}`}
                width={size}
                height={size}
                className="relative z-10"
            >
                <defs>
                    {/* Main gradient */}
                    <radialGradient id="orbGrad" cx="35%" cy="35%">
                        <stop offset="0%" stopColor="#c4b5fd" />
                        <stop offset="40%" stopColor="#8b5cf6" />
                        <stop offset="80%" stopColor="#6d28d9" />
                        <stop offset="100%" stopColor="#4c1d95" />
                    </radialGradient>
                    {/* Inner highlight */}
                    <radialGradient id="orbHighlight" cx="30%" cy="25%">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                    {/* Glow filter */}
                    <filter id="orbGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation={isCompact ? 2 : 8} result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Main morphing blob */}
                <motion.path
                    d={blobPaths[0]}
                    fill="url(#orbGrad)"
                    filter="url(#orbGlow)"
                    animate={{ d: blobPaths }}
                    transition={{
                        d: {
                            duration: isActive ? 3 : 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        },
                    }}
                />

                {/* Specular highlight blob */}
                <motion.path
                    d={blobPaths[0]}
                    fill="url(#orbHighlight)"
                    animate={{ d: blobPaths }}
                    transition={{
                        d: {
                            duration: isActive ? 3 : 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        },
                    }}
                    style={{ transform: 'scale(0.85) translate(5%, 5%)' }}
                />
            </svg>

            {/* Center pulse dot */}
            {isActive && !isCompact && (
                <motion.div
                    className="absolute top-1/2 left-1/2 rounded-full"
                    style={{
                        width: 6,
                        height: 6,
                        background: '#22c55e',
                        boxShadow: '0 0 12px #22c55e',
                        transform: 'translate(-50%, -50%)',
                    }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}
        </motion.div>
    );
}
