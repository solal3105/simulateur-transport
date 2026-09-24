import { StyleReseau } from '@/components/couleurs'
import { Jeu } from '@/components/Jeu'
import { affichage, metadonnees } from '@/lib/pages'

export const metadata = metadonnees('nice')
export const viewport = affichage('nice')

export default function Page() {
  return (
    <>
      <StyleReseau ville="nice" />
      <Jeu ville="nice" />
    </>
  )
}
