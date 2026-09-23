// Copie de lib/regles.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import { enveloppe, reserve as reserveDuMandat } from './budget.ts'
import { MANDATS, PROJETS } from './catalogue.ts'
import type { Chantier, Leviers, LigneJoueur, Mandat, Mode, ModeLigne, Projet } from './types.ts'
import type { Ville } from './villes.ts'

/** Ce qu'un projet coûte et rapporte, une fois sa version et son option choisies. */
export interface Resolu {
  projet: Projet
  mode: Mode
  cout: number
  voyageurs: number
  duree: number
}

export function resoudre(projet: Projet, choix?: Pick<Chantier, 'varianteId' | 'option'>): Resolu {
  const variante = projet.variantes?.find((v) => v.id === choix?.varianteId) ?? projet.variantes?.[0]
  let cout = variante?.cout ?? projet.cout
  let duree = variante?.duree ?? projet.duree
  if (choix?.option && projet.option) {
    cout += projet.option.surcout
    duree = projet.option.duree
  }
  return { projet, mode: variante?.mode ?? projet.mode, cout, voyageurs: variante?.voyageurs ?? projet.voyageurs, duree }
}

// Leviers de financement, en millions d'euros par mandat.
export const RENDEMENT = { abonnements: 12, tickets: 8, versementMobilite: 28 }
export const LEVIERS_FIXES = {
  gratuiteTotale: -1925,
  gratuiteMoins25: -240,
  gratuiteJeunesAbonnes: -48,
  suppressionTarifSocial: 240,
  metroNuit: -24,
  tva: 96,
} as const

export const LEVIERS_NEUTRES: Leviers = {
  abonnements: 0,
  tickets: 0,
  versementMobilite: 0,
  gratuiteTotale: false,
  gratuiteMoins25: false,
  gratuiteJeunesAbonnes: false,
  suppressionTarifSocial: false,
  metroNuit: false,
  tva: false,
}

/** Ce que les leviers ajoutent ou retirent à l'enveloppe d'un mandat. */
export function effetLeviers(l: Leviers): number {
  let total = 0
  if (l.gratuiteTotale) total += LEVIERS_FIXES.gratuiteTotale
  else {
    // La gratuité totale rend sans objet les autres mesures tarifaires.
    if (l.gratuiteMoins25) total += LEVIERS_FIXES.gratuiteMoins25
    if (l.gratuiteJeunesAbonnes) total += LEVIERS_FIXES.gratuiteJeunesAbonnes
    if (l.suppressionTarifSocial) total += LEVIERS_FIXES.suppressionTarifSocial
    total += l.abonnements * RENDEMENT.abonnements + l.tickets * RENDEMENT.tickets
  }
  if (l.metroNuit) total += LEVIERS_FIXES.metroNuit
  if (l.tva) total += LEVIERS_FIXES.tva
  total += l.versementMobilite * RENDEMENT.versementMobilite
  return total
}

/** Part d'un coût payée sur un mandat donné. */
function part(cout: number, decision: { mandat: Mandat; etale: boolean }, mandat: Mandat): number {
  if (decision.etale) return decision.mandat === 1 ? cout / 2 : decision.mandat === mandat ? cout : 0
  return decision.mandat === mandat ? cout : 0
}

export interface Bilan {
  /** Tout l'investissement du mandat, hors projets décidés déjà sur la carte. */
  enveloppe: number
  leviers: number
  /** Argent non dépensé au premier mandat, qui passe au second. */
  reliquat: number
  /** Ce qui est réservé d'office aux bus et aux lignes existantes. */
  reserve: number
  /** Projets décidés pendant ce mandat. */
  projets: number
  /** Moitiés de projets étalés depuis le mandat précédent. */
  reports: number
  reste: number
}

/** Ce que les règles demandent à une ville : son budget, et si ses leviers de financement sont calculés. */
export type Budget = Pick<Ville, 'budget' | 'leviers'>

export function bilanMandat(
  mandat: Mandat,
  chantiers: Chantier[],
  lignes: LigneJoueur[],
  leviers: Record<Mandat, Leviers>,
  ville: Budget,
): Bilan {
  // Ce qui n'a pas été dépensé au premier mandat reste disponible au second.
  const reliquat = mandat === 2 ? Math.max(0, bilanMandat(1, chantiers, lignes, leviers, ville).reste) : 0
  let projets = 0
  let reports = 0
  const ajouter = (cout: number, d: { mandat: Mandat; etale: boolean }) => {
    const montant = part(cout, d, mandat)
    if (d.mandat === mandat) projets += montant
    else reports += montant
  }
  for (const c of chantiers) {
    const p = PROJETS.get(c.id)
    if (p) ajouter(resoudre(p, c).cout, c)
  }
  for (const l of lignes) ajouter(l.estimation.cout, l)
  // Là où les leviers ne sont pas calculés, ils ne changent rien au budget.
  const effet = ville.leviers ? effetLeviers(leviers[mandat]) : 0
  const total = enveloppe(ville.budget, mandat)
  const reserve = reserveDuMandat(ville.budget, mandat)
  const reste = total + effet + reliquat - reserve - projets - reports
  return {
    enveloppe: total,
    leviers: effet,
    reliquat,
    reserve,
    projets: Math.round(projets),
    reports: Math.round(reports),
    reste: Math.round(reste),
  }
}

/** Année d'ouverture : début du mandat où la décision est prise, plus la durée du chantier. */
export const ouverture = (mandat: Mandat, duree: number) => MANDATS[mandat].debut + duree

export interface Ouverture {
  id: string
  nom: string
  annee: number
  voyageurs: number
  joueur: boolean
  /** Pour retrouver la couleur de la ligne : sa version, ou le mode d'une ligne du joueur. */
  varianteId?: string
  modeLigne?: ModeLigne
}

export function ouvertures(chantiers: Chantier[], lignes: LigneJoueur[]): Ouverture[] {
  const liste: Ouverture[] = []
  for (const c of chantiers) {
    const p = PROJETS.get(c.id)
    if (!p) continue
    const r = resoudre(p, c)
    liste.push({
      id: p.id,
      nom: p.nom,
      annee: ouverture(c.mandat, r.duree),
      voyageurs: r.voyageurs,
      joueur: false,
      varianteId: c.varianteId,
    })
  }
  for (const l of lignes) {
    liste.push({
      id: l.id,
      nom: l.nom,
      annee: ouverture(l.mandat, l.estimation.duree),
      voyageurs: l.estimation.nouveaux,
      joueur: true,
      modeLigne: l.mode,
    })
  }
  return liste.sort((a, b) => a.annee - b.annee || b.voyageurs - a.voyageurs)
}

/** Le score : voyageurs gagnés par jour. Pour les lignes du joueur, seuls les nouveaux voyageurs comptent. */
export function score(chantiers: Chantier[], lignes: LigneJoueur[]): number {
  let total = 0
  for (const c of chantiers) {
    const p = PROJETS.get(c.id)
    if (p) total += resoudre(p, c).voyageurs
  }
  for (const l of lignes) total += l.estimation.nouveaux
  return total
}

/** Les chiffres qui résument un réseau, pour le bilan comme pour la comparaison de deux réseaux. */
export function resumer(chantiers: Chantier[], lignes: LigneJoueur[], leviers: Record<Mandat, Leviers>, ville: Budget) {
  const b1 = bilanMandat(1, chantiers, lignes, leviers, ville)
  const b2 = bilanMandat(2, chantiers, lignes, leviers, ville)
  const investi =
    chantiers.reduce((t, c) => {
      const p = PROJETS.get(c.id)
      return p ? t + resoudre(p, c).cout : t
    }, 0) + lignes.reduce((t, l) => t + l.estimation.cout, 0)
  return {
    voyageurs: score(chantiers, lignes),
    investi,
    equilibre: b1.reste >= 0 && b2.reste >= 0,
    nonDepense: Math.max(0, b2.reste),
    deficit: Math.min(0, b1.reste) + Math.min(0, b2.reste),
    /** Projets du catalogue qui ont un tracé, plus les lignes du joueur. */
    retenus: chantiers.filter((c) => PROJETS.get(c.id)?.trace).length + lignes.length,
  }
}

/** Totaux du catalogue, qui servent de repère au bilan. */
export function totauxCatalogue(projets: Iterable<Projet>) {
  let cout = 0
  let voyageurs = 0
  let meilleur = 0
  for (const p of projets) {
    const r = resoudre(p)
    cout += r.cout
    voyageurs += r.voyageurs
    if (r.cout > 0) meilleur = Math.max(meilleur, r.voyageurs / r.cout)
  }
  return { cout, voyageurs, meilleur }
}
