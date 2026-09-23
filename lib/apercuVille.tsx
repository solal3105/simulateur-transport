import { ImageResponse } from 'next/og'

import { cadreMiniature, cheminsFond } from './miniature'
import { polices, SABLE } from './og'
import { MARQUE, type Ville } from './villes'

/** Les dimensions de l'image d'aperçu d'un accueil de réseau, celles des réseaux sociaux. */
export const TAILLE_APERCU = { width: 1200, height: 630 }

/**
 * L'image qui accompagne un lien vers l'accueil d'un réseau en tracé libre : la carte de son réseau
 * actuel, avec la mer s'il y en a, et ce qu'on y fait.
 */
export async function imageVille(ville: Ville, fond: unknown) {
  const chemins = cheminsFond(fond as Parameters<typeof cheminsFond>[0], ville)
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', padding: 40, background: ville.couleurs.principale, fontFamily: 'Figtree' }}>
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between', marginRight: 44, color: 'white' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{`${MARQUE}, ${ville.nom}`}</div>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 0.98, letterSpacing: -2.5 }}>{`Construisez le réseau ${ville.reseau} de 2038.`}</div>
        <div style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.3 }}>
          Tracez vos lignes de tram, de bus ou de métro : nous calculons leur prix et leurs voyageurs.
        </div>
      </div>
      <div style={{ display: 'flex', width: 480, height: 550, borderRadius: 32, overflow: 'hidden', background: SABLE }}>
        <svg width={480} height={550} viewBox={cadreMiniature(ville).viewBox} preserveAspectRatio="xMidYMid slice">
          <path d={chemins.mer} fill="#c6dde9" fillRule="evenodd" />
          <path d={chemins.fleuves} fill="none" stroke="#c6dde9" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" />
          <path d={chemins.tram} fill="none" stroke="#b9b2a8" strokeWidth={3} strokeLinecap="round" />
          <path d={chemins.metro} fill="none" stroke="#6f6961" strokeWidth={5} strokeLinecap="round" />
        </svg>
      </div>
    </div>,
    { ...TAILLE_APERCU, fonts: await polices },
  )
}
