const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const decimal = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** 12345 → « 12 345 », avec l'espace fine insécable du français. */
export const n = (v: number) => nombre.format(Math.round(v))
export const km = (v: number) => decimal.format(v)
/** Arrondi à la centaine, pour les estimations qui ne méritent pas plus de précision. */
export const approx = (v: number) => nombre.format(Math.round(v / 100) * 100)
export const signe = (v: number) => (v > 0 ? `+${n(v)}` : v < 0 ? `-${n(-v)}` : '0')

/** « de Camille », mais « d’Inès » : la préposition devant un nom, avec l'élision du français. */
export const de = (nom: string) => (/^[aeiouyàâäéèêëîïôöûüœ]/i.test(nom) ? `d’${nom}` : `de ${nom}`)
