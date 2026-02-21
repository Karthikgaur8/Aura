// ============================================================
// ModeToggle.tsx — Dev A
// Toggle switch between Voice 🎙️ and Chat 💬 modes
// ============================================================
'use client';

import React from 'react';
import type { InteractionMode } from '@/types';

interface ModeToggleProps {
    mode: InteractionMode;
    onToggle: (mode: InteractionMode) => void;
}

export default function ModeToggle({ mode, onToggle }: ModeToggleProps) {
    // TODO: Dev A — elegant toggle switch with smooth animation
    return (
        <div className="mode-toggle">
            <button
                className={mode === 'voice' ? 'active' : ''}
                onClick={() => onToggle('voice')}
            >
                🎙️ Voice
            </button>
            <button
                className={mode === 'chat' ? 'active' : ''}
                onClick={() => onToggle('chat')}
            >
                💬 Chat
            </button>
        </div>
    );
}
