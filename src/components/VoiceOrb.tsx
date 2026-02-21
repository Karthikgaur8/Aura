// ============================================================
// VoiceOrb.tsx — Dev A
// THE hero component — glowing, pulsing orb with layout animation
// Center-screen → top-left corner on data render
// ============================================================
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VoiceOrbProps {
    /** Whether the orb is in its compact (top-left) state */
    isCompact: boolean;
    /** Whether the agent is currently speaking/listening */
    isActive: boolean;
}

export default function VoiceOrb({ isCompact, isActive }: VoiceOrbProps) {
    const size = isCompact ? 48 : 180;

    return (
        <motion.div
            layoutId="orb"
            className="relative flex items-center justify-center"
            style={{
                width: size,
                height: size,
            }}
            animate={{
                width: size,
                height: size,
            }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 30,
                mass: 1,
            }}
        >
            {/* Outer glow ring — slow rotation */}
            <motion.div
                className="absolute inset-0 rounded-full animate-orb-rotate"
                style={{
                    background: `conic-gradient(
                        from 0deg,
                        rgba(139,92,246,0.0),
                        rgba(139,92,246,0.5),
                        rgba(34,197,94,0.3),
                        rgba(139,92,246,0.0)
                    )`,
                    filter: isCompact ? 'blur(6px)' : 'blur(16px)',
                }}
                animate={{
                    scale: isActive ? [1, 1.15, 1] : 1,
                    opacity: isActive ? [0.7, 1, 0.7] : 0.6,
                }}
                transition={{
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    ease: 'easeInOut',
                }}
            />

            {/* Middle glow pulse */}
            {!isCompact && (
                <motion.div
                    className="absolute rounded-full"
                    style={{
                        width: '75%',
                        height: '75%',
                        background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                        filter: 'blur(12px)',
                    }}
                    animate={{
                        scale: isActive ? [1, 1.2, 1] : [1, 1.05, 1],
                        opacity: isActive ? [0.5, 0.9, 0.5] : [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: isActive ? 1.5 : 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}

            {/* Core orb */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: '60%',
                    height: '60%',
                    background: `radial-gradient(
                        circle at 35% 35%,
                        rgba(167,139,250,0.9) 0%,
                        rgba(139,92,246,0.8) 30%,
                        rgba(109,40,217,0.7) 60%,
                        rgba(76,29,149,0.6) 100%
                    )`,
                    boxShadow: `
                        0 0 ${isCompact ? '10px' : '30px'} rgba(139,92,246,0.5),
                        inset 0 0 ${isCompact ? '5px' : '20px'} rgba(255,255,255,0.1)
                    `,
                }}
                animate={{
                    scale: isActive ? [1, 1.08, 1] : 1,
                }}
                transition={{
                    duration: 1.5,
                    repeat: isActive ? Infinity : 0,
                    ease: 'easeInOut',
                }}
            />

            {/* Inner highlight — glossy bubble effect */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: '30%',
                    height: '30%',
                    top: '18%',
                    left: '22%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3), transparent)',
                    filter: 'blur(4px)',
                }}
            />

            {/* Tiny bright center dot */}
            {!isCompact && (
                <motion.div
                    className="absolute rounded-full"
                    style={{
                        width: 6,
                        height: 6,
                        background: '#fff',
                        boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                    }}
                    animate={{
                        opacity: isActive ? [0.5, 1, 0.5] : 0.6,
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}
        </motion.div>
    );
}
