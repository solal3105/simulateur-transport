'use client'

import { useSyncExternalStore } from 'react'

import { communauteActive, inscrireAcces } from './communaute'
import type { IdVille } from './villes'

/**
 * L'accès anticipé : le jeu est ouvert à tous, mais on n'y entre qu'après avoir laissé son adresse électronique et
 * promis de nous signaler bugs et améliorations. L'adresse part dans notre base par la fonction « communaute » ; ce
 * navigateur retient seulement que l'étape est faite, et l'adresse, pour la rappeler au joueur quand il nous écrit.
 * Sans stockage possible, il s'en souvient jusqu'à la fermeture de la page.
 */
const CLE = 'acces-anticipe-inscription'
/** L'ancien accès par mot de passe : ceux qui l'avaient passent eux aussi une fois par l'écran d'entrée. */
const ANCIENNE_CLE = 'acces-anticipe'

export type ProfilJoueur = 'usager' | 'etudiant' | 'professionnel' | 'elu' | 'journaliste' | 'autre'

/** Ce que le joueur peut dire de lui, dans l'ordre où on le lui propose. */
export const PROFILS_JOUEUR: { id: ProfilJoueur; nom: string }[] = [
  { id: 'usager', nom: 'Usager des transports' },
  { id: 'etudiant', nom: 'Étudiant ou chercheur' },
  { id: 'professionnel', nom: 'Professionnel des transports ou de la ville' },
  { id: 'elu', nom: 'Élu ou collaborateur d’élu' },
  { id: 'journaliste', nom: 'Journaliste' },
  { id: 'autre', nom: 'Autre' },
]

/** Une adresse qui en a la forme : on ne vérifie pas qu'elle existe. Le serveur applique la même règle. */
export const estAdresse = (email: string) => /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(email)

const abonnes = new Set<() => void>()
const notifier = () => abonnes.forEach((changer) => changer())
function abonner(changer: () => void) {
  abonnes.add(changer)
  return () => {
    abonnes.delete(changer)
  }
}

let adresseIci: string | null = null
function lireAdresse(): string | null {
  if (adresseIci) return adresseIci
  try {
    const brut = localStorage.getItem(CLE)
    const valeur = brut ? (JSON.parse(brut) as { email?: unknown }) : null
    return typeof valeur?.email === 'string' ? valeur.email : null
  } catch {
    return null
  }
}
const lire = () => lireAdresse() !== null

/** Le joueur est-il entré dans l'accès anticipé, lu à l'instant. */
export const aAcces = lire

/** Le joueur est-il entré dans l'accès anticipé ? Toujours non pendant le rendu sur le serveur. */
export const useAcces = () => useSyncExternalStore(abonner, lire, () => false)

/** L'adresse que le joueur nous a laissée, pour la lui rappeler. */
export const useAdresseInscrite = () => useSyncExternalStore(abonner, lireAdresse, () => null)

/** Ce que le joueur voulait faire quand on lui a demandé d'entrer, et sur quel réseau : on le fait une fois inscrit. */
let demande: { action: () => void; ville: IdVille } | null = null

/** Fait l'action tout de suite si le joueur est déjà entré, sinon lui montre d'abord l'écran d'entrée. */
export function exigerAcces(action: () => void, ville: IdVille) {
  if (lire()) return action()
  demande = { action, ville }
  notifier()
}

/** La demande en attente, qui ouvre l'écran d'entrée. */
export const useDemandeAcces = () =>
  useSyncExternalStore(
    abonner,
    () => demande,
    () => null,
  )

/** Le joueur referme l'écran d'entrée sans entrer. */
export function abandonnerDemande() {
  demande = null
  notifier()
}

/**
 * Inscrit le joueur, puis fait ce qu'il voulait faire. Renvoie un message à lui montrer si l'inscription échoue,
 * null sinon. Sans communauté configurée, en développement, l'inscription reste dans le navigateur.
 */
export async function rejoindre(email: string, profil: ProfilJoueur | null, ville: IdVille): Promise<string | null> {
  if (communauteActive) {
    try {
      await inscrireAcces({ email, ...(profil ? { profil } : {}), ville })
    } catch (e) {
      return e instanceof Error ? e.message : 'Une erreur est survenue. Réessayez dans un instant.'
    }
  }
  adresseIci = email
  try {
    localStorage.setItem(CLE, JSON.stringify({ email }))
    localStorage.removeItem(ANCIENNE_CLE)
  } catch {
    // Sans stockage, l'accès vaut pour cette page seulement.
  }
  const enAttente = demande
  demande = null
  notifier()
  enAttente?.action()
  return null
}
