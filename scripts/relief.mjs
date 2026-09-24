// Relève l'altitude d'un réseau sur une grille régulière, avec l'API d'altimétrie de l'IGN (RGE ALTI,
// licence ouverte), et l'écrit dans public/data/<dossier>/relief.json. Le jeu s'en sert pour le coût des
// lignes : une pente trop forte pour le mode demande un tunnel ou un viaduc.
//
//   node scripts/relief.mjs lyon
//
// Le fichier contient l'origine (coin sud-ouest), le pas en degrés, la taille de la grille, et les
// altitudes en mètres, ligne par ligne du sud au nord, encodées en entiers de 16 bits puis en base 64.
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

// La zone couvre celle où l'on peut chercher un lieu dans le traceur ; le pas suit le relief et la taille.
const RESEAUX = {
  lyon: { dossier: '', zone: [4.68, 45.64, 5.12, 45.88], pas: 200 },
  toulouse: { dossier: 'toulouse', zone: [0.98, 43.33, 1.78, 43.82], pas: 250 },
  marseille: { dossier: 'marseille', zone: [4.7, 43.13, 5.85, 43.8], pas: 250 },
  nice: { dossier: 'nice', zone: [6.76, 43.6, 7.46, 44.38], pas: 200 },
  idf: { dossier: 'idf', zone: [1.43, 48.1, 3.57, 49.25], pas: 400 },
}

const id = process.argv[2]
const reseau = RESEAUX[id]
if (!reseau) throw new Error(`Réseau inconnu : ${id}. Choix : ${Object.keys(RESEAUX).join(', ')}`)

const [ouest, sud, est, nord] = reseau.zone
const latitude = (sud + nord) / 2
const dlat = reseau.pas / 111320
const dlon = reseau.pas / (111320 * Math.cos((latitude * Math.PI) / 180))
const nx = Math.ceil((est - ouest) / dlon) + 1
const ny = Math.ceil((nord - sud) / dlat) + 1
const points = []
for (let j = 0; j < ny; j += 1) for (let i = 0; i < nx; i += 1) points.push([ouest + i * dlon, sud + j * dlat])
console.log(`${id} : ${nx} × ${ny} = ${points.length} points, pas de ${reseau.pas} m`)

const altitudes = new Int16Array(points.length)
const PAQUET = 5000
for (let debut = 0; debut < points.length; debut += PAQUET) {
  const paquet = points.slice(debut, debut + PAQUET)
  let reponse
  for (let essai = 1; essai <= 4; essai += 1) {
    try {
      const r = await fetch('https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lon: paquet.map((p) => p[0].toFixed(5)).join('|'),
          lat: paquet.map((p) => p[1].toFixed(5)).join('|'),
          resource: 'ign_rge_alti_wld',
          zonly: 'true',
        }),
      })
      if (!r.ok) throw new Error(`réponse ${r.status}`)
      reponse = await r.json()
      break
    } catch (e) {
      console.log(`  paquet ${debut} : ${e.message}, nouvel essai`)
      await new Promise((ok) => setTimeout(ok, 3000 * essai))
    }
  }
  if (!reponse) throw new Error(`Le paquet ${debut} n'a pas pu être relevé`)
  // La mer et les zones sans mesure valent -99999 : on les met au niveau de la mer.
  reponse.elevations.forEach((z, k) => (altitudes[debut + k] = z < -1000 ? 0 : Math.round(z)))
  process.stdout.write(`  ${Math.min(debut + PAQUET, points.length)} / ${points.length}\r`)
}

const sortie = join(racine, 'public', 'data', ...(reseau.dossier ? [reseau.dossier] : []), 'relief.json')
writeFileSync(
  sortie,
  JSON.stringify({
    source: 'IGN, RGE ALTI, licence ouverte',
    origine: [Number(ouest.toFixed(6)), Number(sud.toFixed(6))],
    pas: [Number(dlon.toFixed(8)), Number(dlat.toFixed(8))],
    taille: [nx, ny],
    z: Buffer.from(altitudes.buffer).toString('base64'),
  }),
)
console.log(`\n${sortie} écrit`)
