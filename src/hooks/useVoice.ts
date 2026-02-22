// ============================================================
// hooks/useVoice.ts — Dev B
// Voice I/O: Browser Web Speech API (STT) + Browser TTS
// With optional ElevenLabs upgrade path
// ============================================================

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ElevenLabs config (optional — set NEXT_PUBLIC_ELEVENLABS_API_KEY to enable)
const ELEVENLABS_API_KEY = typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    : undefined;
const ELEVENLABS_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // "Adam" — deep, warm male voice

export function useVoice() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const onResultRef = useRef<((text: string) => void) | null>(null);

    // Check browser support on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            setIsSupported(!!SpeechRecognition);
        }
    }, []);

    /** Start listening via browser Web Speech API */
    const startListening = useCallback((onResult?: (text: string) => void) => {
        if (typeof window === 'undefined') return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        // Stop any existing recognition
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;        // Stop after one phrase
        recognition.interimResults = true;     // Show interim results for visual feedback
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        // Store callback ref
        onResultRef.current = onResult || null;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognition.onresult = (event: { results: { isFinal: boolean;[index: number]: { transcript: string } }[] }) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = 0; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            // Show interim results for visual feedback
            setTranscript(finalTranscript || interimTranscript);

            // When we have a final result, trigger the callback
            if (finalTranscript) {
                onResultRef.current?.(finalTranscript.trim());
            }
        };

        recognition.onerror = (event: { error: string; message?: string }) => {
            // "aborted" is expected when recognition is stopped/restarted — don't log it
            if (event.error === 'aborted') {
                setIsListening(false);
                return;
            }
            console.error('Speech recognition error:', event.error, event.message);
            setIsListening(false);
            setVoiceError(event.error);

            // Provide user-friendly feedback for common errors
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone permissions in your browser to use voice chat.');
            } else if (event.error === 'network') {
                alert('Network error occurred during speech recognition. Please check your connection.');
            }
            // Don't clear transcript on error — user might want to see what was captured
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        setVoiceError(null);
        recognition.start();
    }, []);

    /** Stop listening */
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    /** Speak text using ElevenLabs API (if key set) or browser speechSynthesis */
    const speak = useCallback(async (text: string) => {
        if (!text || typeof window === 'undefined') return;

        // Cancel any ongoing speech
        stopSpeaking();

        setIsSpeaking(true);

        // Try ElevenLabs first (if API key is configured)
        if (ELEVENLABS_API_KEY) {
            try {
                const response = await fetch(
                    `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}/stream`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'xi-api-key': ELEVENLABS_API_KEY,
                        },
                        body: JSON.stringify({
                            text,
                            model_id: 'eleven_turbo_v2',
                            voice_settings: {
                                stability: 0.5,
                                similarity_boost: 0.75,
                                style: 0.3,
                            },
                        }),
                    }
                );

                if (response.ok && response.body) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const audio = new Audio(url);
                    audioRef.current = audio;

                    audio.onended = () => {
                        setIsSpeaking(false);
                        URL.revokeObjectURL(url);
                        audioRef.current = null;
                    };

                    audio.onerror = () => {
                        setIsSpeaking(false);
                        URL.revokeObjectURL(url);
                        audioRef.current = null;
                    };

                    await audio.play();
                    return;
                }
            } catch (error) {
                console.warn('ElevenLabs TTS failed, falling back to browser TTS:', error);
            }
        }

        // Fallback: Browser speechSynthesis
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 0.9;
        utterance.volume = 1.0;

        // Try to pick a natural-sounding voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
            (v) =>
                v.name.includes('Google') ||
                v.name.includes('Natural') ||
                v.name.includes('Daniel')
        );
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    /** Stop any ongoing speech */
    const stopSpeaking = useCallback(() => {
        if (typeof window === 'undefined') return;

        // Stop ElevenLabs audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        // Stop browser TTS
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    return {
        // State
        isListening,
        isSpeaking,
        transcript,
        isSupported,
        voiceError,

        // Actions
        startListening,
        stopListening,
        speak,
        stopSpeaking,
    };
}
