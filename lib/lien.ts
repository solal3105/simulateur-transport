'use client'

import { chargerDonnees } from './donnees'
import { compacter, normaliserPartie, type PartiePartagee } from './partie'

export type { PartiePartagee } from './partie'

const enBase64Url = (octets: Uint8Array) => {
  let s = ''
  for (const o of octets) s += String.fromCharCode(o)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const depuisBase64Url = (texte: string) => {
  const s = atob(texte.replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

async function transformer(octets: Uint8Array, flux: CompressionStream | DecompressionStream) {
  const sortie = new Blob([octets as BlobPart]).stream().pipeThrough(flux)
  return new Uint8Array(await new Response(sortie).arrayBuffer())
}

/** Encode une partie dans un texte court, à placer après #r= dans l'adresse. */
export async function encoderPartie(p: PartiePartagee): Promise<string> {
  const octets = new TextEncoder().encode(JSON.stringify(compacter(p)))
  return enBase64Url(await transformer(octets, new CompressionStream('deflate-raw')))
}

/** Relit une partie partagée ; renvoie null si le lien est abîmé ou vient d'une autre version. */
export async function decoderPartie(texte: string): Promise<PartiePartagee | null> {
  try {
    const octets = await transformer(depuisBase64Url(texte), new DecompressionStream('deflate-raw'))
    return await lirePartie(JSON.parse(new TextDecoder().decode(octets)))
  } catch {
    return null
  }
}

/** Relit une partie compacte, venue d'un lien ou d'un réseau publié, et recalcule ses lignes. */
export async function lirePartie(brut: unknown): Promise<PartiePartagee | null> {
  return normaliserPartie(brut, (await chargerDonnees()).carreaux)
}

/** L'adresse complète à partager. */
export async function lienDePartage(p: PartiePartagee) {
  return `${window.location.origin}/#r=${await encoderPartie(p)}`
}
