'use client'

import { useEffect } from 'react'

import { demarrerMesure } from '@/lib/mesure'

/** Démarre la mesure d'audience une fois la page affichée (lib/mesure.ts). */
export function Mesure() {
  useEffect(() => demarrerMesure(), [])
  return null
}
