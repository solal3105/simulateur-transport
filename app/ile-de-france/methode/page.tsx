import { StyleReseau } from '@/components/couleurs'
import { PageMethode } from '@/components/explications/PageMethode'
import { affichage, metadonneesMethode } from '@/lib/pages'

export const metadata = metadonneesMethode('idf')
export const viewport = affichage('idf')

export default function Page() {
  return (
    <>
      <StyleReseau ville="idf" />
      <PageMethode ville="idf" />
    </>
  )
}
