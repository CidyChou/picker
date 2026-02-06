import React from 'react';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { RaffleInput } from './components/RaffleInput';

import { SpinWheelGame } from './components/SpinWheelGame';
import { useRaffle } from './hooks/useRaffle';
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button";

function App() {
  const {
    participants,
    winners,
    isRolling,
    currentWinner,
    addParticipant,
    drawWinner,
    decideWinner,
    finalizeWinner,
    setNextWinnerOverride,
    segments,
    winnerQueue,
    loadWinnerQueue
  } = useRaffle();

  // 'config' or 'play'
  const [mode, setMode] = React.useState<'config' | 'play'>(participants.length > 0 ? 'play' : 'config');

  return (
    <div className="relative min-h-screen w-full overflow-y-auto text-slate-200">
      <BackgroundCanvas isRolling={isRolling} winner={currentWinner} />

      {mode === 'play' ? (
        <SpinWheelGame
          participants={participants}
          segments={segments}
          winners={winners}
          decideWinner={decideWinner}
          finalizeWinner={finalizeWinner}
          onConfig={() => setMode('config')}
        />
      ) : (
        <main className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center pt-20">
          <div className="w-full max-w-md flex flex-col gap-6 animate-in zoom-in-95 duration-500">
            <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Raffle Config
            </h1>

            <RaffleInput
              onDraw={() => setMode('play')} // Just switch to play, not draw
              onUpdateParticipants={addParticipant}
              participantCount={participants.length}
              isRolling={isRolling}
              participants={participants}
              onSetNextWinner={setNextWinnerOverride}
              onLoadWinnerQueue={loadWinnerQueue}
              winnerQueue={winnerQueue}
            />
          </div>
        </main>
      )}

      <Toaster position="bottom-center" theme="dark" />
    </div>
  );
}

export default App;
