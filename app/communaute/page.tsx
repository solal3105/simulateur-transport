import type { Metadata } from 'next'

import { Communaute } from '@/components/communaute/Communaute'

export const metadata: Metadata = {
  title: 'Les réseaux publiés | Simulateur TCL',
  description:
    'Les réseaux de transport imaginés par les joueurs du simulateur, à soutenir, à comparer au sien ou à reprendre pour sa propre partie.',
}

export default function Page() {
  return <Communaute />
}
