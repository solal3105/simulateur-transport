import type { Source } from './budget'
import lyon from './fiches/lyon.json'
import type { IdVille } from './villes'

/**
 * L'histoire d'un projet réel du catalogue, rassemblée à partir de documents publics que nous avons lus : ses grandes
 * dates, ce qu'en ont dit les habitants pendant la concertation, et quelques articles de presse. Rien n'y est inventé :
 * chaque ligne renvoie à son document. Rangée à part du catalogue, que le serveur n'a pas besoin de connaître.
 */
export interface FicheProjet {
  /** Les grandes dates, « 2024-06 » ou « 2024 », chacune avec le document qui l'établit. */
  histoire: { date: string; texte: string; source: Source }[]
  /** Ce qu'en ont dit les habitants, résumé d'après le bilan de la concertation. */
  avis?: { texte: string; source: Source }
  /** Des articles de presse : leur titre, leur média, leur date et leur adresse, jamais leur texte. */
  presse?: { titre: string; media: string; date: string; url: string }[]
}

const FICHES: Partial<Record<IdVille, Record<string, FicheProjet>>> = { lyon }

/** La fiche d'un projet, quand nous l'avons rassemblée : pour l'instant à Lyon. */
export const ficheProjet = (ville: IdVille, id: string): FicheProjet | undefined => FICHES[ville]?.[id]
