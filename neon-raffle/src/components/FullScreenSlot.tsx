
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface FullScreenSlotProps {
    participants: string[];
    winners: string[];
    isRolling: boolean;
    currentWinner: string | null;
    onDraw: () => void;
    onConfig: () => void;
}

export const FullScreenSlot: React.FC<FullScreenSlotProps> = ({
    participants,
    winners,
    isRolling,
    currentWinner,
    onDraw,
    onConfig
}) => {
    const [displayText, setDisplayText] = useState("READY");
    const [showButton, setShowButton] = useState(true);

    // Sync isRolling to show/hide button
    useEffect(() => {
        if (isRolling) {
            setShowButton(false);
        } else if (currentWinner) {
            // Keep hidden for a moment or show celebration?
            // When winner is shown, button remains hidden until user clicks to reset or maybe we show "Again?"
            // For now, allow quick re-roll after 3s
            const t = setTimeout(() => setShowButton(true), 1000);
            return () => clearTimeout(t);
        } else {
            setShowButton(true);
        }
    }, [isRolling, currentWinner]);

    // Rolling Animation Logic
    useEffect(() => {
        let interval: any;
        if (isRolling && participants.length > 0) {
            interval = setInterval(() => {
                const randomName = participants[Math.floor(Math.random() * participants.length)];
                setDisplayText(randomName);
            }, 50);
        } else if (currentWinner) {
            setDisplayText(currentWinner);
        } else {
            // Idle state
            setDisplayText("READY");
        }
        return () => clearInterval(interval);
    }, [isRolling, participants, currentWinner]);


    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
            {/* Pointer events allowed only on interactive elements */}

            {/* Gear Icon (Always accessible) */}
            <div className="absolute top-6 right-6 pointer-events-auto z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-white hover:bg-white/10"
                    onClick={onConfig}
                >
                    <SettingsIcon className="w-6 h-6" />
                </Button>
            </div>

            {/* Main Text Display */}
            <div className="relative w-full text-center px-4">
                <h1 className={`font-black tracking-tighter transition-all duration-300
             ${isRolling ? 'text-8xl md:text-9xl blur-sm scale-110 animate-pulse text-blue-400' : ''}
             ${currentWinner ? 'text-7xl md:text-9xl scale-125 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-300 animate-[pulse_2s_infinite]' : 'text-6xl text-slate-700/50'}
          `}>
                    {displayText}
                </h1>

                {currentWinner && !isRolling && (
                    <div className="absolute -inset-10 bg-blue-500/10 blur-3xl -z-10 animate-pulse" />
                )}
            </div>

            {/* Start Button */}
            <div className={`mt-20 flex flex-col items-center gap-4 transition-all duration-500 pointer-events-auto ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'}`}>
                <Button
                    size="lg"
                    className="h-24 px-12 text-3xl font-black rounded-full shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:shadow-[0_0_80px_rgba(59,130,246,0.8)] bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-110 transition-all border-4 border-blue-400/30"
                    onClick={onDraw}
                    disabled={participants.length === 0}
                >
                    {participants.length === 0 ? "ADD NAMES" : "START"}
                </Button>

                {winners.length > 0 && (
                    <p className="text-slate-500 font-mono text-sm">
                        Session Winners: {winners.length}
                    </p>
                )}
            </div>
        </div>
    );
};

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2-.3l-.15-.15a2 2 0 0 0-2.26.33l-.3.3a2 2 0 0 0 .33 2.26l.15.15a2 2 0 0 1 .3 2l-.25.43a2 2 0 0 1-1.73 1H2a2 2 0 0 0-2 2v.45l.03.05a2 2 0 0 0 .58-.45h.02a2 2 0 0 1 2-2 2 2 0 0 0 2-2 2 2 0 0 0-.58-1.75l-.3-.3a2 2 0 0 1 0-2.83l.3-.3a2 2 0 0 1 2.83 0l.3.3a2 2 0 0 0 1.75.58h.02a2 2 0 0 0 .6-1.55L9.67 2h2.55zm0 0h.44a2 2 0 0 1 2 2v.18a2 2 0 0 0 1 1.73l.43.25a2 2 0 0 0 2-.3l.15-.15a2 2 0 0 1 2.26.33l.3.3a2 2 0 0 1-.33 2.26l-.15.15a2 2 0 0 0-.3 2l.25.43a2 2 0 0 0 1.73 1H22a2 2 0 0 1 2 2v.45l-.03.05a2 2 0 0 1-.58-.45h-.02a2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 1 .58-1.75l.3-.3a2 2 0 0 0 0-2.83l-.3-.3a2 2 0 0 0-2.83 0l-.3.3a2 2 0 0 1-1.75.58h-.02a2 2 0 0 1-.6-1.55L14.78 2h-2.56z" />
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}
