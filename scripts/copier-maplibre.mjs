/**
 * MapLibre 6 calcule la carte dans un worker chargé comme module séparé.
 * Next.js ne le sert pas de lui-même : on le copie dans public/maplibre avant chaque lancement.
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'node_modules', 'maplibre-gl', 'dist')
const cible = join(root, 'public', 'maplibre')
mkdirSync(cible, { recursive: true })
for (const fichier of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(join(source, fichier), join(cible, fichier))
}
