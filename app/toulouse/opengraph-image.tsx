import { ImageResponse } from 'next/og'

import { cadreMiniature, cheminsFond } from '@/lib/miniature'
import { polices, ROUGE, SABLE } from '@/lib/og'
import { VILLES } from '@/lib/villes'
import fond from '@/public/data/toulouse/fond.json'

/** L'image qui accompagne un lien vers l'accueil de Toulouse : la carte du réseau actuel et ce qu'on y fait. */

export const alt = 'La carte du métro et du tram de Toulouse, avec le titre du jeu'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ville = VILLES.toulouse
const chemins = cheminsFond(fond as unknown as Parameters<typeof cheminsFond>[0], ville)

export default async function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', padding: 40, background: ROUGE, fontFamily: 'Figtree' }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between', marginRight: 44, color: 'white' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{`${ville.marque}, ${ville.nom}`}</div>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 0.98, letterSpacing: -2.5 }}>Construisez le réseau Tisséo de 2038.</div>
        <div style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.3 }}>
          Tracez vos lignes de tram, de bus ou de métro : nous calculons leur prix et leurs voyageurs.
        </div>
      </div>
      <div style={{ display: 'flex', width: 480, height: 550, borderRadius: 32, overflow: 'hidden', background: SABLE }}>
        <svg width={480} height={550} viewBox={cadreMiniature(ville).viewBox} preserveAspectRatio="xMidYMid slice">
          <path d={chemins.fleuves} fill="none" stroke="#c6dde9" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
          <path d={chemins.tram} fill="none" stroke="#b9b2a8" strokeWidth={3} strokeLinecap="round" />
          <path d={chemins.metro} fill="none" stroke="#6f6961" strokeWidth={5} strokeLinecap="round" />
        </svg>
      </div>
    </div>,
    { ...size, fonts: await polices },
  )
}
