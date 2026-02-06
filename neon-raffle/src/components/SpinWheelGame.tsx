
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SpinWheel } from './SpinWheel';
import type { Segment } from '@/hooks/useRaffle'; // Import Segment type

interface SpinWheelGameProps {
    participants: string[];
    segments: Segment[];
    winners: string[];
    // Functions from useRaffle
    decideWinner: () => string | null;
    finalizeWinner: (winner: string) => void;
    onConfig: () => void;
}

export const SpinWheelGame: React.FC<SpinWheelGameProps> = ({
    participants,
    segments,
    decideWinner,
    finalizeWinner,
    onConfig
}) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [targetWinner, setTargetWinner] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Handle Spin Click
    const handleSpin = () => {
        if (isSpinning) return;
        const winner = decideWinner();
        if (winner) {
            setTargetWinner(winner);
            setIsSpinning(true);
            setShowResult(false);
        }
    };

    // Called by SpinWheel when animation finishes
    const handleSpinComplete = () => {
        if (targetWinner) {
            finalizeWinner(targetWinner);
            setShowResult(true);
        }
        setIsSpinning(false);
        // Keep targetWinner for display until next spin
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">

            {/* Gear Icon */}
            <div className="absolute top-6 right-6 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-white hover:bg-white/10"
                    onClick={onConfig}
                >
                    <SettingsIcon className="w-6 h-6" />
                </Button>
            </div>

            {/* Wheel Container - INCREASED SCALE */}
            <div className="relative transform scale-100 md:scale-125 transition-transform">
                <SpinWheel
                    segments={segments}
                    winner={targetWinner}
                    isSpinning={isSpinning}
                    onSpinComplete={handleSpinComplete}
                />

                {/* Center Spin Button (Overlaying the hub) */}
                {!isSpinning && !showResult && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <Button
                            className="w-24 h-24 rounded-full text-2xl font-black bg-gradient-to-br from-red-500 to-pink-600 hover:scale-110 transition-transform shadow-[0_0_30px_rgba(239,68,68,0.6)] border-4 border-white"
                            onClick={handleSpin}
                            disabled={participants.length === 0}
                        >
                            SPIN
                        </Button>
                    </div>
                )}
            </div>

            {/* Winner Modal / Overlay */}
            {showResult && targetWinner && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 animate-in fade-in duration-500" onClick={() => setShowResult(false)}>
                    <div className="bg-slate-900/90 border border-slate-700 p-12 rounded-2xl flex flex-col items-center gap-6 shadow-2xl scale-125 animate-in zoom-in-50 spin-in-2 duration-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />

                        <h2 className="text-3xl font-light text-slate-300 uppercase tracking-widest relative z-10">Winner</h2>
                        <h1 className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 relative z-10 drop-shadow-lg">
                            {targetWinner}
                        </h1>

                        <p className="text-slate-500 mt-4 relative z-10">Tap anywhere to close</p>
                    </div>

                    {/* Confetti should be handled by BackgroundCanvas based on shared state, or we can trigger it separately */}
                </div>
            )}

        </div>
    );
};

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2-.3l-.15-.15a2 2 0 0 0-2.26.33l-.3.3a2 2 0 0 0 .33 2.26l.15.15a2 2 0 0 1 .3 2l-.25.43a2 2 0 0 1-1.73 1H2a2 2 0 0 0-2 2v.45l.03.05a2 2 0 0 0 .58-.45h.02a2 2 0 0 1 2-2 2 2 0 0 0 2-2 2 2 0 0 0-.58-1.75l-.3-.3a2 2 0 0 1 0-2.83l.3-.3a2 2 0 0 1 2.83 0l.3.3a2 2 0 0 0 1.75.58h.02a2 2 0 0 0 .6-1.55L9.67 2h2.55zm0 0h.44a2 2 0 0 1 2 2v.18a2 2 0 0 0 1 1.73l.43.25a2 2 0 0 0 2-.3l.15-.15a2 2 0 0 1 2.26.33l.3.3a2 2 0 0 1-.33 2.26l-.15.15a2 2 0 0 0-.3 2l.25.43a2 2 0 0 0 1.73 1H22a2 2 0 0 1 2 2v.45l-.03.05a2 2 0 0 1-.58-.45h-.02a2 2 0 0 0-2-2 2 2 0 0 1-2-2 2 2 0 0 1 .58-1.75l.3-.3a2 2 0 0 0 0-2.83l-.3-.3a2 2 0 0 0-2.83 0l-.3.3a2 2 0 0 1-1.75.58h-.02a2 2 0 0 1-.6-1.55L14.78 2h-2.56z" /><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
    );
}
