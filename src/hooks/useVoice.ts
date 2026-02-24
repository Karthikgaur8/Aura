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
    const isSpeakingRef = useRef(false);

    // Check browser support + preload voices on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            setIsSupported(!!SpeechRecognition);

            // Preload TTS voices (they load async in most browsers)
            window.speechSynthesis?.getVoices();
            if (window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = () => {
                    window.speechSynthesis.getVoices();
                };
            }
        }
    }, []);

    /** Start listening via browser Web Speech API */
    const startListening = useCallback((onResult?: (text: string) => void) => {
        if (typeof window === 'undefined') return;

        // Don't open mic while TTS is still playing — causes echo/contention
        if (isSpeakingRef.current) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }

        // Cleanly tear down any existing recognition instance
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { /* */ }
            recognitionRef.current = null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        onResultRef.current = onResult || null;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
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

            setTranscript(finalTranscript || interimTranscript);

            if (finalTranscript) {
                onResultRef.current?.(finalTranscript.trim());
                try { recognition.stop(); } catch { /* */ }
                setIsListening(false);
            }
        };

        recognition.onerror = (event: { error: string; message?: string }) => {
            if (event.error === 'aborted' || event.error === 'no-speech' || event.error === 'audio-capture') {
                setIsListening(false);
                return;
            }
            console.error('Speech recognition error:', event.error, event.message);
            setIsListening(false);
            setVoiceError(event.error);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        setVoiceError(null);

        try {
            recognition.start();
        } catch (err) {
            console.warn('Speech recognition start failed:', err);
            setIsListening(false);
        }
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

        // Stop mic before speaking to prevent echo feedback
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { /* */ }
            recognitionRef.current = null;
            setIsListening(false);
        }

        // Cancel any ongoing speech
        stopSpeaking();

        setIsSpeaking(true);
        isSpeakingRef.current = true;

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
                        isSpeakingRef.current = false;
                        setIsSpeaking(false);
                        URL.revokeObjectURL(url);
                        audioRef.current = null;
                    };

                    audio.onerror = () => {
                        isSpeakingRef.current = false;
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

        // Pick a consistent English voice — prevents random accent switching
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
            voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) ||
            voices.find(v => v.lang === 'en-US' && v.name.includes('Natural')) ||
            voices.find(v => v.lang === 'en-US' && v.name.includes('Microsoft')) ||
            voices.find(v => v.lang === 'en-US') ||
            voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onend = () => { isSpeakingRef.current = false; setIsSpeaking(false); };
        utterance.onerror = () => { isSpeakingRef.current = false; setIsSpeaking(false); };

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
        isSpeakingRef.current = false;
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
