import type { Metadata } from 'next'

import { Communaute } from '@/components/communaute/Communaute'
import { MARQUE } from '@/lib/villes'

export const metadata: Metadata = {
  title: `Les réseaux publiés | ${MARQUE}`,
  description:
    'Les réseaux de transport imaginés par les joueurs du simulateur, à soutenir, à comparer au sien ou à reprendre pour sa propre partie.',
}

export default function Page() {
  return <Communaute />
}
