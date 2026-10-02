import { DonneesStructurees } from '@/components/DonneesStructurees'
import { Jeu } from '@/components/Jeu'

export default function Page() {
  return (
    <>
      <DonneesStructurees ville="lyon" />
      <Jeu />
    </>
  )
}
