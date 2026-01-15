'use client'

import { useGameStore } from '@/lib/gameStore'
import { IntroScreen } from '@/components/game/IntroScreen'
import { OnboardingScreen } from '@/components/game/OnboardingScreen'
import { ResultsScreen } from '@/components/game/ResultsScreen'
import { MapSimulator } from '@/components/map'

export default function GamePage() {
  const { phase } = useGameStore()

  return (
    <>
      {phase === 'intro' && <IntroScreen />}
      {phase === 'onboarding' && <OnboardingScreen />}
      {phase === 'playing' && <MapSimulator />}
      {phase === 'results' && <ResultsScreen />}
    </>
  )
}
