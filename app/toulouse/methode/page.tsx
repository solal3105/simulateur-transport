import { StyleReseau } from '@/components/couleurs'
import { PageMethode } from '@/components/explications/PageMethode'
import { affichage, metadonneesMethode } from '@/lib/pages'

export const metadata = metadonneesMethode('toulouse')
export const viewport = affichage('toulouse')

export default function Page() {
  return (
    <>
      <StyleReseau ville="toulouse" />
      <PageMethode ville="toulouse" />
    </>
  )
}
