// ============================================================
// AuroraBackground.tsx — Dev A
// Animated aurora borealis effect using canvas
// Replaces flat ambient blobs with a living, breathing sky
// ============================================================
'use client';

import React, { useEffect, useRef } from 'react';

interface AuroraWave {
    y: number;
    speed: number;
    amplitude: number;
    frequency: number;
    hue: number;
    opacity: number;
    phase: number;
}

export default function AuroraBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        // Create aurora waves
        const waves: AuroraWave[] = [
            { y: height * 0.25, speed: 0.0003, amplitude: 80, frequency: 0.0015, hue: 270, opacity: 0.04, phase: 0 },
            { y: height * 0.30, speed: 0.0005, amplitude: 60, frequency: 0.002, hue: 280, opacity: 0.035, phase: 2 },
            { y: height * 0.35, speed: 0.0004, amplitude: 100, frequency: 0.0012, hue: 160, opacity: 0.025, phase: 4 },
            { y: height * 0.20, speed: 0.0006, amplitude: 50, frequency: 0.0025, hue: 200, opacity: 0.02, phase: 1 },
            { y: height * 0.40, speed: 0.00035, amplitude: 70, frequency: 0.0018, hue: 140, opacity: 0.02, phase: 3 },
        ];

        let t = 0;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            t++;

            for (const wave of waves) {
                ctx.beginPath();

                // Moving aurora curtain
                const timeOffset = t * wave.speed;

                for (let x = 0; x <= width; x += 3) {
                    const y = wave.y +
                        Math.sin(x * wave.frequency + timeOffset * 50 + wave.phase) * wave.amplitude +
                        Math.sin(x * wave.frequency * 0.5 + timeOffset * 30) * wave.amplitude * 0.5;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }

                // Close the shape downward to create a filled curtain
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();

                // Gradient fill
                const gradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + wave.amplitude * 3);
                gradient.addColorStop(0, `hsla(${wave.hue}, 80%, 60%, ${wave.opacity})`);
                gradient.addColorStop(0.3, `hsla(${wave.hue}, 70%, 50%, ${wave.opacity * 0.6})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            animRef.current = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            // Update wave positions
            waves[0].y = height * 0.25;
            waves[1].y = height * 0.30;
            waves[2].y = height * 0.35;
            waves[3].y = height * 0.20;
            waves[4].y = height * 0.40;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0, filter: 'blur(40px)' }}
        />
    );
}
