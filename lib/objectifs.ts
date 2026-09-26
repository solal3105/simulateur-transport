import { CATALOGUES, PROJETS } from './catalogue'
import { n } from './format'
import { leviersDu, resoudre, resumer } from './regles'
import type { Chantier, Leviers, LigneJoueur, Mandat } from './types'
import type { Ville } from './villes'

/**
 * Les objectifs d'une partie : ils ne s'imposent jamais au départ, ils se consultent dans le menu et se découvrent au
 * bilan. Chacun se compare à quelque chose de réel, jamais à un seuil que nous aurions choisi. Le jeu libre n'en a pas :
 * sans budget à tenir, il n'y a rien à comparer.
 */
export interface Objectif {
  id: 'plan' | 'tarifs'
  titre: string
  atteint: boolean
  /** Le chiffre qui le mesure, en une phrase. */
  mesure: string
}

interface Partie {
  chantiers: Chantier[]
  lignes: LigneJoueur[]
  leviers: Record<Mandat, Leviers>
  mandats: number
  libre: boolean
}

/** Le programme réel du réseau, chiffré comme les projets du catalogue : ses voyageurs et son coût. */
export function planReel(ville: Ville) {
  const plan = CATALOGUES[ville.id].planReel
  if (!plan?.projets.length) return null
  const projets = plan.projets.flatMap((id) => {
    const p = PROJETS.get(id)
    return p ? [resoudre(p)] : []
  })
  return {
    nom: plan.nom,
    sources: plan.sources,
    voyageurs: projets.reduce((t, r) => t + r.voyageurs, 0),
    cout: projets.reduce((t, r) => t + r.cout, 0),
    nombre: projets.length,
  }
}

export function objectifs(p: Partie, ville: Ville): Objectif[] {
  if (p.libre) return []
  const r = resumer(p.chantiers, p.lignes, p.leviers, ville, p.mandats)
  const liste: Objectif[] = []

  const plan = planReel(ville)
  if (plan) {
    liste.push({
      id: 'plan',
      titre: 'Faire mieux que le plan réel',
      atteint: r.equilibre && r.voyageurs > plan.voyageurs,
      mesure: `+${n(r.voyageurs)} voyageurs par jour, contre +${n(plan.voyageurs)} pour ${plan.nom}, qui coûte ${n(plan.cout)} M€.${
        r.equilibre ? '' : ' Il faut aussi tenir le budget.'
      }`,
    })
  }

  // Sans leviers de financement, les tarifs ne bougent pas : l'objectif n'aurait pas de sens.
  if (ville.budget.leviers) {
    const hausses = Array.from({ length: Math.max(2, p.mandats) }, (_, i) => leviersDu(p.leviers, i + 1)).flatMap((l, i) =>
      l.tickets > 0 || l.abonnements > 0 ? [i + 1] : [],
    )
    liste.push({
      id: 'tarifs',
      titre: 'Tenir le budget sans augmenter les tarifs',
      atteint: r.equilibre && hausses.length === 0,
      mesure: hausses.length
        ? `Le ticket ou l’abonnement augmente ${hausses.length > 1 ? `aux mandats ${hausses.join(' et ')}` : `au mandat ${hausses[0]}`}.`
        : r.equilibre
          ? 'Ni le ticket ni l’abonnement n’augmentent, et le budget est tenu.'
          : 'Les tarifs ne bougent pas, mais le budget n’est pas tenu.',
    })
  }
  return liste
}
