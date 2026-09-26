const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** 12345 → « 12 345 », avec l'espace fine insécable du français. */
export const n = (v: number) => nombre.format(Math.round(v))
export const km = (v: number) => decimal.format(v)
/** Arrondi à la centaine, pour les estimations qui ne méritent pas plus de précision. */
export const approx = (v: number) => nombre.format(Math.round(v / 100) * 100)
export const signe = (v: number) => (v > 0 ? `+${n(v)}` : v < 0 ? `-${n(-v)}` : '0')

const ORDINAUX = ['premier', 'second', 'troisième', 'quatrième', 'cinquième', 'sixième', 'septième', 'huitième', 'neuvième', 'dixième']
/** Le rang en toutes lettres jusqu'à dix, en chiffres au-delà : « premier », « troisième », « 12e ». */
export const ordinal = (rang: number) => ORDINAUX[rang - 1] ?? `${rang}e`

const NOMBRES = ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix']
/** Un petit nombre en toutes lettres jusqu'à dix, en chiffres au-delà : « trois mandats », « 12 mandats ». */
export const nombreEnLettres = (v: number) => NOMBRES[v - 1] ?? n(v)

/** « de Camille », mais « d’Inès » : la préposition devant un nom, avec l'élision du français. */
export const de = (nom: string) => (/^[aeiouyàâäéèêëîïôöûüœ]/i.test(nom) ? `d’${nom}` : `de ${nom}`)

/**
 * Un montant en millions d'euros, en toutes lettres : 850 donne « 850 millions », 4 000 « 4 milliards »,
 * 1 450 « 1,5 milliard ». Le pluriel de milliard commence à 2.
 */
export function enLettres(v: number) {
  if (v < 1000) return `${n(v)} millions`
  const x = Math.round(v / 100) / 10
  return `${x.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ${x >= 2 ? 'milliards' : 'milliard'}`
}
