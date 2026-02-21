// ============================================================
// ChatInput.tsx — Dev A
// Floating chat text input for text mode interaction
// ============================================================
'use client';

import React from 'react';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export default function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
    // TODO: Dev A — sleek floating input with glassmorphism styling
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
            }}
            className="chat-input-container"
        >
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="What's the move today, bro?"
                disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
                Send
            </button>
        </form>
    );
}
