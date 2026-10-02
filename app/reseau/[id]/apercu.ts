import type { PartieCompacte } from '@/lib/partie'

export interface Apercu {
  titre: string
  intention: string | null
  voyageurs: number
  investi: number
  partie: PartieCompacte
  auteur: { pseudo: string } | null
  visibilite: 'publique' | 'lien'
  soutiens: number
  masque: boolean
}

/**
 * Un réseau publié n'est proposé aux moteurs de recherche que s'il est public, non masqué, décrit par son auteur et
 * soutenu par au moins un joueur : Google juge aussi un site sur ses pages les plus faibles.
 */
export const ouvertAuxMoteurs = (r: Pick<Apercu, 'visibilite' | 'masque' | 'soutiens' | 'intention'>) =>
  r.visibilite === 'publique' && !r.masque && r.soutiens >= 1 && Boolean(r.intention?.trim())

const base = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  return url && cle ? { url, cle } : null
}

/** Ce qu'il faut d'un réseau publié pour le titre de sa page et son image d'aperçu. */
export async function lireApercu(id: string): Promise<Apercu | null> {
  const b = base()
  if (!b || !/^[0-9a-f-]{36}$/.test(id)) return null
  try {
    const r = await fetch(
      `${b.url}/rest/v1/reseaux?select=titre,intention,voyageurs,investi,partie,visibilite,soutiens,masque,auteur:profils(pseudo)&id=eq.${id}`,
      { headers: { apikey: b.cle }, next: { revalidate: 60 } },
    )
    const [reseau] = (await r.json()) as Apercu[]
    return reseau ?? null
  } catch {
    return null
  }
}

/** Les réseaux publiés que le plan du site donne aux moteurs de recherche, avec leur date de publication. */
export async function reseauxOuverts(): Promise<{ id: string; cree_le: string }[]> {
  const b = base()
  if (!b) return []
  try {
    const r = await fetch(
      `${b.url}/rest/v1/reseaux?select=id,intention,visibilite,soutiens,masque,cree_le&visibilite=eq.publique&masque=is.false&soutiens=gte.1`,
      { headers: { apikey: b.cle }, next: { revalidate: 3600 } },
    )
    const reseaux = (await r.json()) as (Pick<Apercu, 'visibilite' | 'masque' | 'soutiens' | 'intention'> & {
      id: string
      cree_le: string
    })[]
    return reseaux.filter(ouvertAuxMoteurs).map(({ id, cree_le }) => ({ id, cree_le }))
  } catch {
    return []
  }
}
