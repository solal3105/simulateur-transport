import { Communaute } from '@/components/communaute/Communaute'
import { affichage, metadonneesCommunaute } from '@/lib/pages'

export const metadata = metadonneesCommunaute('idf')
export const viewport = affichage('idf')

export default function Page() {
  return <Communaute ville="idf" />
}
