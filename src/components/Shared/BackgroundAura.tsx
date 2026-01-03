import React from 'react';
import { motion } from 'framer-motion';

const BackgroundAura = () => {
    return (
        <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-[#f8fafc]">
            {/* Base Layer - Soft Pearly White */}
            <div className="absolute inset-0 bg-white" />

            {/* Deep Blue Aura - Top Left */}
            <motion.div
                animate={{
                    x: [0, 150, -100, 0],
                    y: [0, -150, 100, 0],
                    rotate: [0, 90, 180, 0],
                    scale: [1, 1.4, 0.8, 1],
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-20%] left-[-15%] w-[80%] h-[80%] rounded-full bg-blue-900/30 blur-[160px]"
            />

            {/* Emerald Aura - Bottom Right */}
            <motion.div
                animate={{
                    x: [0, -200, 100, 0],
                    y: [0, 100, -150, 0],
                    rotate: [0, -45, 45, 0],
                    scale: [1, 1.2, 1.5, 1],
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-[-25%] right-[-20%] w-[90%] h-[90%] rounded-full bg-emerald-500/25 blur-[180px]"
            />

            {/* Pearly White Glow - Center */}
            <motion.div
                animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-slate-100/40 blur-[130px]"
            />

            {/* Floating Accent - Primary Blue */}
            <motion.div
                animate={{
                    x: [0, 300, -200, 0],
                    y: [0, 400, -200, 0],
                }}
                transition={{
                    duration: 45,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[140px]"
            />

            {/* Glassmorphism Grain Overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Subtle vignetting for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-200/20" />
        </div>
    );
};

export default BackgroundAura;
