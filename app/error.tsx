'use client'

import { Bouton, BoutonLien, Logo } from '@/components/ui'
import { MARQUE } from '@/lib/villes'

/**
 * L'écran qui remplace une page plantée, à la place de celui de Next.js, en anglais et tout noir. La partie est
 * enregistrée dans le navigateur à chaque choix : recharger la page la reprend là où elle en était. On recharge
 * vraiment plutôt que de redessiner la page, car un plantage peut venir d'une page modifiée par une extension ou un
 * traducteur, qu'un simple nouveau rendu ne réparerait pas.
 */
export default function PagePlantee() {
  return (
    <main className="min-h-dvh bg-rouge text-white">
      <div className="mx-auto flex min-h-dvh max-w-[640px] flex-col gap-5 px-6 pt-5 pb-10 lg:pt-10">
        <div className="flex items-center gap-2.5">
          <Logo taille={38} inverse />
          <span className="text-[15px] font-extrabold lg:text-[17px]">{MARQUE}</span>
        </div>
        <h1 className="mt-6 text-[40px] leading-[0.95] font-black tracking-[-0.03em] lg:text-[56px]">La page s’est arrêtée.</h1>
        <p className="max-w-[500px] text-base leading-relaxed font-medium lg:text-[18px]">
          Vos choix sont enregistrés dans ce navigateur : rechargez la page pour reprendre la partie là où vous en étiez. Si cela
          recommence, dites-nous ce que vous faisiez avec le bouton « Bug ou amélioration ».
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Bouton genre="blanc" icone="fleche" taille="grand" onClick={() => window.location.reload()}>
            Recharger la page
          </Bouton>
          <BoutonLien href="/" genre="contourBlanc" taille="grand">
            Aller à l’accueil
          </BoutonLien>
        </div>
      </div>
    </main>
  )
}
