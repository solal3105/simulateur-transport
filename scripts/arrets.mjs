/**
 * Les arrêts de métro et de tram du réseau actuel, qui disent au modèle de fréquentation qui est déjà desservi, et
 * d'où une ligne existante peut se prolonger : public/data/arrets.json (Lyon) ou public/data/<ville>/arrets.json,
 * au format [lon, lat, 1 pour le métro ou 0 pour le tram].
 *
 *   node scripts/arrets.mjs            les cinq réseaux
 *   node scripts/arrets.mjs idf        un seul
 *
 * scripts/build-data.mjs écrit le même fichier avec le reste des données ; ce script-ci ne touche qu'aux arrêts.
 *
 * Les arrêts viennent de trois sources :
 *   - la couche « stops » de scripts/fetch-osm.mjs (data/osm/<ville>/stops.json), qui prend les arrêts de tram et les
 *     stations de métro à leurs étiquettes ;
 *   - à Toulouse et en Île-de-France, les gares des lignes de métro en chantier qui ouvrent avant celles du joueur
 *     (data/<ville>/stations-futures.json), comptées comme du métro ;
 *   - les arrêts des relations de lignes de métro et de tram en service, que scripts/lignes-osm.mjs garde dans
 *     data/osm/<ville>/lignes.json. Certains arrêts n'ont pas les étiquettes que cherche la couche « stops » : les
 *     trams-trains (T11 au Bourget, T14 à Esbly), l'Orlyval, le Rhônexpress à l'aéroport, ou des stations de métro
 *     dessinées comme des surfaces (Pont de Neuilly, Créteil-Préfecture). Le genre vient alors de la ligne : le métro
 *     (route=subway) donne 1, le tram et le tram-train (route=tram ou light_rail) donnent 0. Un arrêt à moins de 30 m
 *     d'un arrêt déjà retenu du même genre est le même arrêt : on ne l'ajoute pas.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const VILLES = ['lyon', 'toulouse', 'marseille', 'nice', 'idf']
const dossier = (ville) => (ville === 'lyon' ? [] : [ville])
const lireJson = (chemin) => JSON.parse(readFileSync(chemin, 'utf8'))
const arrondi = (v) => Math.round(v * 1e5) / 1e5

/** Le genre d'un arrêt selon la ligne qui s'y arrête : 1 pour le métro, 0 pour le tram et le tram-train. */
const GENRE = { subway: 1, tram: 0, light_rail: 0 }
/** En deçà, deux arrêts du même genre sont le même arrêt, en mètres. */
const DOUBLON = 30

const metres = (a, b) => Math.hypot((a[0] - b[0]) * 111320 * Math.cos((a[1] * Math.PI) / 180), (a[1] - b[1]) * 111320)

const cleNom = (nom) =>
  (nom ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

/**
 * Une ligne de métro ou de tram en service et ouverte à tous. Comme dans scripts/lignes-osm.mjs, on écarte les lignes
 * touristiques, fermées ou en projet, les trains régionaux sur voies de tram-train (TER), les navettes des soirs de
 * match (TN) et la navette LISA de Roissy, derrière les contrôles de sûreté. On écarte aussi toute relation qui porte
 * une étiquette de chantier ou de projet, ou une date d'ouverture à venir : le métro 15, le Val'Tram d'Aubagne. Les
 * lignes en chantier qui comptent déjà viennent de stations-futures.json. Une relation sans réseau n'est pas une ligne
 * de transport public : le tramway hippomobile de Disneyland Paris.
 */
function enService(t) {
  if (GENRE[t.route] === undefined || !t.network) return false
  if (/touristique|historique|museum|disused|proposed|construction/i.test(`${t.name ?? ''} ${t.state ?? ''} ${t.service ?? ''}`))
    return false
  if (Object.keys(t).some((k) => /^(construction|proposed|planned|disused|abandoned|razed)(:|_|$)/.test(k))) return false
  const ouverture = t.opening_date ?? t.start_date
  if (ouverture && ouverture > new Date().toISOString().slice(0, 10)) return false
  if (/^(TER|TN)\s?\d/i.test(t.ref ?? '') || /\bTER\b|SNCF Voyageurs/i.test(`${t.network} ${t.operator ?? ''}`)) return false
  return !/^LISA$/i.test(t.name ?? '')
}

/**
 * Les arrêts d'une relation, comme les stations de scripts/lignes-osm.mjs : ses positions d'arrêt, et ses quais quand
 * elle n'en a aucune, ou quand aucune position d'arrêt de leur nom n'est à moins de 300 m.
 */
function arretsDe(relation, noeuds) {
  const liste = []
  for (const m of relation.members) {
    const quai = /^platform(_entry_only|_exit_only)?$/.test(m.role)
    if (!quai && !/^stop(_entry_only|_exit_only)?$/.test(m.role)) continue
    const n = m.type === 'node' ? noeuds.get(m.ref) : null
    const pos = n
      ? [n.lon, n.lat]
      : m.geometry?.length
        ? [m.geometry.reduce((t, g) => t + g.lon, 0) / m.geometry.length, m.geometry.reduce((t, g) => t + g.lat, 0) / m.geometry.length]
        : null
    if (pos) liste.push({ pos, quai, nom: cleNom(n?.tags?.name) })
  }
  const positions = liste.filter((a) => !a.quai)
  const orphelin = (q) => q.nom !== '' && !positions.some((a) => a.nom === q.nom || metres(a.pos, q.pos) < 300)
  return liste.filter((a) => !a.quai || !positions.length || orphelin(a)).map((a) => a.pos)
}

/** Les arrêts d'un réseau, et combien viennent des relations de lignes seulement. */
export function arretsExistants(ville) {
  if (!VILLES.includes(ville)) throw new Error(`Ville inconnue : ${ville}`)
  const osm = (nom) => join(racine, 'data', 'osm', ...dossier(ville), nom)
  const arrets = lireJson(osm('stops.json')).elements.map((e) => [
    arrondi(e.lon),
    arrondi(e.lat),
    e.tags?.subway === 'yes' || e.tags?.station === 'subway' ? 1 : 0,
  ])
  // Les gares des lignes de métro en chantier qui ouvrent avant celles du joueur (Toulouse et Île-de-France).
  if (ville !== 'lyon') {
    let futures = []
    try {
      futures = lireJson(join(racine, 'data', ville, 'stations-futures.json')).lignes
    } catch {
      // Pas de ligne en chantier dans ce réseau.
    }
    for (const l of futures) for (const s of l.stations.filter((s) => !s.existante)) arrets.push([arrondi(s.pos[0]), arrondi(s.pos[1]), 1])
  }
  let lignes
  try {
    lignes = lireJson(osm('lignes.json'))
  } catch {
    throw new Error(`${ville} : les lignes d'OpenStreetMap manquent (data/osm), lancez d'abord node scripts/lignes-osm.mjs ${ville}`)
  }
  const noeuds = new Map(lignes.elements.filter((e) => e.type === 'node').map((e) => [e.id, e]))
  let ajoutes = 0
  for (const r of lignes.elements.filter((e) => e.type === 'relation' && enService(e.tags ?? {}))) {
    const genre = GENRE[r.tags.route]
    for (const [lon, lat] of arretsDe(r, noeuds)) {
      const p = [arrondi(lon), arrondi(lat), genre]
      if (arrets.some((a) => a[2] === genre && metres(a, p) < DOUBLON)) continue
      arrets.push(p)
      ajoutes += 1
    }
  }
  return { arrets, ajoutes }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const demandees = process.argv.slice(2)
  for (const ville of demandees.length ? demandees : VILLES) {
    const { arrets, ajoutes } = arretsExistants(ville)
    writeFileSync(join(racine, 'public', 'data', ...dossier(ville), 'arrets.json'), JSON.stringify(arrets))
    const metro = arrets.filter((a) => a[2] === 1).length
    console.log(
      `${ville} : ${arrets.length} arrêts (${metro} de métro, ${arrets.length - metro} de tram), dont ${ajoutes} tiré${ajoutes > 1 ? 's' : ''} des lignes`,
    )
  }
}
