'use client'

import { chargerDonnees } from './donnees'
import { n } from './format'
import { MARQUE, type Ville } from './villes'

interface Contenu {
  ville: Ville
  /** L'année du réseau montré : 2038, ou la fin du dernier mandat quand la partie a été continuée. */
  annee: number
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

/**
 * Répartit un texte en lignes qui tiennent dans la largeur et la hauteur données, en réduisant la taille par pas de 2 px
 * tant que ce n'est pas le cas. Une espace insécable garde ses deux mots ensemble.
 */
function couper(
  g: CanvasRenderingContext2D,
  texte: string,
  {
    police,
    graisse,
    taille,
    min,
    largeur,
    hauteur,
    interligne,
  }: { police: string; graisse: number; taille: number; min: number; largeur: number; hauteur: number; interligne: number },
) {
  for (; ; taille -= 2) {
    g.font = `${graisse} ${taille}px ${police}`
    const lignes: string[] = []
    for (const mot of texte.split(' ')) {
      const essai = lignes.length ? `${lignes.at(-1)} ${mot}` : mot
      if (lignes.length && g.measureText(essai).width <= largeur) lignes[lignes.length - 1] = essai
      else lignes.push(mot)
    }
    // La hauteur du bloc, de la ligne de base de la dernière ligne au haut des lettres de la première.
    const haut = (lignes.length - 1) * taille * interligne + taille * 0.75
    if (taille <= min || (haut <= hauteur && lignes.every((l) => g.measureText(l).width <= largeur))) return { taille, lignes }
  }
}

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

  const faits = [
    ...donnees.projets.features
      .filter((f) => c.traces.has(f.properties.id))
      .flatMap((f) => f.geometry.coordinates.map((coords) => ({ coords, couleur: c.traces.get(f.properties.id)! }))),
    ...c.lignes.map((l) => ({ coords: l.arrets, couleur: l.couleur })),
  ]
  // Le cadre montre la vue de départ du réseau, élargie à tout ce que le joueur a construit, avec 3 km de marge.
  const kx = Math.cos((c.ville.latitude * Math.PI) / 180)
  const points = faits.flatMap((f) => f.coords)
  const marge = 0.03
  const lon0 = Math.min(c.ville.emprise[0][0], ...points.map((p) => p[0]! - marge / kx))
  const lat0 = Math.min(c.ville.emprise[0][1], ...points.map((p) => p[1]! - marge))
  const lon1 = Math.max(c.ville.emprise[1][0], ...points.map((p) => p[0]! + marge / kx))
  const lat1 = Math.max(c.ville.emprise[1][1], ...points.map((p) => p[1]! + marge))
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
  // Les traits suivent l'échelle, sans devenir trop fins quand le réseau s'étend loin.
  const s = Math.max(echelle / 2200, format === 'story' ? 1.1 : 0.7)
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
  // Le titre et la phrase du contenu passent à la ligne dans la place qui leur revient : « d'Aix-Marseille-Provence »
  // ne mord plus sur la carte. Le titre finit toujours sur la même ligne de base et remonte d'autant qu'il a de lignes.
  // Le nom du réseau ne se coupe pas : « Lignes d'Azur » reste sur une ligne.
  const titre = `Mon réseau ${c.ville.reseau.replaceAll(' ', '\u00a0')} en\u00a0${c.annee}`
  const phrase = `${c.contenu}${c.libre ? ', en jeu\u00a0libre.' : c.equilibre ? ' et un budget\u00a0tenu.' : '.'}`
  const bloc = (lignes: string[], x: number, y: number, taille: number, graisse: number, interligne: number) =>
    lignes.forEach((l, i) => texte(l, x, y + i * taille * interligne, taille, graisse))
  if (format === 'story') {
    texte(MARQUE, 70, 130, 40)
    const t = couper(g, titre, { police, graisse: 900, taille: 104, min: 56, largeur: W - 140, hauteur: 215, interligne: 1.06 })
    bloc(t.lignes, 70, 400 - (t.lignes.length - 1) * t.taille * 1.06, t.taille, 900, 1.06)
    texte(`+${n(c.voyageurs)}`, 70, 1530, 130, 900)
    texte('voyageurs par jour, avec', 70, 1610, 44, 700)
    const p = couper(g, phrase, { police, graisse: 700, taille: 44, min: 34, largeur: W - 140, hauteur: 95, interligne: 1.3 })
    bloc(p.lignes, 70, 1670, p.taille, 700, 1.3)
    texte('Et vous, que construiriez-vous ?', 70, 1800, 44, 800)
    texte(c.adresse, 70, 1860, 34, 700)
  } else {
    texte(MARQUE, 52, 90, 26)
    const t = couper(g, titre, { police, graisse: 900, taille: 60, min: 32, largeur: carte.x - 52 - 32, hauteur: 133, interligne: 1.08 })
    bloc(t.lignes, 52, 245 - (t.lignes.length - 1) * t.taille * 1.08, t.taille, 900, 1.08)
    texte(`+${n(c.voyageurs)}`, 52, 380, 78, 900)
    texte('voyageurs par jour, avec', 52, 425, 26, 700)
    const p = couper(g, phrase, { police, graisse: 700, taille: 26, min: 20, largeur: carte.x - 52 - 32, hauteur: 55, interligne: 1.25 })
    bloc(p.lignes, 52, 460, p.taille, 700, 1.25)
    texte('Et vous, que construiriez-vous ?', 52, 550, 26, 800)
    texte(c.adresse, 52, 585, 20, 700)
  }
  g.fillStyle = ENCRE
  return new Promise((ok) => canvas.toBlob((b) => ok(b!), 'image/png'))
}
