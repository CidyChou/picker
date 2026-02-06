import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";

interface RaffleInputProps {
    onDraw: () => void;
    onUpdateParticipants: (names: string) => void;
    participantCount: number;
    isRolling: boolean;
    participants: string[];
    onSetNextWinner: (name: string | null) => void;
    onLoadWinnerQueue: (names: string[]) => void;
    winnerQueue: string[];
}

export const RaffleInput: React.FC<RaffleInputProps> = ({
    onDraw,
    onUpdateParticipants,
    participantCount,
    isRolling,
    participants,
    onSetNextWinner,
    onLoadWinnerQueue,
    winnerQueue
}) => {
    // Initialize with current participants joined by newline
    const [input, setInput] = useState(participants.join('\n'));
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Cheat Console State
    const [routeInput, setRouteInput] = useState("");
    const [parsedRoutes, setParsedRoutes] = useState<{ label: string, ids: number[] }[]>([]);

    // Update local state when props change
    React.useEffect(() => {
        setInput(participants.join('\n'));
    }, [participants]);

    // Load saved routes on mount
    React.useEffect(() => {
        const savedRoutes = localStorage.getItem('neon-raffle-routes');
        if (savedRoutes) {
            setRouteInput(savedRoutes);
            parseRoutes(savedRoutes);
        }
    }, []);

    const handleUpdate = () => {
        onUpdateParticipants(input);
    };

    const parseRoutes = (text: string) => {
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const routes = lines.map(line => {
            // Check for label
            let label = "Route";
            let numsPart = line;
            if (line.includes(':')) {
                const parts = line.split(':');
                label = parts[0].trim();
                numsPart = parts[1];
            }

            // Extract numbers (1, 2, 3...)
            const ids = (numsPart.match(/\d+/g) || []).map(Number);
            return { label, ids };
        });
        setParsedRoutes(routes);
    };

    const handleRouteInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setRouteInput(val);
        parseRoutes(val);
        // Persist to local storage
        localStorage.setItem('neon-raffle-routes', val);
    };

    const loadRoute = (route: { label: string, ids: number[] }) => {
        // Map 1-based IDs to names
        // ID 1 => Index 0
        const queue: string[] = [];
        const missingIds: number[] = [];

        route.ids.forEach(id => {
            const index = id - 1;
            if (index >= 0 && index < participants.length) {
                queue.push(participants[index]);
            } else {
                missingIds.push(id);
            }
        });

        if (missingIds.length > 0) {
            toast.error(`Invalid IDs in route: ${missingIds.join(', ')}`);
            return;
        }

        if (queue.length === 0) {
            toast.error("No valid participants found for this route.");
            return;
        }

        onLoadWinnerQueue(queue);
        toast.success(`Loaded Route "${route.label}" with ${queue.length} winners!`);
    };

    return (
        <Card className="w-full max-w-md backdrop-blur-xl bg-slate-900/50 border-slate-700 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50 group-hover:opacity-70 transition-opacity pointer-events-none" />

            <CardHeader>
                <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Neural Raffle
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Edit names below (one per line). Auto-saved.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Textarea
                        placeholder="Alice * 10&#10;Bob * 1&#10;Charlie... (Name * Weight)"
                        className="min-h-[200px] bg-slate-950/50 border-slate-700 text-slate-200 focus:border-blue-500 focus:ring-blue-500/20 font-mono text-sm leading-relaxed"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isRolling}
                    />
                    <Button
                        variant="secondary"
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        onClick={handleUpdate}
                        disabled={isRolling}
                    >
                        Save & Update Pool
                    </Button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/30 border border-slate-800">
                    <span className="text-sm text-slate-400">Pool Size</span>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-400 font-mono text-lg">
                        {participantCount}
                    </Badge>
                </div>

                {/* Cheat / Advanced Section */}
                <div className="pt-2">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs text-slate-600 hover:text-slate-400 w-full text-center pb-2"
                    >
                        {showAdvanced ? "Hide Advanced" : "Advanced Settings"}
                    </button>

                    {showAdvanced && (
                        <div className="space-y-4 animate-in slide-in-from-top-2">
                            {/* Rigging Console (Routes) */}
                            <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg space-y-3">
                                <label className="text-xs text-amber-500 font-bold block uppercase tracking-wider">
                                    🎯 Select Rigged Player
                                </label>

                                <select
                                    className="w-full bg-slate-900 text-slate-200 border border-slate-700 rounded p-2 text-sm focus:ring-2 focus:ring-amber-500/50 outline-none"
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val === -1) {
                                            onLoadWinnerQueue([]);
                                            toast.info("Switched to Fair Mode (Random)");
                                        } else {
                                            const route = parsedRoutes[val];
                                            if (route) loadRoute(route);
                                        }
                                    }}
                                    value={winnerQueue.length > 0 ? undefined : -1} // Fallback to -1 if no queue, or controlled if logic needs improvement
                                >
                                    <option value={-1}>-- None (Fair Mode) --</option>
                                    {parsedRoutes.map((route, idx) => (
                                        <option key={idx} value={idx}>
                                            {route.label} ({route.ids.length} steps)
                                        </option>
                                    ))}
                                </select>

                                <div className="pt-2 border-t border-slate-800/50">
                                    <label className="text-[10px] text-slate-500 font-bold block uppercase mb-1">
                                        ⚙️ Configure Routes
                                    </label>
                                    <p className="text-[10px] text-slate-500 mb-1">
                                        Format: "Label: 1 2 3" (IDs are 1-based line numbers)
                                    </p>
                                    <Textarea
                                        placeholder="Player A: 2, 3, 4, 1&#10;Player B: 5, 4, 3"
                                        className="bg-slate-900/50 border-slate-700 text-xs font-mono h-24 text-slate-400 focus:text-slate-200 transition-colors"
                                        value={routeInput}
                                        onChange={handleRouteInputChange}
                                    />
                                    {winnerQueue.length > 0 && (
                                        <div className="mt-2 p-2 bg-amber-500/10 rounded border border-amber-500/20 text-center">
                                            <p className="text-[10px] text-amber-500/80 font-mono">
                                                Active Queue: {winnerQueue.length} remaining
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    size="lg"
                    className="w-full font-bold text-lg relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={onDraw}
                    disabled={participantCount === 0 || isRolling}
                >
                    {isRolling ? (
                        <span className="flex items-center gap-2">
                            <span className="animate-spin">⚡</span> Computing...
                        </span>
                    ) : (
                        "ENTER GAME MODE 🎮"
                    )}
                </Button>
            </CardContent>
        </Card>
    );
};
