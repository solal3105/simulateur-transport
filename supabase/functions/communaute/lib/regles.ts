// Copie de lib/regles.ts, faite par scripts/fonction-communaute.mjs : ne pas modifier ici.
import { enveloppe, reserve as reserveDuMandat } from './budget.ts'
import { effetLeviers } from './leviers.ts'
import { debutMandat, MANDATS_DE_BASE, PROJETS } from './catalogue.ts'
import type { Chantier, Estimation, Leviers, LigneJoueur, Mandat, Mode, ModeLigne, Projet } from './types.ts'
import type { Ville } from './villes.ts'

/** Ce qu'un projet coûte et rapporte, une fois sa version et son option choisies. */
export interface Resolu {
  projet: Projet
  mode: Mode
  cout: number
  voyageurs: number
  duree: number
}

/**
 * L'inflation : 2 % par an, l'objectif de la Banque centrale européenne. Les montants du premier mandat sont ceux
 * d'aujourd'hui ; chaque mandat suivant les fait monter de six ans d'inflation, soit 12,6 %. Les coûts des projets et
 * des lignes, les enveloppes, la réserve, les leviers et l'argent reporté d'un mandat au suivant la suivent tous.
 */
export const INFLATION_ANNUELLE = 0.02

/** Ce que vaut, au mandat donné, un euro de 2026 : 1 au premier mandat, 1,126 au deuxième, 1,268 au troisième. */
export const prixDuMandat = (mandat: Mandat) => (1 + INFLATION_ANNUELLE) ** (debutMandat(mandat) - debutMandat(1))

/** Un montant en euros de 2026, aux prix du mandat donné, arrondi au million. */
export const auPrixDu = (montant: number, mandat: Mandat) => Math.round(montant * prixDuMandat(mandat))

/** Ce que coûte une ligne du joueur, aux prix du mandat où il l'a décidée. */
export const coutDeLigne = (l: Pick<LigneJoueur, 'estimation' | 'mandat'>) => auPrixDu(l.estimation.cout, l.mandat)

/** L'estimation d'une ligne aux prix d'un mandat : son coût et le détail de ce coût, le reste ne change pas. */
export function aPrixDu(e: Estimation, mandat: Mandat): Estimation {
  if (mandat <= 1) return e
  const d = e.detail
  return {
    ...e,
    cout: auPrixDu(e.cout, mandat),
    detail: d && {
      ...d,
      voie: auPrixDu(d.voie, mandat),
      stations: auPrixDu(d.stations, mandat),
      ouvrages: auPrixDu(d.ouvrages, mandat),
      ponts: auPrixDu(d.ponts, mandat),
      profondeur: auPrixDu(d.profondeur, mandat),
    },
  }
}

/**
 * Le coût, les voyageurs et la durée d'un projet, une fois sa version et son option choisies. Le coût est aux prix du
 * mandat de la décision quand le choix le dit (un chantier le dit toujours), sinon aux prix d'aujourd'hui.
 */
export function resoudre(projet: Projet, choix?: Pick<Chantier, 'varianteId' | 'option'> & { mandat?: Mandat }): Resolu {
  const variante = projet.variantes?.find((v) => v.id === choix?.varianteId) ?? projet.variantes?.[0]
  let cout = variante?.cout ?? projet.cout
  let duree = variante?.duree ?? projet.duree
  if (choix?.option && projet.option) {
    cout += projet.option.surcout
    duree = projet.option.duree
  }
  return {
    projet,
    mode: variante?.mode ?? projet.mode,
    cout: choix?.mandat ? auPrixDu(cout, choix.mandat) : cout,
    voyageurs: variante?.voyageurs ?? projet.voyageurs,
    duree,
  }
}

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

/** Part d'un coût payée sur un mandat donné : tout au mandat de la décision, ou moitié-moitié avec le suivant. */
function part(cout: number, decision: { mandat: Mandat; etale: boolean }, mandat: Mandat): number {
  if (decision.etale) return mandat === decision.mandat || mandat === decision.mandat + 1 ? cout / 2 : 0
  return decision.mandat === mandat ? cout : 0
}

/** Les leviers d'un mandat : ceux qu'on y a réglés, sinon ceux du dernier mandat qui en a, qui restent en place. */
export function leviersDu(leviers: Record<Mandat, Leviers>, mandat: Mandat): Leviers {
  for (let m = mandat; m >= 1; m -= 1) {
    const l = leviers[m]
    if (l) return l
  }
  return LEVIERS_NEUTRES
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

/** Ce que les règles demandent à un réseau : son budget, avec ses leviers de financement s'il en a. */
export type Budget = Pick<Ville, 'budget'>

/**
 * Le budget de chaque mandat, du premier au dernier : ce qui n'a pas été dépensé à un mandat reste disponible au
 * suivant, et un déficit n'est jamais reporté.
 */
export function bilansMandats(
  mandats: Mandat,
  chantiers: Chantier[],
  lignes: LigneJoueur[],
  leviers: Record<Mandat, Leviers>,
  ville: Budget,
): Bilan[] {
  const liste: Bilan[] = []
  for (let m = 1; m <= mandats; m += 1) {
    // Ce qui reste d'un mandat passe au suivant à sa valeur : il suit l'inflation comme le reste du budget.
    const reliquat = m > 1 ? Math.round(Math.max(0, liste.at(-1)!.reste) * (prixDuMandat(m) / prixDuMandat(m - 1))) : 0
    liste.push(bilanSeul(m, reliquat, chantiers, lignes, leviers, ville))
  }
  return liste
}

export function bilanMandat(
  mandat: Mandat,
  chantiers: Chantier[],
  lignes: LigneJoueur[],
  leviers: Record<Mandat, Leviers>,
  ville: Budget,
): Bilan {
  return bilansMandats(mandat, chantiers, lignes, leviers, ville).at(-1)!
}

/** Le budget d'un seul mandat, avec ce qui reste du précédent. */
function bilanSeul(
  mandat: Mandat,
  reliquat: number,
  chantiers: Chantier[],
  lignes: LigneJoueur[],
  leviers: Record<Mandat, Leviers>,
  ville: Budget,
): Bilan {
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
  for (const l of lignes) ajouter(coutDeLigne(l), l)
  // Là où les leviers ne sont pas calculés, ils ne changent rien au budget.
  const effet = ville.budget.leviers ? effetLeviers(leviersDu(leviers, mandat), ville.budget.leviers, prixDuMandat(mandat)) : 0
  const total = auPrixDu(enveloppe(ville.budget, mandat), mandat)
  const reserve = auPrixDu(reserveDuMandat(ville.budget, mandat), mandat)
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
export const ouverture = (mandat: Mandat, duree: number) => debutMandat(mandat) + duree

/**
 * Année d'ouverture d'un projet du catalogue : un prolongement n'ouvre pas avant la ligne qu'il prolonge. Le métro E
 * jusqu'à Part-Dieu, décidé au second mandat avec quatre ans de chantier, attend celui jusqu'à Bellecour (2040) au lieu
 * d'ouvrir seul en 2036.
 */
export function ouvertureProjet(p: Projet, mandat: Mandat, duree: number, chantiers: readonly Chantier[], vus = new Set<string>()): number {
  const propre = ouverture(mandat, duree)
  const requis = p.requiert ? chantiers.find((c) => c.id === p.requiert) : undefined
  const prolongee = requis ? PROJETS.get(requis.id) : undefined
  if (!requis || !prolongee || vus.has(prolongee.id)) return propre
  vus.add(p.id)
  return Math.max(propre, ouvertureProjet(prolongee, requis.mandat, resoudre(prolongee, requis).duree, chantiers, vus))
}

export interface Ouverture {
  id: string
  nom: string
  annee: number
  voyageurs: number
  joueur: boolean
  /** Pour retrouver la couleur de la ligne : sa version, ou le mode d'une ligne du joueur. */
  varianteId?: string
  modeLigne?: ModeLigne
  /** La couleur choisie par le joueur pour sa ligne. */
  couleur?: string
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
      annee: ouvertureProjet(p, c.mandat, r.duree, chantiers),
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
      couleur: l.couleur,
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

/**
 * Les chiffres qui résument un réseau, pour le bilan comme pour la comparaison de deux réseaux, sur tous les mandats
 * de la partie : deux dans la partie de base, davantage quand on l'a continuée.
 */
export function resumer(
  chantiers: Chantier[],
  lignes: LigneJoueur[],
  leviers: Record<Mandat, Leviers>,
  ville: Budget,
  mandats: Mandat = MANDATS_DE_BASE,
) {
  const bilans = bilansMandats(Math.max(MANDATS_DE_BASE, mandats), chantiers, lignes, leviers, ville)
  const investi =
    chantiers.reduce((t, c) => {
      const p = PROJETS.get(c.id)
      return p ? t + resoudre(p, c).cout : t
    }, 0) + lignes.reduce((t, l) => t + coutDeLigne(l), 0)
  return {
    voyageurs: score(chantiers, lignes),
    investi,
    equilibre: bilans.every((b) => b.reste >= 0),
    nonDepense: Math.max(0, bilans.at(-1)!.reste),
    deficit: bilans.reduce((t, b) => t + Math.min(0, b.reste), 0),
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
