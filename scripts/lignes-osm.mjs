/**
 * Les lignes de métro, de tram et de téléphérique du réseau actuel, une par une, avec leurs stations dans
 * l'ordre, tirées des relations « route » d'OpenStreetMap ; en Île-de-France, aussi les RER et les trains
 * Transilien, avec le tracé de leurs voies. S'y ajoutent les lignes en chantier que la carte dessine déjà
 * comme existantes, parce qu'elles ouvrent avant celles du joueur (la ligne C à Toulouse, le Grand Paris
 * Express) : leurs gares viennent de data/<ville>/stations-futures.json.
 *
 * Le fichier sert à montrer les stations du réseau et le nom de chaque ligne, à accrocher une nouvelle station
 * sur une correspondance et à prolonger une ligne depuis son terminus. Il ne touche pas aux données du modèle
 * de fréquentation : le RER n'y compte pas comme une desserte existante.
 *
 *   node scripts/lignes-osm.mjs            toutes les villes
 *   node scripts/lignes-osm.mjs toulouse   une seule ville
 *
 * Les réponses brutes vont dans data/osm/<ville>/lignes.json, et pour l'Île-de-France trains.json et
 * quais.json (non versionnés) ; le résultat dans public/data/<dossier>/lignes.json.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

// Sud, ouest, nord, est : la zone où chercher les lignes de chaque réseau. En Île-de-France, on prend aussi les RER et
// les trains Transilien.
const VILLES = {
  lyon: { dossier: '', zone: '45.62,4.70,45.88,5.12' },
  toulouse: { dossier: 'toulouse', zone: '43.50,1.30,43.72,1.56' },
  marseille: { dossier: 'marseille', zone: '43.14,4.70,43.80,5.85' },
  nice: { dossier: 'nice', zone: '43.63,7.10,43.80,7.40' },
  idf: { dossier: 'idf', zone: '48.10,1.43,49.25,3.57', trains: true },
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
 * aéroport) », ou sa voie, et une gare son réseau entre parenthèses : ce n'est pas le nom de la station. Les
 * tirets longs deviennent des tirets simples, comme partout sur la carte.
 */
const nomStation = (nom) => {
  const propre = (nom ?? '')
    .replace(/\s*[\u2013\u2014]\s*/g, ' - ')
    .replace(/\s*\((?:dir|direction)\b[^)]*\)\s*$/i, '')
    // « Val-de-Fontenay (RER A) », « Charles de Gaulle - Étoile (RER) » : le réseau entre parenthèses n'est pas le nom.
    .replace(/\s*\((?:RER|Transilien|SNCF|métro|metro)\b[^)]*\)\s*$/i, '')
    // Le quai d'une gare porte parfois sa voie : « Paris Gare du Nord - Voie 42 ».
    .replace(/\s*-?\s*Voie\s+\w+$/i, '')
    .replace(/^Paris[\s-]+(?=Gare\b)/, '')
    .trim()
  return NOMS_GARES.get(cleNom(propre)) ?? propre
}

/**
 * Les gares dont le nom dans OpenStreetMap n'est pas celui qu'on lit sur un plan. Les grandes gares parisiennes portent
 * parfois « Paris » devant leur nom : on garde celui de leur station de métro, écrit de la même façon sur toutes les
 * lignes (« Gare de L'Est » sur certaines). D'autres ont « Gare » devant leur nom ou un nom abrégé. On compare les noms
 * sans tirets, espaces ni apostrophes : « Paris-Saint-Lazare » est « Paris Saint-Lazare ».
 */
const NOMS_GARES = new Map(
  Object.entries({
    'Gare d’Austerlitz': 'Gare d’Austerlitz',
    'Gare de l’Est': 'Gare de l’Est',
    'Paris Austerlitz': 'Gare d’Austerlitz',
    'Paris Austerlitz RER': 'Gare d’Austerlitz',
    'Paris Montparnasse': 'Gare Montparnasse',
    'Paris Montparnasse 3 - Vaugirard': 'Gare Montparnasse',
    'Paris Saint-Lazare': 'Saint-Lazare',
    'Paris Est': 'Gare de l’Est',
    'Gare Albigny - Neuville': 'Albigny-Neuville',
    'Gare d’Istres': 'Istres',
    Salon: 'Salon-de-Provence',
  }).map(([avant, apres]) => [cleNom(avant), apres]),
)

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
function stationsDe(relation, noeuds, quais = new Map()) {
  const arrets = []
  for (const m of relation.members) {
    if (!/^(stop|stop_entry_only|stop_exit_only|platform|platform_entry_only|platform_exit_only)$/.test(m.role)) continue
    const n = m.type === 'node' ? noeuds.get(m.ref) : null
    const pos = n ? [n.lon, n.lat] : m.type === 'node' && m.lon ? [m.lon, m.lat] : m.geometry?.length ? moyenne(m.geometry) : null
    if (!pos) continue
    const nom = n?.tags?.name ?? (m.type === 'way' ? quais.get(m.ref) : undefined)
    arrets.push({ nom: nomStation(nom), pos: pos.map(arrondi), quai: m.role.startsWith('platform') })
  }
  // Les positions d'arrêt d'abord ; un quai compte aussi quand aucun arrêt de son nom n'est tout près, comme à Poissy
  // sur le RER A, dont l'arrêt manque dans OpenStreetMap.
  const arretsSeuls = arrets.filter((a) => !a.quai)
  const orphelin = (q) =>
    q.nom !== '' &&
    !arretsSeuls.some(
      (a) => cleNom(a.nom) === cleNom(q.nom) || Math.hypot((a.pos[0] - q.pos[0]) * 73000, (a.pos[1] - q.pos[1]) * 111320) < 300,
    )
  const positions = arretsSeuls.length ? arrets.filter((a) => !a.quai || orphelin(a)) : arrets
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

/** Simplification de Douglas-Peucker, en degrés. */
function simplifier(points, tolerance) {
  if (points.length < 3) return points
  const [a, b] = [points[0], points.at(-1)]
  let [max, indice] = [0, 0]
  for (let i = 1; i < points.length - 1; i += 1) {
    const p = points[i]
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)))
    const d = Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy))
    if (d > max) [max, indice] = [d, i]
  }
  if (max <= tolerance) return [a, b]
  return [...simplifier(points.slice(0, indice + 1), tolerance).slice(0, -1), ...simplifier(points.slice(indice), tolerance)]
}

/** Met bout à bout les voies qui se touchent, pour dessiner quelques longs traits plutôt que des milliers de petits. */
function enchainer(voies) {
  const cle = (p) => `${p[0]},${p[1]}`
  const parBout = new Map()
  voies.forEach((v, i) => {
    for (const p of [v[0], v.at(-1)]) parBout.set(cle(p), [...(parBout.get(cle(p)) ?? []), i])
  })
  const prises = new Set()
  const voisine = (p) => (parBout.get(cle(p)) ?? []).find((i) => !prises.has(i))
  const chaines = []
  for (let i = 0; i < voies.length; i += 1) {
    if (prises.has(i)) continue
    prises.add(i)
    let chaine = [...voies[i]]
    for (let j = voisine(chaine.at(-1)); j !== undefined; j = voisine(chaine.at(-1))) {
      prises.add(j)
      const v = cle(voies[j][0]) === cle(chaine.at(-1)) ? voies[j] : [...voies[j]].reverse()
      chaine = [...chaine, ...v.slice(1)]
    }
    for (let j = voisine(chaine[0]); j !== undefined; j = voisine(chaine[0])) {
      prises.add(j)
      const v = cle(voies[j].at(-1)) === cle(chaine[0]) ? voies[j] : [...voies[j]].reverse()
      chaine = [...v.slice(0, -1), ...chaine]
    }
    chaines.push(chaine)
  }
  return chaines
}

// Dans OpenStreetMap, les relations du RER A vers Poissy s'arrêtent à Achères Grand Cormier, sans la gare de Poissy,
// qu'on reprend du train J.
const TERMINUS_OUBLIES = { A: { apres: 'Achères Grand Cormier', gare: 'Poissy' } }

/**
 * Remet à sa place une gare rangée au mauvais endroit dans une relation, comme Sartrouville listée après Marne-la-Vallée
 * sur le RER A : une gare qui allonge le parcours de plus de 2 km, quand on pourrait l'insérer ailleurs pour moitié
 * moins, est déplacée là où elle allonge le moins le parcours.
 */
function reordonner(stations) {
  const d = (a, b) => (a && b ? Math.hypot((a.pos[0] - b.pos[0]) * 73000, (a.pos[1] - b.pos[1]) * 111320) : 0)
  const cout = (liste, i) => d(liste[i - 1], liste[i]) + d(liste[i], liste[i + 1]) - d(liste[i - 1], liste[i + 1])
  let liste = [...stations]
  for (let tour = 0; tour < liste.length; tour += 1) {
    let deplacee = false
    for (let i = 0; i < liste.length && !deplacee; i += 1) {
      const actuel = cout(liste, i)
      if (actuel < 2000) continue
      const sans = [...liste.slice(0, i), ...liste.slice(i + 1)]
      let [meilleur, rang] = [Infinity, -1]
      for (let k = 0; k <= sans.length; k += 1) {
        const essai = d(sans[k - 1], liste[i]) + d(liste[i], sans[k]) - d(sans[k - 1], sans[k])
        if (essai < meilleur) [meilleur, rang] = [essai, k]
      }
      if (meilleur < actuel / 2) {
        liste = [...sans.slice(0, rang), liste[i], ...sans.slice(rang)]
        deplacee = true
      }
    }
    if (!deplacee) break
  }
  return liste
}

/**
 * Les RER et les trains Transilien d'Île-de-France. Le fond de carte ne les dessine pas comme le métro : on garde
 * donc le tracé de leurs voies, simplifié, pour les montrer comme des lignes du réseau actuel. Les RER vont de A à
 * E, les trains Transilien portent les autres lettres.
 */
function construireTrains(brut, quaisBruts) {
  const noeuds = new Map(brut.elements.filter((e) => e.type === 'node').map((e) => [e.id, e]))
  // Le nom des quais dessinés comme des surfaces, quand l'arrêt manque : ils ne sont pas dans la première requête.
  const quais = new Map(quaisBruts.elements.filter((e) => e.tags?.name).map((e) => [e.id, e.tags.name]))
  const groupes = new Map()
  for (const r of brut.elements.filter((e) => e.type === 'relation' && e.tags?.route === 'train')) {
    const t = r.tags
    const ref = (t.ref ?? '').trim()
    if (!/^[A-Z]$/.test(ref) || !/RER|Transilien/.test(t.network ?? '')) continue
    const stations = reordonner(stationsDe(r, noeuds, quais))
    if (stations.length < 2) continue
    const groupe = groupes.get(ref) ?? { ref, rer: /RER/.test(t.network), couleur: null, listes: [], voies: new Map() }
    groupe.listes.push(stations)
    for (const m of r.members) {
      if (m.type === 'way' && m.geometry?.length > 1 && !/^platform/.test(m.role)) {
        groupe.voies.set(
          m.ref,
          m.geometry.map((g) => [arrondi(g.lon), arrondi(g.lat)]),
        )
      }
    }
    if (!groupe.couleur && /^#[0-9a-f]{6}$/i.test(t.colour ?? '')) groupe.couleur = t.colour.toLowerCase()
    groupes.set(ref, groupe)
  }
  // Une gare que les relations d'OpenStreetMap oublient au bout d'une branche : on la remet, à la position de la même
  // gare sur une autre ligne.
  const toutes = [...groupes.values()].flatMap((g) => g.listes.flat())
  for (const [ref, { apres, gare }] of Object.entries(TERMINUS_OUBLIES)) {
    const groupe = groupes.get(ref)
    const position = toutes.find((s) => s.nom === gare)
    if (!groupe || !position) throw new Error(`gare introuvable pour la ligne ${ref} : ${gare}`)
    groupe.listes = groupe.listes.map((b) => (b[0].nom === apres ? [position, ...b] : b.at(-1).nom === apres ? [...b, position] : b))
  }
  return [...groupes.values()].map((g) => {
    const traits = enchainer([...g.voies.values()])
    const branches = branchesDistinctes(g.listes)
    return {
      id: `${g.rer ? 'rer' : 'train'}-${g.ref}`,
      mode: g.rer ? 'rer' : 'train',
      ref: g.ref,
      nom: `${g.rer ? 'RER' : 'Train'} ${g.ref}`,
      couleur: g.couleur,
      branches,
      terminus: terminusDesVoies(branches, traits),
      trace: traits.map((c) => simplifier(c, 0.00012)),
    }
  })
}

/**
 * Les terminus d'un RER ou d'un train : les bouts de ses branches où ses voies s'arrêtent aussi. OpenStreetMap coupe
 * parfois une ligne en tronçons, comme le RER C à Champ de Mars et à Choisy-le-Roi : le bout d'un tronçon où la voie
 * continue n'est pas un terminus.
 */
function terminusDesVoies(branches, traits) {
  const m = (a, b) => Math.hypot((a[0] - b[0]) * 73000, (a[1] - b[1]) * 111320)
  // Une voie passe par la gare quand elle s'en approche à moins de 250 m et continue plus d'un kilomètre de part et d'autre.
  const traversee = (s) =>
    traits.some((t) => {
      let [proche, rang] = [Infinity, -1]
      t.forEach((p, i) => {
        const d = m(p, s.pos)
        if (d < proche) [proche, rang] = [d, i]
      })
      if (proche > 250) return false
      const longueur = (morceau) => morceau.reduce((total, p, i) => (i ? total + m(morceau[i - 1], p) : 0), 0)
      return longueur(t.slice(0, rang + 1)) > 1000 && longueur(t.slice(rang)) > 1000
    })
  const traversees = new Set(branches.flatMap((b) => b.slice(1, -1).map((s) => cleNom(s.nom))))
  const noms = new Set()
  for (const b of branches) {
    for (const s of [b[0], b.at(-1)]) if (s.nom && !traversees.has(cleNom(s.nom)) && !traversee(s)) noms.add(s.nom)
  }
  return [...noms]
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
/** Les relations brutes d'OpenStreetMap, gardées dans data/osm pour ne pas interroger le serveur à chaque fois. */
async function lireOuInterroger(ville, fichier, requete) {
  const chemin = join(racine, 'data', 'osm', ...(ville === 'lyon' ? [] : [ville]), fichier)
  if (existsSync(chemin) && process.env.RAFRAICHIR !== '1') return JSON.parse(readFileSync(chemin, 'utf8'))
  console.log(`${ville} : interrogation d'OpenStreetMap`)
  const brut = await interroger(requete)
  mkdirSync(dirname(chemin), { recursive: true })
  writeFileSync(chemin, JSON.stringify(brut))
  return brut
}

/**
 * Les gares et les haltes ferroviaires du territoire, pour qu'on les repère sur la carte et qu'une station posée tout
 * près s'y accroche : on écarte les stations de métro, de tram et de funiculaire, les petits trains des parcs
 * d'attractions et les gares sans nom. Une gare est un point, ou une surface dont on prend le centre.
 */
function construireGares(brut) {
  const gares = []
  for (const e of brut.elements.filter((e) => e.tags?.name)) {
    const t = e.tags
    const [lon, lat] = e.type === 'node' ? [e.lon, e.lat] : [e.center?.lon, e.center?.lat]
    if (lon === undefined || lat === undefined) continue
    if (/^(subway|light_rail|tram|funicular|monorail|miniature)$/.test(t.station ?? '')) continue
    if ((t.subway === 'yes' || t.light_rail === 'yes' || t.tram === 'yes') && t.train !== 'yes') continue
    if (t.usage === 'tourism' || t.tourism || t['railway:historic'] || /touristique|historique|petit train|railroad|vélorail/i.test(t.name))
      continue
    // Une gare fermée garde souvent son bâtiment et son nom ; une gare en service a un exploitant, un réseau ou un code.
    if (t['disused:railway'] || t.disused || t.train === 'no') continue
    if (!(t.operator || t.network || t.train === 'yes' || t.public_transport || t.uic_ref || t['railway:ref'])) continue
    const nom = nomStation(t.name)
    // Une gare a parfois plusieurs éléments du même nom (le bâtiment, son emprise, un quai) : on n'en garde qu'un.
    if (gares.some((g) => cleNom(g.nom) === cleNom(nom) && Math.hypot((g.pos[0] - lon) * 73000, (g.pos[1] - lat) * 111320) < 500)) continue
    gares.push({ nom, pos: [arrondi(lon), arrondi(lat)] })
  }
  return gares.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
}

for (const [ville, { dossier, zone, trains }] of Object.entries(VILLES)) {
  if (demandees.length && !demandees.includes(ville)) continue
  const brut = await lireOuInterroger(
    ville,
    'lignes.json',
    `[out:json][timeout:240];rel["route"~"^(subway|tram|light_rail|aerialway)$"](${zone})->.r;.r out geom;node(r.r);out;`,
  )
  const ferroviaires = trains
    ? construireTrains(
        await lireOuInterroger(
          ville,
          'trains.json',
          `[out:json][timeout:300];rel["route"="train"]["network"~"RER|Transilien"](${zone})->.r;.r out geom;node(r.r);out;`,
        ),
        await lireOuInterroger(
          ville,
          'quais.json',
          `[out:json][timeout:240];rel["route"="train"]["network"~"RER|Transilien"](${zone});way(r)["public_transport"="platform"];out tags;`,
        ),
      )
    : []
  const lignes = [...ajouterFutures(ville, construire(brut)), ...ferroviaires].sort(
    (a, b) => a.mode.localeCompare(b.mode) || a.ref.localeCompare(b.ref, 'fr', { numeric: true }),
  )
  const gares = construireGares(
    await lireOuInterroger(ville, 'gares.json', `[out:json][timeout:180];nwr["railway"~"^(station|halt)$"](${zone});out center;`),
  )
  const sortie = join(racine, 'public', 'data', ...(dossier ? [dossier] : []), 'lignes.json')
  writeFileSync(sortie, JSON.stringify({ lignes, gares }))
  console.log(
    `${ville} : ${lignes.length} lignes (${lignes.map((l) => `${l.ref} ${l.branches.map((b) => b.length).join('+')}`).join(', ')}), ` +
      `${gares.length} gares, ${Math.round(JSON.stringify({ lignes, gares }).length / 1024)} Ko`,
  )
}
