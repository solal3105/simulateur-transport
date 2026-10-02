import type { MetadataRoute } from 'next'

import { ID_VILLES, VILLES } from '@/lib/villes'

import { reseauxOuverts } from './reseau/[id]/apercu'

const SITE = 'https://tcl-2040.com'

// Le plan se recalcule toutes les heures, pour suivre les réseaux publiés qui gagnent leur premier soutien.
export const revalidate = 3600

/**
 * Le plan du site pour les moteurs de recherche : l'accueil, la méthode et les réseaux publiés de chaque ville, les
 * nouveautés, les mentions légales, et les réseaux publiés que nous ouvrons aux moteurs (voir ouvertAuxMoteurs). Les
 * parties partagées par lien n'y sont pas : leurs pages sont fermées aux moteurs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const adresse = (chemin: string) => `${SITE}/${chemin}`.replace(/\/$/, '')
  const villes = ID_VILLES.flatMap((id) => {
    const racine = VILLES[id].chemin
    const sous = (page: string) => (racine ? `${racine}/${page}` : page)
    return [
      { url: adresse(racine), priority: 1 },
      { url: adresse(sous('methode')), priority: 0.6 },
      { url: adresse(sous('communaute')), priority: 0.6 },
    ]
  })
  const reseaux = (await reseauxOuverts()).map((r) => ({ url: adresse(`reseau/${r.id}`), lastModified: r.cree_le, priority: 0.4 }))
  return [...villes, { url: adresse('nouveautes'), priority: 0.5 }, { url: adresse('mentions-legales'), priority: 0.1 }, ...reseaux]
}
