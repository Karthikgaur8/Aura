// ============================================================
// hooks/useAuraChat.ts — Dev B
// Chat state management hook wrapping Vercel AI SDK useChat
// ============================================================

'use client';

import { useChat } from 'ai/react';

export function useAuraChat() {
    const chat = useChat({
        api: '/api/chat',
        initialMessages: [],
    });

    return {
        messages: chat.messages,
        input: chat.input,
        setInput: chat.setInput,
        handleSubmit: chat.handleSubmit,
        handleInputChange: chat.handleInputChange,
        isLoading: chat.isLoading,
        error: chat.error,
        // TODO: Dev B — parse toolInvocations to extract chart & receipt data
    };
}
