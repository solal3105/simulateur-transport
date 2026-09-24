import { imageCommunaute, TAILLE, type Vitrine } from '@/lib/apercus'
import type { PartieCompacte } from '@/lib/partie'
import { estVille } from '@/lib/villes'

/**
 * L'image qui accompagne un lien vers les réseaux publiés : les trois plus soutenus en vitrine, et combien
 * il y en a en tout. Elle se refait toutes les dix minutes au plus.
 */
export const alt = 'Les réseaux de transport publiés par les joueurs du simulateur, les plus soutenus en vitrine'
export const size = TAILLE
export const contentType = 'image/png'
export const revalidate = 600

async function lire(): Promise<{ vitrine: Vitrine[]; total: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !cle) return { vitrine: [], total: 0 }
  try {
    const r = await fetch(
      `${url}/rest/v1/reseaux?select=titre,voyageurs,partie,ville&visibilite=eq.publique&order=soutiens.desc,voyageurs.desc&limit=3`,
      { headers: { apikey: cle, Prefer: 'count=exact' }, next: { revalidate } },
    )
    const lignes = (await r.json()) as { titre: string; voyageurs: number; partie: PartieCompacte; ville: string }[]
    const total = Number(r.headers.get('content-range')?.split('/')[1]) || lignes.length
    const vitrine = lignes.flatMap((l) =>
      estVille(l.ville) ? [{ ville: l.ville, titre: l.titre, voyageurs: l.voyageurs, partie: l.partie }] : [],
    )
    return { vitrine, total }
  } catch {
    return { vitrine: [], total: 0 }
  }
}

export default async function Image() {
  const { vitrine, total } = await lire()
  return imageCommunaute(vitrine, total)
}
