const BackgroundAura = () => {
    return (
        <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-[#f8fafc]">
            {/* Base Layer - Soft Pearly White */}
            <div className="absolute inset-0 bg-white" />

            {/* Deep Blue Aura - Top Left (STATIC) */}
            <div className="absolute top-[-20%] left-[-15%] w-[80%] h-[80%] rounded-full bg-blue-900/30 blur-[160px]" />

            {/* Emerald Aura - Bottom Right (STATIC) */}
            <div className="absolute bottom-[-25%] right-[-20%] w-[90%] h-[90%] rounded-full bg-emerald-500/25 blur-[180px]" />

            {/* Pearly White Glow - Center (STATIC) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-slate-100/40 blur-[130px]" />

            {/* Floating Accent - Primary Blue (STATIC) */}
            <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[140px]" />

            {/* Glassmorphism Grain Overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* Subtle vignetting for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-200/20" />
        </div>
    );
};

export default BackgroundAura;