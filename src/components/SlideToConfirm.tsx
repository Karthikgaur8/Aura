// ============================================================
// SlideToConfirm.tsx — Dev A
// Drag-to-confirm button using Framer Motion drag
// ============================================================
'use client';

import React from 'react';

interface SlideToConfirmProps {
    onConfirm: () => void;
    isLoading: boolean;
    label?: string;
}

export default function SlideToConfirm({ onConfirm, isLoading, label = 'Slide to Execute' }: SlideToConfirmProps) {
    // TODO: Dev A — implement with Framer Motion drag + onDragEnd threshold
    return (
        <div className="slide-to-confirm">
            <button onClick={onConfirm} disabled={isLoading}>
                {isLoading ? 'Executing...' : label}
            </button>
        </div>
    );
}
