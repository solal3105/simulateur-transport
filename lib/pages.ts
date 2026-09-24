import type { Metadata, Viewport } from 'next'

import { libre } from './budget'
import { enLettres } from './format'
import { VILLES, type IdVille } from './villes'

/** Le titre, la description et l'aperçu de l'accueil d'un réseau, tirés de ses données. */
export function metadonnees(id: IdVille): Metadata {
  const ville = VILLES[id]
  const pourLignes = libre(ville.budget, 1) + libre(ville.budget, 2)
  const description = `Deux mandats pour construire le réseau ${ville.reseau} de 2038, avec ${enLettres(pourLignes)} d’euros pour de nouvelles lignes. Tracez vos lignes de tram, de bus ou de métro, et voyez combien de voyageurs elles gagnent.`
  return {
    title: ville.titrePage,
    description,
    openGraph: { title: ville.titrePage, description, locale: 'fr_FR' },
    twitter: { card: 'summary_large_image', title: ville.titrePage, description },
  }
}

/** La barre du navigateur prend la couleur du réseau sur téléphone. */
export const affichage = (id: IdVille): Viewport => ({
  width: 'device-width',
  initialScale: 1,
  themeColor: VILLES[id].couleurs.principale,
})

/** Le titre et la description de la page qui explique les calculs d'un réseau. */
export function metadonneesMethode(id: IdVille): Metadata {
  const ville = VILLES[id]
  const titre = `Comment nous calculons le budget et les voyageurs, ${ville.nom} | Simulateur transport`
  const description = `D’où vient le budget ${ville.territoire} dans le jeu, ce que rapportent les tarifs, et comment nous estimons les voyageurs d’une ligne, avec nos sources.`
  return {
    title: titre,
    description,
    openGraph: { title: titre, description, locale: 'fr_FR' },
    twitter: { card: 'summary_large_image', title: titre, description },
  }
}

/** Le titre et la description des réseaux publiés d'un réseau. */
export function metadonneesCommunaute(id: IdVille): Metadata {
  const ville = VILLES[id]
  const titre = `Les réseaux imaginés pour ${ville.nom} | Simulateur transport`
  const description = `Les réseaux de transport construits par les joueurs ${ville.ou}, avec le vrai budget ou en jeu libre : soutenez-les, comparez-les au vôtre, reprenez-les pour votre partie.`
  return {
    title: titre,
    description,
    openGraph: { title: titre, description, locale: 'fr_FR' },
    twitter: { card: 'summary_large_image', title: titre, description },
  }
}
