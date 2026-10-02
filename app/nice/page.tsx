import { StyleReseau } from '@/components/couleurs'
import { DonneesStructurees } from '@/components/DonneesStructurees'
import { Jeu } from '@/components/Jeu'
import { affichage, metadonnees } from '@/lib/pages'

export const metadata = metadonnees('nice')
export const viewport = affichage('nice')

export default function Page() {
  return (
    <>
      <StyleReseau ville="nice" />
      <DonneesStructurees ville="nice" />
      <Jeu ville="nice" />
    </>
  )
}
