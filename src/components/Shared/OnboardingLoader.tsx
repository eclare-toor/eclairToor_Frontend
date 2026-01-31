import React, { useEffect, useState } from 'react';
import logo from '../../assets/logo.webp';

const OnboardingLoader: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [startFade, setStartFade] = useState(false);

    useEffect(() => {
        // Duration of the onboarding animation
        const timer = setTimeout(() => {
            setStartFade(true);
            setTimeout(() => {
                setIsVisible(false);
            }, 1000); // Wait for fade out animation
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-all duration-1000 cubic-bezier(0.19, 1, 0.22, 1) ${startFade ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>
            {/* Background elements for depth */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative flex flex-col items-center">
                {/* Logo with sophisticated animation */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-125 animate-logo-glow"></div>
                    <img
                        src={logo}
                        alt="Eclair Travel Logo"
                        width={176}
                        height={176}
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                        className="w-32 h-32 md:w-44 md:h-44 object-contain relative z-10 animate-float"
                    />
                </div>

                {/* Brand Identity */}
                <div className="mt-10 text-center relative px-6">
                    <div className="overflow-hidden">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter animate-reveal-text flex items-center gap-3">
                            Eclair <span className="text-primary italic">Travel</span>
                        </h1>
                    </div>

                    <div className="w-full max-w-[200px] h-[3px] bg-slate-100 mx-auto mt-4 relative overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-400 w-full origin-left animate-loading-bar"></div>
                    </div>

                    <p className="mt-6 text-slate-400 text-[10px] md:text-xs font-black uppercase 0.4em] animate-fade-in-up">
                        Voyagez avec élégance
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes logo-glow {
                    0%, 100% { transform: scale(1.2); opacity: 0.5; }
                    50% { transform: scale(1.5); opacity: 0.8; }
                }
                .animate-logo-glow {
                    animation: logo-glow 3s infinite ease-in-out;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                }
                .animate-float {
                    animation: float 4s infinite ease-in-out;
                }
                @keyframes reveal-text {
                    from { transform: translateY(110%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-reveal-text {
                    animation: reveal-text 1.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
                    animation-delay: 0.4s;
                    opacity: 0;
                }
                @keyframes loading-bar {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
                .animate-loading-bar {
                    animation: loading-bar 2.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out forwards;
                    animation-delay: 1.2s;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
};

export default OnboardingLoader;
