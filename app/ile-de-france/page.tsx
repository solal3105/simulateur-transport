import { StyleReseau } from '@/components/couleurs'
import { DonneesStructurees } from '@/components/DonneesStructurees'
import { Jeu } from '@/components/Jeu'
import { affichage, metadonnees } from '@/lib/pages'

export const metadata = metadonnees('idf')
export const viewport = affichage('idf')

export default function Page() {
  return (
    <>
      <StyleReseau ville="idf" />
      <DonneesStructurees ville="idf" />
      <Jeu ville="idf" />
    </>
  )
}
