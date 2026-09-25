/**
 * Les lignes de métro, de tram et de téléphérique du réseau actuel, une par une, avec leurs stations dans
 * l'ordre, tirées des relations « route » d'OpenStreetMap. S'y ajoutent les lignes en chantier que la carte
 * dessine déjà comme existantes, parce qu'elles ouvrent avant celles du joueur (la ligne C à Toulouse, le
 * Grand Paris Express) : leurs gares viennent de data/<ville>/stations-futures.json.
 *
 * Le fichier sert à montrer les stations du réseau et le nom de chaque ligne, à accrocher une nouvelle station
 * sur une correspondance et à prolonger une ligne depuis son terminus. Il ne touche pas aux données du modèle
 * de fréquentation.
 *
 *   node scripts/lignes-osm.mjs            toutes les villes
 *   node scripts/lignes-osm.mjs toulouse   une seule ville
 *
 * Les réponses brutes vont dans data/osm/<ville>/lignes.json (non versionné), le résultat dans
 * public/data/<dossier>/lignes.json.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

// Sud, ouest, nord, est : la zone où chercher les lignes de chaque réseau.
const VILLES = {
  lyon: { dossier: '', zone: '45.62,4.70,45.88,5.12' },
  toulouse: { dossier: 'toulouse', zone: '43.50,1.30,43.72,1.56' },
  marseille: { dossier: 'marseille', zone: '43.14,4.70,43.80,5.85' },
  nice: { dossier: 'nice', zone: '43.63,7.10,43.80,7.40' },
  idf: { dossier: 'idf', zone: '48.10,1.43,49.25,3.57' },
}

const SERVEURS = [
  process.env.OVERPASS_URL ?? 'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

async function interroger(requete) {
  for (let essai = 0; essai < 9; essai += 1) {
    const serveur = SERVEURS[essai % SERVEURS.length]
    const r = await fetch(serveur, {
      method: 'POST',
      headers: { 'User-Agent': 'simulateur-transport-tcl', Accept: 'application/json' },
      body: new URLSearchParams({ data: requete }),
    }).catch((e) => ({ ok: false, status: e.cause?.code ?? e.message }))
    if (r.ok) {
      const texte = await r.text()
      if (texte.trim().startsWith('{')) return JSON.parse(texte)
    }
    console.log(`  ${serveur} : ${r.status}, nouvel essai`)
    await new Promise((f) => setTimeout(f, 8000 * (essai + 1)))
  }
  throw new Error('OpenStreetMap ne répond pas')
}

const MODE = { subway: 'metro', tram: 'tram', light_rail: 'tram', aerialway: 'cable' }

// Un second réseau peut porter les mêmes noms de lignes que le principal : le tram T1 d'Aubagne n'est pas celui de
// Marseille. Ses lignes prennent le nom de leur ville.
const RESEAUX_SECONDAIRES = { "Lignes de l'Agglo": 'Aubagne' }
const arrondi = (v) => Math.round(v * 1e5) / 1e5

/** Le nom d'une station sans accents, tirets ni espaces : « Gare Part-Dieu - Villette » et « Gare Part-Dieu Villette » se retrouvent. */
const cleNom = (nom) =>
  (nom ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

/**
 * Le nom d'une station tel qu'on le montre. Le quai d'un sens porte parfois sa direction, « Grand Arénas (dir
 * aéroport) », qui n'est pas le nom de la station ; les tirets longs deviennent des tirets simples, comme partout
 * sur la carte.
 */
const nomStation = (nom) =>
  (nom ?? '')
    .replace(/\s*\((?:dir|direction)\b[^)]*\)\s*$/i, '')
    .replace(/\s*[\u2013\u2014]\s*/g, ' - ')
    .trim()

/** Le nom de la ligne tel qu'on le montre : « A », « T1 », « 14 », « Téléo ». */
function reference(tags) {
  const brute = tags.ref
    ? tags.ref.replace(/^Ligne\s+/i, '').trim()
    : /(?:ligne|line|tram|métro|metro)\s+([A-Z0-9]+[a-z]?)/i.exec(tags.name ?? '')?.[1]
  if (!brute) return null
  return /^\p{L}{4,}$/u.test(brute) ? brute.charAt(0).toUpperCase() + brute.slice(1) : brute
}

/** Ce qui n'est pas une ligne régulière ouverte à tous : tramways touristiques, projets, lignes fermées, trains régionaux. */
function horsReseau(t) {
  if (/touristique|historique|museum|disused|proposed|construction/i.test(`${t.name ?? ''} ${t.state ?? ''} ${t.service ?? ''}`))
    return true
  if (t.route === 'aerialway' && !/gondola|cable_car/.test(t.aerialway ?? 'gondola')) return true
  // Les trains régionaux sur voies de tram-train et les navettes des soirs d'événement.
  if (/^(TER|TN)\s?\d/i.test(t.ref ?? '') || /\bTER\b|SNCF Voyageurs/i.test(`${t.network ?? ''} ${t.operator ?? ''}`)) return true
  // La navette LISA de l'aéroport Charles-de-Gaulle circule derrière les contrôles de sûreté.
  if (/^LISA$/i.test(t.name ?? '')) return true
  return false
}

/** Les stations d'une relation, dans l'ordre : les positions d'arrêt, à défaut les quais. */
function stationsDe(relation, noeuds) {
  const arrets = []
  for (const m of relation.members) {
    if (!/^(stop|stop_entry_only|stop_exit_only|platform|platform_entry_only|platform_exit_only)$/.test(m.role)) continue
    const n = m.type === 'node' ? noeuds.get(m.ref) : null
    const pos = n ? [n.lon, n.lat] : m.type === 'node' && m.lon ? [m.lon, m.lat] : m.geometry?.length ? moyenne(m.geometry) : null
    if (!pos) continue
    arrets.push({ nom: nomStation(n?.tags?.name), pos: pos.map(arrondi), quai: m.role.startsWith('platform') })
  }
  const positions = arrets.some((a) => !a.quai) ? arrets.filter((a) => !a.quai) : arrets
  // Deux arrêts de suite au même nom sont la même station (les deux quais, ou le quai et la position).
  const stations = []
  for (const a of positions) {
    const precedente = stations.at(-1)
    if (precedente && a.nom && cleNom(precedente.nom) === cleNom(a.nom)) continue
    if (precedente && Math.hypot(precedente.pos[0] - a.pos[0], (precedente.pos[1] - a.pos[1]) * 1.4) < 0.0008) continue
    stations.push({ nom: a.nom, pos: a.pos })
  }
  return stations
}

const moyenne = (geometrie) => [
  geometrie.reduce((t, g) => t + g.lon, 0) / geometrie.length,
  geometrie.reduce((t, g) => t + g.lat, 0) / geometrie.length,
]

/**
 * Les branches d'une ligne : une relation par sens, parfois une par branche ou par service partiel. On ne garde
 * qu'un exemplaire de chaque parcours, et on écarte ceux qui sont contenus dans un autre, comme un service qui
 * s'arrête avant le terminus.
 */
function branchesDistinctes(listes) {
  const suite = (stations) => `|${stations.map((s) => cleNom(s.nom) || s.pos.join(',')).join('|')}|`
  const triees = [...listes].sort((a, b) => b.length - a.length)
  const gardees = []
  for (const stations of triees) {
    const aller = suite(stations)
    const retour = suite([...stations].reverse())
    if (gardees.some((g) => g.cle.includes(aller) || g.cle.includes(retour))) continue
    gardees.push({ cle: aller, stations })
  }
  return gardees.map((g) => g.stations)
}

function construire(brut) {
  const noeuds = new Map(brut.elements.filter((e) => e.type === 'node').map((e) => [e.id, e]))
  const groupes = new Map()
  for (const r of brut.elements.filter((e) => e.type === 'relation' && MODE[e.tags?.route])) {
    const t = r.tags
    if (horsReseau(t)) continue
    const ref = reference(t)
    if (!ref) continue
    const mode = MODE[t.route]
    const stations = stationsDe(r, noeuds)
    if (stations.length < 2) continue
    const lieu = RESEAUX_SECONDAIRES[t.network] ?? null
    const cle = `${mode}:${ref}:${lieu}`
    const groupe = groupes.get(cle) ?? { mode, ref, lieu, couleur: null, listes: [] }
    groupe.listes.push(stations)
    if (!groupe.couleur && /^#[0-9a-f]{6}$/i.test(t.colour ?? '')) groupe.couleur = t.colour.toLowerCase()
    groupes.set(cle, groupe)
  }
  return [...groupes.values()].map((g) => ({
    id: g.lieu ? `${g.mode}-${g.ref}-${g.lieu}` : `${g.mode}-${g.ref}`,
    mode: g.mode,
    ref: g.ref,
    // Une ligne qui porte un vrai nom (Téléo, Rhônexpress) le garde ; les autres s'appellent « Métro A », « Tram T1 ».
    nom:
      (/^\p{L}{4,}$/u.test(g.ref) ? g.ref : `${g.mode === 'metro' ? 'Métro' : g.mode === 'tram' ? 'Tram' : 'Téléphérique'} ${g.ref}`) +
      (g.lieu ? ` d’${g.lieu}` : ''),
    couleur: g.couleur,
    branches: branchesDistinctes(g.listes),
  }))
}

// Les listes de gares de data/idf/stations-futures.json omettent les gares déjà ouvertes sur une autre ligne, qui ne
// changent rien aux habitants desservis. Pour montrer la ligne entière, on les remet à leur place, à la position de
// la gare existante : [gare qui précède, gare omise], la première gare de la ligne quand rien ne la précède.
const GARES_OMISES = {
  idf: {
    15: [
      ['Arcueil - Cachan', 'Villejuif - Gustave Roussy'],
      ['Bondy', 'Rosny - Bois-Perrier'],
    ],
    18: [[null, "Aéroport d'Orly"]],
  },
}

// La ligne 15 fera le tour de Paris, avec une antenne jusqu'à Noisy - Champs. Sa liste donne d'abord le tronçon sud, de
// Pont de Sèvres à Noisy - Champs, puis l'ouest et l'est, de Saint-Cloud à Nogent - Le Perreux : on la parcourt depuis
// son seul terminus, Noisy - Champs, et on la referme à Champigny Centre, où elle passe déjà.
const BOUCLES = { idf: { 15: { reprise: 'Saint-Cloud', fermeture: 'Champigny Centre' } } }

/**
 * Les lignes en chantier que la carte dessine déjà : une ligne nouvelle s'ajoute au réseau, un prolongement allonge
 * la branche dont il part. Chaque gare porte la date d'ouverture de la ligne, pour le dire à qui la survole.
 */
function ajouterFutures(ville, lignes) {
  const chemin = join(racine, 'data', ville, 'stations-futures.json')
  if (!existsSync(chemin)) return lignes
  const existantes = lignes.flatMap((l) => l.branches.flat())
  const gareExistante = (nom) => {
    const trouvee = existantes.find((s) => cleNom(s.nom) === cleNom(nom))
    if (!trouvee) throw new Error(`${ville} : gare existante introuvable, ${nom}`)
    return trouvee
  }
  for (const future of JSON.parse(readFileSync(chemin, 'utf8')).lignes) {
    let gares = future.stations.map((s) => ({ nom: nomStation(s.nom), pos: s.pos.map(arrondi) }))
    for (const [avant, nom] of GARES_OMISES[ville]?.[future.ligne] ?? []) {
      const rang = avant === null ? 0 : gares.findIndex((g) => g.nom === avant) + 1
      if (avant !== null && rang === 0) throw new Error(`${ville} : gare introuvable sur la ligne ${future.ligne}, ${avant}`)
      gares.splice(rang, 0, { nom, pos: gareExistante(nom).pos })
    }
    const boucle = BOUCLES[ville]?.[future.ligne]
    if (boucle) {
      const reprise = gares.findIndex((g) => g.nom === boucle.reprise)
      gares = [...gares.slice(0, reprise).reverse(), ...gares.slice(reprise), gares.find((g) => g.nom === boucle.fermeture)]
    }
    gares = gares.map((g) => ({ ...g, ouverture: future.ouverture }))
    const ligne = lignes.find((l) => l.mode === 'metro' && l.ref === future.ligne)
    if (ligne) {
      // Un prolongement : il part du terminus d'une branche, qu'on allonge de ses gares nouvelles.
      const depart = cleNom(gares[0].nom)
      const suite = gares.slice(1)
      let allongee = false
      ligne.branches = ligne.branches.map((b) => {
        if (cleNom(b.at(-1).nom) === depart) return ((allongee = true), [...b, ...suite])
        if (cleNom(b[0].nom) === depart) return ((allongee = true), [...[...suite].reverse(), ...b])
        return b
      })
      if (!allongee) throw new Error(`${ville} : la ligne ${future.ligne} ne finit pas à ${gares[0].nom}`)
    } else {
      lignes.push({
        id: `metro-${future.ligne}`,
        mode: 'metro',
        ref: future.ligne,
        nom: `Métro ${future.ligne}`,
        couleur: null,
        branches: [gares],
      })
    }
  }
  return lignes
}

const demandees = process.argv.slice(2)
for (const [ville, { dossier, zone }] of Object.entries(VILLES)) {
  if (demandees.length && !demandees.includes(ville)) continue
  const brutChemin = join(racine, 'data', 'osm', ...(ville === 'lyon' ? [] : [ville]), 'lignes.json')
  let brut
  if (existsSync(brutChemin) && process.env.RAFRAICHIR !== '1') brut = JSON.parse(readFileSync(brutChemin, 'utf8'))
  else {
    console.log(`${ville} : interrogation d'OpenStreetMap`)
    brut = await interroger(
      `[out:json][timeout:240];rel["route"~"^(subway|tram|light_rail|aerialway)$"](${zone})->.r;.r out geom;node(r.r);out;`,
    )
    mkdirSync(dirname(brutChemin), { recursive: true })
    writeFileSync(brutChemin, JSON.stringify(brut))
  }
  const lignes = ajouterFutures(ville, construire(brut)).sort(
    (a, b) => a.mode.localeCompare(b.mode) || a.ref.localeCompare(b.ref, 'fr', { numeric: true }),
  )
  const sortie = join(racine, 'public', 'data', ...(dossier ? [dossier] : []), 'lignes.json')
  writeFileSync(sortie, JSON.stringify({ lignes }))
  console.log(
    `${ville} : ${lignes.length} lignes (${lignes.map((l) => `${l.ref} ${l.branches.map((b) => b.length).join('+')}`).join(', ')}), ` +
      `${Math.round(JSON.stringify({ lignes }).length / 1024)} Ko`,
  )
}
