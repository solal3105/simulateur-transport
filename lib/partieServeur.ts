import { inflateRawSync } from 'node:zlib'

import { preparerCarreaux, type Carreaux } from './modele'
import { compacter, normaliserPartie, villeDePartie, type PartieCompacte } from './partie'
import { resumer } from './regles'
import { fleuvesDe, preparerTerrain, type ReliefBrut } from './terrain'
import { VILLES, type IdVille } from './villes'

/**
 * Une partie partagée par lien, relue sur le serveur pour l'image et le titre de son adresse /p/<code>.
 * Le code est celui de lib/lien.ts : la partie compacte, compressée puis écrite en base 64. Les chiffres
 * sont recalculés avec le modèle, comme à la publication : un lien fabriqué à la main n'affiche rien de faux.
 */

/** Au-delà, un code ne vient pas du jeu : une partie compte au plus quelques dizaines de lignes. */
const TAILLE_MAX = 400_000

export function lireCode(code: string): PartieCompacte | null {
  try {
    if (!/^[A-Za-z0-9_-]{8,}$/.test(code)) return null
    const octets = inflateRawSync(Buffer.from(code, 'base64url'), { maxOutputLength: TAILLE_MAX })
    const brut = JSON.parse(octets.toString('utf8')) as PartieCompacte
    return villeDePartie(brut) && Array.isArray(brut.c) && Array.isArray(brut.l) ? brut : null
  } catch {
    return null
  }
}

type Json = { default: unknown }
/** Les données de chaque réseau, chargées seulement quand une partie de ce réseau est demandée. */
const FICHIERS: Record<IdVille, () => Promise<[Json, Json, Json, Json]>> = {
  lyon: () =>
    Promise.all([
      import('@/public/data/carreaux.json'),
      import('@/public/data/arrets.json'),
      import('@/public/data/relief.json'),
      import('@/public/data/fond.json'),
    ]),
  toulouse: () =>
    Promise.all([
      import('@/public/data/toulouse/carreaux.json'),
      import('@/public/data/toulouse/arrets.json'),
      import('@/public/data/toulouse/relief.json'),
      import('@/public/data/toulouse/fond.json'),
    ]),
  marseille: () =>
    Promise.all([
      import('@/public/data/marseille/carreaux.json'),
      import('@/public/data/marseille/arrets.json'),
      import('@/public/data/marseille/relief.json'),
      import('@/public/data/marseille/fond.json'),
    ]),
  nice: () =>
    Promise.all([
      import('@/public/data/nice/carreaux.json'),
      import('@/public/data/nice/arrets.json'),
      import('@/public/data/nice/relief.json'),
      import('@/public/data/nice/fond.json'),
    ]),
  idf: () =>
    Promise.all([
      import('@/public/data/idf/carreaux.json'),
      import('@/public/data/idf/arrets.json'),
      import('@/public/data/idf/relief.json'),
      import('@/public/data/idf/fond.json'),
    ]),
}

const carreaux = new Map<IdVille, Promise<Carreaux>>()
function chargerCarreaux(ville: IdVille) {
  let p = carreaux.get(ville)
  if (!p) {
    p = FICHIERS[ville]().then(([c, a, r, f]) =>
      preparerCarreaux(
        c.default as number[][],
        a.default as number[][],
        VILLES[ville],
        preparerTerrain(r.default as ReliefBrut, fleuvesDe(f.default as Parameters<typeof fleuvesDe>[0])),
      ),
    )
    p.catch(() => carreaux.delete(ville))
    carreaux.set(ville, p)
  }
  return p
}

/** Ce que montre l'image d'une partie partagée : sa carte et ses chiffres, recalculés. */
export async function resumerCode(code: string) {
  const brut = lireCode(code)
  const id = brut && villeDePartie(brut)
  if (!brut || !id) return null
  const partie = normaliserPartie(brut, await chargerCarreaux(id))
  if (!partie) return null
  const r = resumer(partie.chantiers, partie.lignes, partie.leviers, VILLES[id], partie.mandats)
  return {
    ville: VILLES[id],
    partie: compacter(partie),
    libre: partie.libre,
    voyageurs: r.voyageurs,
    investi: Math.round(r.investi),
    equilibre: r.equilibre,
  }
}
