
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WinnerDisplayProps {
    winners: string[];
    currentWinner: string | null;
    isRolling: boolean;
    participants: string[];
}

const SlotMachine: React.FC<{ participants: string[] }> = ({ participants }) => {
    const [displayText, setDisplayText] = React.useState("...");

    React.useEffect(() => {
        // Fast cycle
        const interval = setInterval(() => {
            if (participants.length > 0) {
                // Pick random from pool
                const randomName = participants[Math.floor(Math.random() * participants.length)];
                setDisplayText(randomName);
            } else {
                // Fallback if no participants (shouldn't happen in logic but safe to handle)
                setDisplayText(Math.floor(Math.random() * 999999).toString(16));
            }
        }, 50); // 50ms update rate

        return () => clearInterval(interval);
    }, [participants]);

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm">
            <div className="w-full h-0.5 absolute top-1/2 left-0 bg-blue-500/30 z-0" />
            <span className="text-3xl font-bold text-blue-400/80 font-mono animate-pulse z-10 filter blur-[0.5px]">
                {displayText}
            </span>
        </div>
    );
};

export const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winners, currentWinner, isRolling, participants }) => {
    return (
        <Card className="w-full max-w-sm h-fit backdrop-blur-xl bg-slate-900/50 border-slate-700 shadow-2xl relative">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-200 flex items-center gap-2">
                    <span>🏆</span> Victory Ledger
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Current Winner Spotlight */}
                <div className="relative p-6 rounded-xl bg-gradient-to-br from-slate-950/80 to-slate-900/80 border border-slate-800 flex flex-col items-center justify-center min-h-[160px] text-center overflow-hidden">

                    {isRolling ? (
                        <SlotMachine participants={participants} />
                    ) : currentWinner ? (
                        <>
                            <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 relative z-10 animate-in zoom-in spin-in-6 duration-500">
                                {currentWinner}
                            </h2>
                            <p className="text-sm text-yellow-500/80 mt-2 font-mono">SELECTED</p>
                        </>
                    ) : (
                        <span className="text-slate-600 font-mono text-sm">Waiting for input...</span>
                    )}

                </div>

                {/* History List */}
                <div>
                    <h3 className="text-sm font-medium text-slate-400 mb-3 uppercase tracking-wider text-xs">History</h3>
                    <ScrollArea className="h-[200px] w-full rounded-md border border-slate-800 bg-slate-950/30 p-4">
                        {winners.length === 0 ? (
                            <div className="text-center text-slate-600 text-xs py-4">No records found</div>
                        ) : (
                            <ul className="space-y-2">
                                {winners.map((winner, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300 animate-in slide-in-from-left-2 fade-in duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                                        <span className="text-slate-600 font-mono text-xs">#{winners.length - i}</span>
                                        <span className="font-medium text-white">{winner}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
};
