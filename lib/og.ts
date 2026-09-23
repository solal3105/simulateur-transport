import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Les polices des images d'aperçu, lues une seule fois ; sans elles, l'image sort avec la police par défaut. */
export const polices = Promise.all(
  (['700', '900'] as const).map(async (graisse) => ({
    name: 'Figtree',
    data: await readFile(join(process.cwd(), `assets/polices/Figtree-${graisse}.ttf`)),
    weight: Number(graisse) as 700 | 900,
    style: 'normal' as const,
  })),
).catch(() => [])

export const ROUGE = '#e3051b'
export const SABLE = '#f4f1ec'
