import { metadonnees } from '@/lib/pages'
import { MARQUE, VILLES, type IdVille } from '@/lib/villes'

const SITE = 'https://tcl-2040.com'

/**
 * La description du jeu lisible par les moteurs de recherche (schema.org), sur l'accueil de chaque réseau. L'accueil
 * lyonnais, à la racine, décrit aussi le site lui-même et le nom sous lequel on le connaît. Aucun éditeur n'est nommé :
 * les mentions légales le gardent anonyme.
 */
export function DonneesStructurees({ ville }: { ville: IdVille }) {
  const v = VILLES[ville]
  const url = v.chemin ? `${SITE}/${v.chemin}` : SITE
  const jeu = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: v.titrePage.split(' : ')[0],
    description: metadonnees(ville).description,
    url,
    inLanguage: 'fr',
    genre: ['Simulation', 'Stratégie'],
    gamePlatform: 'Navigateur web',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Tous',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }
  const site = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: MARQUE,
    alternateName: 'TCL 2040',
    url: `${SITE}/`,
    inLanguage: 'fr',
  }
  const donnees = ville === 'lyon' ? [site, jeu] : [jeu]
  // Le texte est échappé pour qu'un « < » dans une description ne puisse pas fermer la balise.
  const json = JSON.stringify(donnees).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
