'use client'

import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

/** Un nombre qui défile jusqu'à sa nouvelle valeur au lieu de sauter. */
export function useCompteur(valeur: number, duree = 0.7, depart?: number) {
  const [affiche, setAffiche] = useState(depart ?? valeur)
  const precedent = useRef(depart ?? valeur)
  const reduit = useReducedMotion()
  useEffect(() => {
    // Avec les animations réduites, la valeur change en un instant.
    const controle = animate(precedent.current, valeur, {
      duration: reduit ? 0.001 : duree,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => setAffiche(v),
    })
    precedent.current = valeur
    return () => controle.stop()
  }, [valeur, duree, reduit])
  return affiche
}

/** Entrée en cascade des éléments d'un écran. */
export const cascade = {
  parent: { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } },
  enfant: {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 26 } },
  },
}

/** Fait défiler les années d'une date à une autre ; relancer() repart du début. */
export function useDefilement(debut: number, fin: number, duree: number) {
  const [annee, setAnnee] = useState(debut)
  const [tour, setTour] = useState(0)
  const reduit = useReducedMotion()
  useEffect(() => {
    const controle = animate(debut, fin, {
      duration: reduit ? 0.001 : duree,
      ease: 'linear',
      delay: reduit ? 0 : 0.5,
      onUpdate: (v) => setAnnee(Math.floor(v)),
    })
    return () => controle.stop()
  }, [debut, fin, duree, tour, reduit])
  return { annee, termine: annee >= fin, relancer: () => setTour((t) => t + 1) }
}
