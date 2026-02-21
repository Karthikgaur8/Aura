// ============================================================
// CursorGlow.tsx — Dev A
// Subtle purple glow that follows the mouse cursor
// ============================================================
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CursorGlow() {
    const [position, setPosition] = useState({ x: -200, y: -200 });
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            if (!visible) setVisible(true);
        };
        const handleMouseLeave = () => setVisible(false);

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [visible]);

    return (
        <motion.div
            className="fixed pointer-events-none"
            style={{
                zIndex: 1,
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.03) 40%, transparent 70%)',
                filter: 'blur(2px)',
                transform: 'translate(-50%, -50%)',
            }}
            animate={{
                x: position.x,
                y: position.y,
                opacity: visible ? 1 : 0,
            }}
            transition={{
                type: 'spring',
                stiffness: 150,
                damping: 15,
                mass: 0.1,
            }}
        />
    );
}
