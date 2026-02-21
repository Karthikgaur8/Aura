// ============================================================
// ConfettiSuccess.tsx — Dev A
// Confetti burst animation on successful trade execution
// Uses canvas-confetti
// ============================================================
'use client';

import React, { useEffect } from 'react';

interface ConfettiSuccessProps {
    show: boolean;
}

export default function ConfettiSuccess({ show }: ConfettiSuccessProps) {
    useEffect(() => {
        if (show) {
            // TODO: Dev A — trigger canvas-confetti burst
            console.log('🎉 Trade executed successfully!');
        }
    }, [show]);

    if (!show) return null;

    return (
        <div className="confetti-overlay">
            <div className="success-message">
                <span className="success-icon">✅</span>
                <h2>Trade Executed!</h2>
            </div>
        </div>
    );
}
