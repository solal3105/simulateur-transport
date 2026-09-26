'use client'

import { useMemo, useSyncExternalStore } from 'react'

import type { PartieCompacte } from './partie'
import type { IdVille } from './villes'

/**
 * La communauté : lire les réseaux publiés, et demander à la fonction serveur de publier, soutenir,
 * reprendre, signaler ou retirer. Pas de compte : ce navigateur tire une clé secrète au hasard et la
 * garde ; la base n'en conserve qu'une empreinte.
 */

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const CLE_PUBLIQUE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

/** Sans ces deux réglages, la communauté est absente et le jeu fonctionne comme avant. */
export const communauteActive = Boolean(URL_BASE && CLE_PUBLIQUE)

export type Tri = 'populaires' | 'recents'
export type Motif = 'propos' | 'triche' | 'autre'

export interface Profil {
  id: string
  pseudo: string
}

export interface ReseauPublie {
  id: string
  titre: string
  intention: string | null
  visibilite: 'publique' | 'lien'
  partie: PartieCompacte
  /** Fait en jeu libre, sans budget à tenir : listé à part et marqué comme tel. */
  libre: boolean
  voyageurs: number
  investi: number
  retenus: number
  lignes: number
  modes: string[]
  soutiens: number
  reprises: number
  cree_le: string
  inspire_de: string | null
  auteur: { id: string; pseudo: string } | null
}

const COLONNES =
  'id,titre,intention,visibilite,partie,libre,voyageurs,investi,retenus,lignes,modes,soutiens,reprises,cree_le,inspire_de,auteur:profils(id,pseudo)'

// Stockage local : il peut être indisponible (navigation privée, cookies bloqués), et le jeu doit tenir sans lui.
function lireLocal<T>(nom: string, defaut: T): T {
  try {
    const v = localStorage.getItem(nom)
    return v ? (JSON.parse(v) as T) : defaut
  } catch {
    return defaut
  }
}
function ecrireLocal(nom: string, valeur: unknown) {
  try {
    localStorage.setItem(nom, JSON.stringify(valeur))
  } catch {
    // Sans stockage, la clé ne dure que le temps de la page.
  }
}

let cleEnMemoire: string | null = null
/** La clé secrète de ce navigateur, tirée au hasard la première fois. */
function cleNavigateur() {
  cleEnMemoire ??= lireLocal<string | null>('simulateur-cle', null)
  if (!cleEnMemoire) {
    const octets = crypto.getRandomValues(new Uint8Array(24))
    cleEnMemoire = Array.from(octets, (o) => o.toString(16).padStart(2, '0')).join('')
    ecrireLocal('simulateur-cle', cleEnMemoire)
  }
  return cleEnMemoire
}

async function lire<T>(chemin: string): Promise<T> {
  const r = await fetch(`${URL_BASE}/rest/v1/${chemin}`, { headers: { apikey: CLE_PUBLIQUE } })
  if (!r.ok) throw new Error('Nous n’arrivons pas à charger les réseaux publiés pour l’instant.')
  return r.json() as Promise<T>
}

async function appeler<T>(action: string, donnees: Record<string, unknown> = {}): Promise<T> {
  let r: Response
  try {
    r = await fetch(`${URL_BASE}/functions/v1/communaute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: CLE_PUBLIQUE },
      body: JSON.stringify({ action, cle: cleNavigateur(), ...donnees }),
    })
  } catch {
    throw new Error('Nous n’arrivons pas à joindre notre serveur. Vérifiez votre connexion et réessayez.')
  }
  const corps = (await r.json().catch(() => ({}))) as { erreur?: string }
  if (!r.ok) throw new Error(corps.erreur ?? 'Une erreur est survenue. Réessayez dans un instant.')
  return corps as T
}

/** Les réseaux publiés d'une ville : ceux qui tiennent le budget, ou ceux du jeu libre, jamais mêlés. */
export function listerReseaux(tri: Tri, ville: IdVille = 'lyon', libre = false, limite = 30) {
  const ordre = tri === 'populaires' ? 'soutiens.desc,cree_le.desc' : 'cree_le.desc'
  return lire<ReseauPublie[]>(
    `reseaux?select=${COLONNES}&ville=eq.${ville}&libre=eq.${libre}&visibilite=eq.publique&order=${ordre}&limit=${limite}`,
  )
}

export function reseauxDe(profil: string) {
  return lire<ReseauPublie[]>(`reseaux?select=${COLONNES}&auteur=eq.${profil}&order=cree_le.desc`)
}

export async function lireReseau(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null
  const [reseau] = await lire<ReseauPublie[]>(`reseaux?select=${COLONNES}&id=eq.${id}`)
  if (!reseau) return null
  let source: { id: string; titre: string; pseudo: string } | null = null
  if (reseau.inspire_de) {
    const [s] = await lire<{ id: string; titre: string; auteur: { pseudo: string } | null }[]>(
      `reseaux?select=id,titre,auteur:profils(pseudo)&id=eq.${reseau.inspire_de}`,
    )
    if (s) source = { id: s.id, titre: s.titre, pseudo: s.auteur?.pseudo ?? '' }
  }
  return { reseau, source }
}

/** Le profil de ce navigateur, tel qu'il a été enregistré à la dernière publication. */
export const profilLocal = () => lireLocal<Profil | null>('simulateur-profil', null)

const ignorer = () => () => {}
const profilBrut = () => {
  try {
    return localStorage.getItem('simulateur-profil')
  } catch {
    return null
  }
}
/** Le profil local, lu seulement dans le navigateur pour que la page rendue par le serveur reste identique. */
export function useProfilLocal(): Profil | null {
  const brut = useSyncExternalStore(ignorer, profilBrut, () => null)
  return useMemo(() => {
    try {
      return brut ? (JSON.parse(brut) as Profil) : null
    } catch {
      return null
    }
  }, [brut])
}

export async function publier(demande: {
  titre: string
  intention: string
  visibilite: 'publique' | 'lien'
  pseudo?: string
  partie: PartieCompacte
  inspire_de?: string | null
}) {
  const r = await appeler<{ id: string; profil: Profil }>('publier', demande)
  ecrireLocal('simulateur-profil', r.profil)
  return r
}

/** Les réseaux que ce navigateur soutient, retenus localement pour afficher le bon bouton. */
export const soutiensLocaux = () => new Set(lireLocal<string[]>('simulateur-soutiens', []))

export async function soutenir(reseau: string, oui: boolean) {
  const r = await appeler<{ soutiens: number; soutenu: boolean }>('soutenir', { reseau, oui })
  const locaux = soutiensLocaux()
  if (r.soutenu) locaux.add(reseau)
  else locaux.delete(reseau)
  ecrireLocal('simulateur-soutiens', [...locaux])
  return r
}

export const compterReprise = (reseau: string) => appeler<{ ok: true }>('reprendre', { reseau })
export const signaler = (reseau: string, motif: Motif) => appeler<{ ok: true }>('signaler', { reseau, motif })
export const retirer = (reseau: string) => appeler<{ ok: true }>('retirer', { reseau })

/** Inscrit ce navigateur à l'accès anticipé : l'adresse du joueur part dans notre base, rattachée à sa clé. */
export const inscrireAcces = (donnees: { email: string; profil?: string; ville: IdVille }) => appeler<{ ok: true }>('inscrire', donnees)

/** Un bug ou une amélioration signalés depuis le jeu, avec de quoi les reproduire. */
export interface Retour {
  type: 'bug' | 'amelioration'
  texte: string
  /** Où en était le joueur : l'écran, le panneau ouvert, le réseau, la taille de la fenêtre. */
  contexte: Record<string, unknown>
  partie: PartieCompacte | null
  navigateur: string
}

/** Envoie un bug ou une amélioration ; le serveur répond par son numéro. */
export const envoyerRetour = (retour: Retour) => appeler<{ id: number }>('retour', { ...retour })

/**
 * Les chiffres d'en-tête des réseaux publiés d'une ville : combien il y en a, et celui qui gagne le plus de
 * voyageurs, pour montrer le record à battre. Le record ne compte que les parties en deux mandats : une partie
 * continuée a eu plus d'argent (sa forme compacte porte alors le nombre de ses mandats).
 */
export async function chiffresCommunaute(ville: IdVille, libre: boolean) {
  const filtre = `ville=eq.${ville}&libre=eq.${libre}&visibilite=eq.publique`
  const r = await fetch(`${URL_BASE}/rest/v1/reseaux?select=id&${filtre}&limit=1`, {
    headers: { apikey: CLE_PUBLIQUE, Prefer: 'count=exact' },
  })
  if (!r.ok) throw new Error('Nous n’arrivons pas à charger les réseaux publiés pour l’instant.')
  const total = Number(r.headers.get('content-range')?.split('/')[1]) || 0
  const [record] = await lire<ReseauPublie[]>(`reseaux?select=${COLONNES}&${filtre}&partie->>k=is.null&order=voyageurs.desc&limit=1`)
  return { total, record: record ?? null }
}
