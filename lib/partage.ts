'use client'

import { chargerDonnees } from './donnees'
import { n } from './format'
import { MARQUE, type Ville } from './villes'

interface Contenu {
  ville: Ville
  voyageurs: number
  /** Ce que contient le réseau : « 14 projets sur 22 », « 3 lignes tracées ». */
  contenu: string
  equilibre: boolean
  /** Un réseau fait en jeu libre le dit sur son image. */
  libre: boolean
  /** Tracés des projets décidés, avec la couleur de leur mode. */
  traces: Map<string, string>
  /** Lignes du joueur, avec leur couleur. */
  lignes: { arrets: [number, number][]; couleur: string }[]
  adresse: string
}

const ENCRE = '#1b1b1f'

/** Dessine l'image de partage : format story (1080 × 1920) ou paysage (1200 × 630). */
export async function dessinerPartage(c: Contenu, format: 'story' | 'paysage'): Promise<Blob> {
  const donnees = await chargerDonnees(c.ville.id)
  await document.fonts.ready
  const [W, H] = format === 'story' ? [1080, 1920] : [1200, 630]
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')!
  const police = getComputedStyle(document.body).fontFamily

  g.fillStyle = c.ville.couleurs.principale
  g.fillRect(0, 0, W, H)

  // Cadre de la carte.
  const carte = format === 'story' ? { x: 70, y: 470, w: 940, h: 900 } : { x: 600, y: 50, w: 550, h: 530 }
  g.fillStyle = '#ffffff'
  g.beginPath()
  g.roundRect(carte.x, carte.y, carte.w, carte.h, 40)
  g.fill()
  g.save()
  g.beginPath()
  g.roundRect(carte.x, carte.y, carte.w, carte.h, 40)
  g.clip()

  const [[lon0, lat0], [lon1, lat1]] = c.ville.emprise
  const kx = Math.cos((c.ville.latitude * Math.PI) / 180)
  const echelle = Math.min(carte.w / ((lon1 - lon0) * kx), carte.h / (lat1 - lat0))
  const ox = carte.x + (carte.w - (lon1 - lon0) * kx * echelle) / 2
  const oy = carte.y + (carte.h - (lat1 - lat0) * echelle) / 2
  const px = (lon: number, lat: number): [number, number] => [ox + (lon - lon0) * kx * echelle, oy + (lat1 - lat) * echelle]
  const trait = (coords: number[][], couleur: string, largeur: number, tirets?: number[]) => {
    g.strokeStyle = couleur
    g.lineWidth = largeur
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.setLineDash(tirets ?? [])
    g.beginPath()
    coords.forEach(([lon, lat], i) => {
      const [x, y] = px(lon!, lat!)
      if (i === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    })
    g.stroke()
  }
  const s = echelle / 2200
  for (const f of donnees.fond.features) {
    // La mer : des anneaux fermés, la mer et ses îles, remplis en pair-impair.
    if (f.properties.kind === 'cote') {
      g.beginPath()
      for (const anneau of f.geometry.coordinates) {
        anneau.forEach(([lon, lat], i) => {
          const [x, y] = px(lon!, lat!)
          if (i === 0) g.moveTo(x, y)
          else g.lineTo(x, y)
        })
        g.closePath()
      }
      g.fillStyle = '#cfe2ec'
      g.fill('evenodd')
      continue
    }
    const couleur = f.properties.kind === 'fleuve' ? '#cfe2ec' : f.properties.kind === 'tram' ? '#e1ddd7' : '#b9b2a8'
    for (const part of f.geometry.coordinates) trait(part, couleur, (f.properties.kind === 'fleuve' ? 9 : 2.5) * s)
  }
  for (const f of donnees.projets.features) {
    if (c.traces.has(f.properties.id)) continue
    for (const part of f.geometry.coordinates) trait(part, 'rgba(27,27,31,0.25)', 2.5 * s, [6 * s, 5 * s])
  }
  const faits = [
    ...donnees.projets.features
      .filter((f) => c.traces.has(f.properties.id))
      .flatMap((f) => f.geometry.coordinates.map((coords) => ({ coords, couleur: c.traces.get(f.properties.id)! }))),
    ...c.lignes.map((l) => ({ coords: l.arrets, couleur: l.couleur })),
  ]
  for (const f of faits) trait(f.coords, '#ffffff', 13 * s)
  for (const f of faits) trait(f.coords, f.couleur, 8 * s)
  g.restore()

  // Textes.
  g.fillStyle = '#ffffff'
  g.textBaseline = 'alphabetic'
  const texte = (t: string, x: number, y: number, taille: number, graisse = 800) => {
    g.font = `${graisse} ${taille}px ${police}`
    g.fillText(t, x, y)
  }
  if (format === 'story') {
    texte(MARQUE, 70, 130, 40)
    texte(`Mon réseau ${c.ville.reseau}`, 70, 290, 104, 900)
    texte('en 2038', 70, 400, 104, 900)
    texte(`+${n(c.voyageurs)}`, 70, 1530, 130, 900)
    texte('voyageurs par jour, avec', 70, 1610, 44, 700)
    texte(`${c.contenu}${c.libre ? ', en jeu libre.' : c.equilibre ? ' et un budget tenu.' : '.'}`, 70, 1670, 44, 700)
    texte('Et vous, que construiriez-vous ?', 70, 1800, 44, 800)
    texte(c.adresse, 70, 1860, 34, 700)
  } else {
    texte(MARQUE, 52, 90, 26)
    texte(`Mon réseau ${c.ville.reseau}`, 52, 180, 60, 900)
    texte('en 2038', 52, 245, 60, 900)
    texte(`+${n(c.voyageurs)}`, 52, 380, 78, 900)
    texte('voyageurs par jour, avec', 52, 425, 26, 700)
    texte(`${c.contenu}${c.libre ? ', en jeu libre.' : c.equilibre ? ' et un budget tenu.' : '.'}`, 52, 460, 26, 700)
    texte('Et vous, que construiriez-vous ?', 52, 550, 26, 800)
    texte(c.adresse, 52, 585, 20, 700)
  }
  g.fillStyle = ENCRE
  return new Promise((ok) => canvas.toBlob((b) => ok(b!), 'image/png'))
}
