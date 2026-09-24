import { Communaute } from '@/components/communaute/Communaute'
import { affichage, metadonneesCommunaute } from '@/lib/pages'

export const metadata = metadonneesCommunaute('nice')
export const viewport = affichage('nice')

export default function Page() {
  return <Communaute ville="nice" />
}
