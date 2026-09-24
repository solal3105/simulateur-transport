import { Communaute } from '@/components/communaute/Communaute'
import { affichage, metadonneesCommunaute } from '@/lib/pages'

export const metadata = metadonneesCommunaute('toulouse')
export const viewport = affichage('toulouse')

export default function Page() {
  return <Communaute ville="toulouse" />
}
