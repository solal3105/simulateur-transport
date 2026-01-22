'use client'

import { useGameStore } from '@/lib/gameStore'
import { IntroScreen } from '@/components/game/IntroScreen'
import { ResultsScreen } from '@/components/game/ResultsScreen'
import { MapSimulator } from '@/components/map'

export default function GamePage() {
  const { phase } = useGameStore()

  return (
    <>
      {phase === 'intro' && <IntroScreen />}
      {phase === 'playing' && <MapSimulator />}
      {phase === 'results' && <ResultsScreen />}
    </>
  )
}
