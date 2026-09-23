import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { n } from '@/lib/format'
import { CADRE_MINIATURE, cheminsFond, cheminsReseau } from '@/lib/miniature'
import fond from '@/public/data/fond.json'
import projets from '@/public/data/projets.json'

import { lireApercu } from './apercu'

/**
 * L'image qui accompagne le lien d'un réseau publié sur les réseaux sociaux et les messageries :
 * sa carte en miniature, son titre, son auteur et les voyageurs qu'il gagne.
 */

export const alt = 'La carte du réseau publié, avec son titre, son auteur et les voyageurs qu’il gagne chaque jour'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ROUGE = '#e3051b'
const SABLE = '#f4f1ec'

type Fond = Parameters<typeof cheminsFond>[0]
type Projets = Parameters<typeof cheminsReseau>[0]
const FOND = cheminsFond(fond as unknown as Fond)

// Lue une seule fois ; sans police, l'image sort avec celle par défaut plutôt que pas du tout.
const polices = Promise.all(
  (['700', '900'] as const).map(async (graisse) => ({
    name: 'Figtree',
    data: await readFile(join(process.cwd(), `assets/polices/Figtree-${graisse}.ttf`)),
    weight: Number(graisse) as 700 | 900,
    style: 'normal' as const,
  })),
).catch(() => [])

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

  const traces = cheminsReseau(projets as unknown as Projets, reseau.partie)
  const long = reseau.titre.length > 32
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', padding: 40, background: ROUGE, fontFamily: 'Figtree' }}>
      <div style={{ display: 'flex', width: 640, height: 550, borderRadius: 32, overflow: 'hidden', background: SABLE }}>
        <svg width={640} height={550} viewBox={CADRE_MINIATURE} preserveAspectRatio="xMidYMid meet">
          <path d={FOND.fleuves} fill="none" stroke="#c6dde9" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
          <path d={FOND.tram} fill="none" stroke="#d9d3ca" strokeWidth={2} strokeLinecap="round" />
          <path d={FOND.metro} fill="none" stroke="#958e84" strokeWidth={3.5} strokeLinecap="round" />
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
          <div style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>Simulateur TCL, Lyon en 2038</div>
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
