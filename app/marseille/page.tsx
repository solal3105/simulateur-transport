import { StyleReseau } from '@/components/couleurs'
import { DonneesStructurees } from '@/components/DonneesStructurees'
import { Jeu } from '@/components/Jeu'
import { affichage, metadonnees } from '@/lib/pages'

export const metadata = metadonnees('marseille')
export const viewport = affichage('marseille')

export default function Page() {
  return (
    <>
      <StyleReseau ville="marseille" />
      <DonneesStructurees ville="marseille" />
      <Jeu ville="marseille" />
    </>
  )
}
