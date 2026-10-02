import { StyleReseau } from '@/components/couleurs'
import { DonneesStructurees } from '@/components/DonneesStructurees'
import { Jeu } from '@/components/Jeu'
import { affichage, metadonnees } from '@/lib/pages'

export const metadata = metadonnees('toulouse')
export const viewport = affichage('toulouse')

export default function Page() {
  return (
    <>
      <StyleReseau ville="toulouse" />
      <DonneesStructurees ville="toulouse" />
      <Jeu ville="toulouse" />
    </>
  )
}
