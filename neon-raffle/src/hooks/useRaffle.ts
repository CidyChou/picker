import { useState, useCallback, useEffect, useMemo } from 'react';

export interface RaffleState {
  participants: string[];
  winners: string[];
  isRolling: boolean;
  currentWinner: string | null;
}

export interface Segment {
  id: number;
  originalText: string;
  name: string;
  weight: number;
}

export const useRaffle = () => {
  // Load from localStorage on init
  const [participants, setParticipants] = useState<string[]>(() => {
    const saved = localStorage.getItem('neon-raffle-participants');
    return saved ? JSON.parse(saved) : [];
  });

  const [winners, setWinners] = useState<string[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(null);

  // Sync to localStorage whenever participants change
  useEffect(() => {
    localStorage.setItem('neon-raffle-participants', JSON.stringify(participants));
  }, [participants]);

  const addParticipant = useCallback((names: string) => {
    const newNames = names
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    setParticipants(newNames);
  }, []);

  const removeParticipant = useCallback((name: string) => {
    setParticipants(prev => prev.filter(p => p !== name));
  }, []);

  // Cheat/Rigging State
  const [nextWinnerOverride, setNextWinnerOverride] = useState<string | null>(null);
  const [winnerQueue, setWinnerQueue] = useState<string[]>([]);

  const reset = useCallback(() => {
    setParticipants([]);
    setWinners([]);
    setCurrentWinner(null);
    setIsRolling(false);
    setWinnerQueue([]);
    setNextWinnerOverride(null);
  }, []);

  // Parse segments
  const segments = useMemo(() => {
    return participants.map((p, i) => {
      const match = p.match(/^(.*?)\s*[\*x]\s*(\d+)$/i);
      let name = p;
      let weight = 1;

      if (match) {
        name = match[1];
        weight = parseInt(match[2], 10) || 1;
      }

      return {
        id: i,
        originalText: p,
        name: name,
        weight: weight
      };
    });
  }, [participants]);

  const decideWinner = useCallback((): string | null => {
    if (segments.length === 0) return null;

    setIsRolling(true);
    setCurrentWinner(null);

    // 1. Check Queue
    if (winnerQueue.length > 0) {
      const nextInQueue = winnerQueue[0];
      // Try to find segment by name OR full text (fixes weighted items bug)
      const queuedSeg = segments.find(s => s.name === nextInQueue || s.originalText === nextInQueue);

      // Update queue regardless to avoid infinite loop of one bad item
      // User intent: "Must be this order". If item is missing, we skip it.
      setWinnerQueue(prev => prev.slice(1));

      if (queuedSeg) {
        return queuedSeg.name;
      }
      // If not found, fall through to next logic
    }

    // 2. Check Single Override
    if (nextWinnerOverride) {
      const overrideSeg = segments.find(s => s.name === nextWinnerOverride);
      if (overrideSeg) {
        setNextWinnerOverride(null);
        return overrideSeg.name;
      }
    }

    // 3. Weighted Random
    const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
    let randomVal = Math.random() * totalWeight;

    for (const segment of segments) {
      randomVal -= segment.weight;
      if (randomVal <= 0) {
        return segment.name;
      }
    }

    return segments[segments.length - 1].name;
  }, [segments, nextWinnerOverride, winnerQueue]);

  const finalizeWinner = useCallback((winner: string) => {
    setIsRolling(false);
    setCurrentWinner(winner);
    setWinners(prev => [winner, ...prev]);
  }, []);

  const loadWinnerQueue = useCallback((names: string[]) => {
    setWinnerQueue(names);
  }, []);

  const drawWinner = useCallback(() => {
    const winner = decideWinner();
    if (winner) {
      setTimeout(() => finalizeWinner(winner), 3000);
    }
  }, [decideWinner, finalizeWinner]);

  return {
    participants,
    winners,
    isRolling,
    currentWinner,
    addParticipant,
    removeParticipant,
    drawWinner,
    decideWinner,
    finalizeWinner,
    setNextWinnerOverride,
    reset,
    segments,
    winnerQueue,
    loadWinnerQueue
  };
};
