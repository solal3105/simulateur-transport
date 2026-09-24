import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * Vérifie le mot de passe de l'accès anticipé. Le mot de passe n'est écrit nulle part dans le code : on
 * ne garde que son empreinte SHA-256, calculée sans majuscules ni espaces pour qu'une faute de frappe
 * ordinaire ne bloque personne. C'est une barrière pour les visiteurs, pas une protection forte : le jeu
 * tourne dans le navigateur, et qui lit son code peut le lancer sans passer par ici.
 */
const EMPREINTE = Buffer.from('d03bcf6606a0a56843373da2614a8a70df9e221a3de9bd2f93d091d41f16e46c', 'hex')

export async function POST(requete: Request) {
  let mot = ''
  try {
    const corps = (await requete.json()) as { motDePasse?: unknown }
    if (typeof corps.motDePasse === 'string') mot = corps.motDePasse.toLowerCase().replace(/\s+/g, '').slice(0, 100)
  } catch {
    // Un corps illisible vaut un mauvais mot de passe.
  }
  const ok = timingSafeEqual(createHash('sha256').update(mot).digest(), EMPREINTE)
  return Response.json({ ok }, { status: ok ? 200 : 401 })
}
