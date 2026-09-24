import { StyleReseau } from '@/components/couleurs'
import { PageMethode } from '@/components/explications/PageMethode'
import { affichage, metadonneesMethode } from '@/lib/pages'

export const metadata = metadonneesMethode('marseille')
export const viewport = affichage('marseille')

export default function Page() {
  return (
    <>
      <StyleReseau ville="marseille" />
      <PageMethode ville="marseille" />
    </>
  )
}
