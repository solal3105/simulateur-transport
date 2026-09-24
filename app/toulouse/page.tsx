import { StyleReseau } from '@/components/couleurs'
import { Jeu } from '@/components/Jeu'
import { affichage, metadonnees } from '@/lib/pages'

export const metadata = metadonnees('toulouse')
export const viewport = affichage('toulouse')

export default function Page() {
  return (
    <>
      <StyleReseau ville="toulouse" />
      <Jeu ville="toulouse" />
    </>
  )
}
