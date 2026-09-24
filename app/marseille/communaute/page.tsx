import { Communaute } from '@/components/communaute/Communaute'
import { affichage, metadonneesCommunaute } from '@/lib/pages'

export const metadata = metadonneesCommunaute('marseille')
export const viewport = affichage('marseille')

export default function Page() {
  return <Communaute ville="marseille" />
}
