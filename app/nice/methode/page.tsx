import { StyleReseau } from '@/components/couleurs'
import { PageMethode } from '@/components/explications/PageMethode'
import { affichage, metadonneesMethode } from '@/lib/pages'

export const metadata = metadonneesMethode('nice')
export const viewport = affichage('nice')

export default function Page() {
  return (
    <>
      <StyleReseau ville="nice" />
      <PageMethode ville="nice" />
    </>
  )
}
