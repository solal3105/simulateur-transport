import type { IdVille } from './villes'

/**
 * Le nom court de chaque réseau, celui de sa ville principale, pour les sélecteurs où le nom du réseau
 * serait trop long : le nom du réseau reste dans les titres juste à côté.
 */
export const NOM_COURT: Record<IdVille, string> = { lyon: 'Lyon', toulouse: 'Toulouse', marseille: 'Marseille', nice: 'Nice', idf: 'Paris' }
