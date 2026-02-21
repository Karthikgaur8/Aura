// ============================================================
// VoiceOrb.tsx — Dev A
// Animated glowing orb using Framer Motion layoutId animation
// Center-screen by default, shrinks to top-left on data render
// ============================================================
'use client';

import React from 'react';

interface VoiceOrbProps {
    /** Whether the orb is in its compact (top-left) state */
    isCompact: boolean;
    /** Whether the agent is currently speaking/listening */
    isActive: boolean;
}

export default function VoiceOrb({ isCompact, isActive }: VoiceOrbProps) {
    // TODO: Dev A — implement with Framer Motion <motion.div layoutId="orb">
    return (
        <div className={`voice-orb ${isCompact ? 'compact' : ''} ${isActive ? 'active' : ''}`}>
            <div className="orb-inner" />
        </div>
    );
}
