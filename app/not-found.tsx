import type { Metadata } from 'next'

import { BoutonLien, Logo } from '@/components/ui'

export const metadata: Metadata = { title: 'Page introuvable | Simulateur TCL' }

/** La page d'une adresse qui n'existe pas : ce qui s'est passé, et les deux endroits où aller. */
export default function PageIntrouvable() {
  return (
    <main className="min-h-dvh bg-rouge text-white">
      <div className="mx-auto flex min-h-dvh max-w-[640px] flex-col gap-5 px-6 pt-5 pb-10 lg:pt-10">
        <div className="flex items-center gap-2.5">
          <Logo taille={38} inverse />
          <span className="text-[15px] font-extrabold lg:text-[17px]">Simulateur TCL</span>
        </div>
        <h1 className="mt-6 text-[40px] leading-[0.95] font-black tracking-[-0.03em] lg:text-[56px]">Cette page n’existe pas.</h1>
        <p className="max-w-[500px] text-base leading-relaxed font-medium lg:text-[18px]">
          L’adresse est peut-être incomplète, ou le lien a été modifié depuis qu’il a été partagé.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <BoutonLien href="/" genre="blanc" icone="fleche" taille="grand">
            Aller à l’accueil
          </BoutonLien>
          <BoutonLien href="/communaute" genre="contourBlanc" iconeAGauche="voyageurs" taille="grand">
            Voir les réseaux publiés
          </BoutonLien>
        </div>
      </div>
    </main>
  )
}
