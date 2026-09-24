import { StyleReseau } from '@/components/couleurs'
import { Jeu } from '@/components/Jeu'
import { affichage, metadonnees } from '@/lib/pages'

export const metadata = metadonnees('idf')
export const viewport = affichage('idf')

export default function Page() {
  return (
    <>
      <StyleReseau ville="idf" />
      <Jeu ville="idf" />
    </>
  )
}
