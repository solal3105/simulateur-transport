import type { Metadata } from 'next'

import { ReseauPage } from '@/components/communaute/ReseauPage'

type Props = { params: Promise<{ id: string }> }

/** Le titre et la phrase d'un réseau publié, pour l'aperçu du lien sur les réseaux sociaux. */
async function lireApercu(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cle = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !cle || !/^[0-9a-f-]{36}$/.test(id)) return null
  try {
    const r = await fetch(`${url}/rest/v1/reseaux?select=titre,intention,voyageurs,auteur:profils(pseudo)&id=eq.${id}`, {
      headers: { apikey: cle },
      next: { revalidate: 60 },
    })
    const [reseau] = (await r.json()) as { titre: string; intention: string | null; voyageurs: number; auteur: { pseudo: string } | null }[]
    return reseau ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const reseau = await lireApercu(id)
  if (!reseau) return { title: 'Réseau introuvable | Simulateur TCL' }
  const titre = `${reseau.titre}, par ${reseau.auteur?.pseudo ?? 'un joueur'}`
  const voyageurs = reseau.voyageurs.toLocaleString('fr-FR')
  const description = reseau.intention ?? `Un réseau de transport pour Lyon en 2038, qui gagne ${voyageurs} voyageurs par jour.`
  return { title: `${titre} | Simulateur TCL`, description, openGraph: { title: titre, description } }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <ReseauPage id={id} />
}
