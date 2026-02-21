// ============================================================
// hooks/useVoice.ts — Dev B
// Voice I/O: browser Speech-to-Text + ElevenLabs/browser TTS
// ============================================================

'use client';

import { useState, useCallback, useRef } from 'react';

export function useVoice() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    /** Start listening via browser Web Speech API */
    const startListening = useCallback(() => {
        // TODO: Dev B — implement webkitSpeechRecognition
        // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        // recognitionRef.current = new SpeechRecognition();
        // ...
        setIsListening(true);
        console.log('🎙️ Listening...');
    }, []);

    /** Stop listening */
    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    /** Speak text using ElevenLabs API or browser speechSynthesis */
    const speak = useCallback(async (text: string) => {
        // TODO: Dev B — implement ElevenLabs TTS or fallback to browser speechSynthesis
        setIsSpeaking(true);
        console.log('🔊 Speaking:', text);
        // Fallback: browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
    }, []);

    return {
        isListening,
        isSpeaking,
        transcript,
        startListening,
        stopListening,
        speak,
    };
}
