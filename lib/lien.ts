'use client'

import { PROJETS } from './catalogue'
import { chargerDonnees } from './donnees'
import { estimer } from './modele'
import { LEVIERS_NEUTRES } from './regles'
import type { Chantier, Leviers, LigneJoueur } from './types'

/** Ce qu'un lien de partage contient : de quoi rejouer le bilan, rien de personnel. */
export interface PartiePartagee {
  chantiers: Chantier[]
  lignes: LigneJoueur[]
  leviers: Record<1 | 2, Leviers>
}

const VERSION = 1

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
  const compacte = {
    v: VERSION,
    c: p.chantiers.map((c) => [c.id, c.mandat, c.etale ? 1 : 0, c.varianteId ?? '', c.option ? 1 : 0]),
    l: p.lignes.map((l) => ({
      n: l.nom,
      m: l.mode,
      d: l.mandat,
      e: l.etale ? 1 : 0,
      a: l.arrets.map(([lon, lat]) => [Math.round(lon * 1e5) / 1e5, Math.round(lat * 1e5) / 1e5]),
    })),
    f: p.leviers,
  }
  const octets = new TextEncoder().encode(JSON.stringify(compacte))
  return enBase64Url(await transformer(octets, new CompressionStream('deflate-raw')))
}

/** Relit une partie partagée ; renvoie null si le lien est abîmé ou vient d'une autre version. */
export async function decoderPartie(texte: string): Promise<PartiePartagee | null> {
  try {
    const octets = await transformer(depuisBase64Url(texte), new DecompressionStream('deflate-raw'))
    const brut = JSON.parse(new TextDecoder().decode(octets))
    if (brut.v !== VERSION) return null
    const chantiers: Chantier[] = (brut.c as [string, 1 | 2, number, string, number][])
      .filter(([id]) => PROJETS.has(id))
      .map(([id, mandat, etale, varianteId, option]) => ({
        id,
        mandat: mandat === 2 ? 2 : 1,
        etale: etale === 1,
        varianteId: varianteId || undefined,
        option: option === 1,
      }))
    // Les estimations ne voyagent pas dans le lien : elles sont recalculées ici, pour qu'un lien
    // modifié à la main ne puisse pas afficher un faux score.
    const donnees = await chargerDonnees()
    const modes = ['tram', 'bus', 'metro', 'cable'] as const
    const lignes: LigneJoueur[] = (brut.l as { n: string; m: LigneJoueur['mode']; d: 1 | 2; e: number; a: [number, number][] }[])
      .filter((l) => modes.includes(l.m) && Array.isArray(l.a) && l.a.length >= 2 && l.a.length <= 60)
      .map((l, i) => {
        const estimation = estimer(l.m, l.a, donnees.carreaux)
        return {
          id: `partage-${i}`,
          nom: String(l.n).slice(0, 60),
          mode: l.m,
          mandat: l.d === 2 ? 2 : 1,
          etale: l.e === 1,
          arrets: l.a,
          estimation: { ...estimation, nouveaux: Math.round(estimation.nouveaux / 100) * 100 },
        }
      })
    // Les leviers sont bornés aux valeurs que le jeu permet.
    const borne = (v: unknown, min: number, max: number) => Math.max(min, Math.min(max, Math.round(Number(v) || 0)))
    const lire = (l: Partial<Leviers> | undefined): Leviers => ({
      ...LEVIERS_NEUTRES,
      abonnements: borne(l?.abonnements, -20, 30),
      tickets: borne(l?.tickets, -20, 30),
      versementMobilite: borne(l?.versementMobilite, 0, 5),
      gratuiteTotale: l?.gratuiteTotale === true,
      gratuiteMoins25: l?.gratuiteMoins25 === true,
      gratuiteJeunesAbonnes: l?.gratuiteJeunesAbonnes === true,
      suppressionTarifSocial: l?.suppressionTarifSocial === true,
      metroNuit: l?.metroNuit === true,
      tva: l?.tva === true,
    })
    return { chantiers, lignes, leviers: { 1: lire(brut.f?.[1]), 2: lire(brut.f?.[2]) } }
  } catch {
    return null
  }
}

/** L'adresse complète à partager. */
export async function lienDePartage(p: PartiePartagee) {
  return `${window.location.origin}/#r=${await encoderPartie(p)}`
}
