import type { PartieCompacte } from '@/lib/partie'

export interface Apercu {
  titre: string
  intention: string | null
  voyageurs: number
  investi: number
  partie: PartieCompacte
  auteur: { pseudo: string } | null
}

/** Ce qu'il faut d'un réseau publié pour le titre de sa page et son image d'aperçu. */
export async function lireApercu(id: string): Promise<Apercu | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !cle || !/^[0-9a-f-]{36}$/.test(id)) return null
  try {
    const r = await fetch(`${url}/rest/v1/reseaux?select=titre,intention,voyageurs,investi,partie,auteur:profils(pseudo)&id=eq.${id}`, {
      headers: { apikey: cle },
      next: { revalidate: 60 },
    })
    const [reseau] = (await r.json()) as Apercu[]
    return reseau ?? null
  } catch {
    return null
  }
}
