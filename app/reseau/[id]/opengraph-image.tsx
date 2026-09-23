import { ImageResponse } from 'next/og'

import { n } from '@/lib/format'
import { cadreMiniature, cheminsFond, cheminsReseau } from '@/lib/miniature'
import { polices, ROUGE, SABLE } from '@/lib/og'
import { villeDePartie } from '@/lib/partie'
import { VILLES, type IdVille } from '@/lib/villes'
import fondLyon from '@/public/data/fond.json'
import projetsLyon from '@/public/data/projets.json'
import fondToulouse from '@/public/data/toulouse/fond.json'

import { lireApercu } from './apercu'

/**
 * L'image qui accompagne le lien d'un réseau publié sur les réseaux sociaux et les messageries :
 * sa carte en miniature, son titre, son auteur et les voyageurs qu'il gagne.
 */

export const alt = 'La carte du réseau publié, avec son titre, son auteur et les voyageurs qu’il gagne chaque jour'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

type Fond = Parameters<typeof cheminsFond>[0]
type Projets = Parameters<typeof cheminsReseau>[0]
const DONNEES: Record<IdVille, { fond: Fond; projets: Projets }> = {
  lyon: { fond: fondLyon as unknown as Fond, projets: projetsLyon as unknown as Projets },
  toulouse: { fond: fondToulouse as unknown as Fond, projets: { type: 'FeatureCollection', features: [] } },
}

/** La police n'a pas l'espace fine insécable que le français met entre les milliers. */
const nombre = (v: number) => n(v).replace(/ /g, ' ')

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [reseau, fonts] = await Promise.all([lireApercu(id), polices])
  const options = { ...size, fonts }

  if (!reseau) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: ROUGE,
          color: 'white',
          fontFamily: 'Figtree',
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700 }}>Simulateur TCL</div>
        <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3, marginTop: 24 }}>
          Construisez le réseau TCL de 2038.
        </div>
      </div>,
      options,
    )
  }

  const ville = VILLES[villeDePartie(reseau.partie) ?? 'lyon']
  const { fond, projets } = DONNEES[ville.id]
  const chemins = cheminsFond(fond, ville)
  const traces = cheminsReseau(projets, reseau.partie, ville)
  const long = reseau.titre.length > 32
  const surtitre = `${ville.marque}, ${ville.nom} en 2038`
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', padding: 40, background: ROUGE, fontFamily: 'Figtree' }}>
      <div style={{ display: 'flex', width: 640, height: 550, borderRadius: 32, overflow: 'hidden', background: SABLE }}>
        <svg width={640} height={550} viewBox={cadreMiniature(ville).viewBox} preserveAspectRatio="xMidYMid meet">
          <path d={chemins.fleuves} fill="none" stroke="#c6dde9" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          <path d={chemins.tram} fill="none" stroke="#d9d3ca" strokeWidth={2} strokeLinecap="round" />
          <path d={chemins.metro} fill="none" stroke="#958e84" strokeWidth={3.5} strokeLinecap="round" />
          {traces.map((l, i) => (
            <path key={`b${i}`} d={l.d} fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {traces.map((l, i) => (
            <path key={`c${i}`} d={l.d} fill="none" stroke={l.couleur} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          marginLeft: 44,
          padding: '6px 0',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: surtitre.length > 30 ? 21 : 24, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{surtitre}</div>
          <div style={{ fontSize: long ? 46 : 58, fontWeight: 900, lineHeight: 1.02, letterSpacing: long ? -1.2 : -1.6, marginTop: 20 }}>
            {reseau.titre}
          </div>
          <div
            style={{ fontSize: 28, fontWeight: 700, marginTop: 16, color: 'rgba(255,255,255,0.9)' }}
          >{`par ${reseau.auteur?.pseudo ?? 'un joueur'}`}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 900, lineHeight: 1, letterSpacing: -3 }}>{`+${nombre(reseau.voyageurs)}`}</div>
          <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>voyageurs par jour</div>
          <div
            style={{ fontSize: 22, fontWeight: 700, marginTop: 16, color: 'rgba(255,255,255,0.85)' }}
          >{`pour ${nombre(reseau.investi)} M€ investis`}</div>
        </div>
      </div>
    </div>,
    options,
  )
}
