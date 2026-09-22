/**
 * La palette, en valeurs littérales.
 *
 * Les jetons de `app/globals.css` sont la source pour tout ce que le navigateur
 * peint. Deux surfaces ne savent pas lire une variable CSS : les expressions de
 * style de MapLibre et le canevas de la carte de partage. Elles lisent donc
 * cette table, qui doit rester identique aux jetons du même nom.
 */
export const PALETTE = {
  signal: '#a3d900',
  ink: '#0b0e07',
  inkLift: '#171c10',
  plate: '#060803',
  chalk: '#f2f5ea',
  chalkDim: '#99a489',
  olive: '#3e4d0b',
  alert: '#ff5a1f',
} as const

/** Couleurs propres au plan, qui n'existent pas ailleurs dans l'interface. */
export const PLAN_PALETTE = {
  /** Un tracé étudié mais non retenu. */
  study: '#76856a',
  /** Le sol du fond de carte, dont part toute la rampe. */
  ground: [10, 14, 7],
  /** Le haut de la rampe : la trame viaire, présente sans dominer. */
  rampTop: [78, 92, 66],
  water: [18, 36, 30],
  greenspace: [17, 25, 10],
  label: '#8a9578',
  labelHalo: '#060803',
} as const
