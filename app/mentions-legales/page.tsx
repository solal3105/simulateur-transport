import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { Icone, Logo } from '@/components/ui'
import { MARQUE, VILLES } from '@/lib/villes'

import { Contact } from './Contact'

export const metadata: Metadata = {
  title: `Mentions légales et confidentialité | ${MARQUE}`,
  description: 'Qui édite le Simulateur transport, où il est hébergé, et ce que nous gardons quand vous jouez ou publiez un réseau.',
}

/** Les réseaux cités par le jeu, pour dire qu'aucun n'a de lien avec lui. */
const RESEAUX = Object.values(VILLES)
  .map((v) => v.nom)
  .join(', ')

function Section({ id, titre, children }: { id: string; titre: string; children: ReactNode }) {
  return (
    <section id={id} className="flex flex-col gap-3 border-t border-trait pt-8">
      <h2 className="text-[24px] leading-tight font-black tracking-tight lg:text-[28px]">{titre}</h2>
      <div className="flex flex-col gap-3 text-[16px] leading-relaxed">{children}</div>
    </section>
  )
}

/**
 * Les mentions légales et la politique de confidentialité, sur une seule page. Tout ce qui y est écrit doit
 * rester vrai : si le site se met à garder autre chose, cette page change avec lui.
 */
export default function Page() {
  return (
    <main className="min-h-dvh bg-white">
      <header className="bg-rouge text-white">
        <div className="mx-auto flex max-w-[760px] flex-col gap-6 px-5 pt-5 pb-9 lg:gap-8 lg:px-8 lg:pt-8 lg:pb-12">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo taille={36} inverse />
              <span className="text-[15px] font-extrabold lg:text-[17px]">{MARQUE}</span>
            </Link>
            <Link
              href="/"
              className="flex min-h-10 items-center gap-1.5 text-[14px] font-extrabold underline decoration-white/60 decoration-2 underline-offset-4"
            >
              <Icone nom="retour" taille={17} epaisseur={2.4} />
              Accueil
            </Link>
          </div>
          <h1 className="text-[38px] leading-[0.97] font-black tracking-[-0.03em] text-balance lg:text-[56px] lg:leading-[0.95]">
            Mentions légales et confidentialité
          </h1>
        </div>
      </header>

      <div className="mx-auto flex max-w-[760px] flex-col gap-8 px-5 py-10 lg:px-8 lg:py-14">
        <Section id="editeur" titre="Qui édite ce site">
          <p>
            Le {MARQUE} est un site personnel et gratuit, sans publicité ni but commercial. Il est édité par un particulier qui, comme la
            loi le permet aux éditeurs non professionnels, ne publie pas son nom : son identité est connue de l’hébergeur du site.
          </p>
          <p>
            Le jeu n’est ni édité ni approuvé par les réseaux et les autorités organisatrices qu’il représente ({RESEAUX}). Leurs noms
            désignent les territoires du jeu, et leurs chiffres viennent de documents publics, cités à chaque fois dans les pages de
            méthode.
          </p>
          <Contact />
        </Section>

        <Section id="hebergement" titre="Où il est hébergé">
          <p>Le site est hébergé par Netlify, Inc., 101 2nd Street, San Francisco, CA 94105, États-Unis.</p>
          <p>
            Les réseaux publiés par les joueurs sont enregistrés dans une base de données Supabase, hébergée à Paris. Supabase est une
            société de Singapour : Supabase Pte. Ltd., 65 Chulia Street #38-02/03, OCBC Centre, Singapore 049513.
          </p>
        </Section>

        <Section id="donnees" titre="Ce que nous gardons">
          <p>
            Vous jouez sans compte. Votre partie et votre accès anticipé sont enregistrés dans votre navigateur seulement : ils ne nous
            parviennent pas, et vous les effacez en effaçant les données du site dans votre navigateur.
          </p>
          <p>
            Quand vous publiez un réseau, nous gardons ce que vous choisissez de publier : le réseau, son titre, sa phrase de présentation
            et votre pseudo, avec la date. Votre navigateur reçoit une clé secrète tirée au hasard, dont nous ne gardons qu’une empreinte :
            elle sert à reconnaître l’auteur d’un réseau et à compter une seule fois un soutien, une reprise ou un signalement. Nous ne
            demandons ni adresse électronique, ni nom, ni mot de passe. Un réseau reste en ligne jusqu’à ce que son auteur le retire, depuis
            sa page. Un réseau signalé trois fois est masqué.
          </p>
          <p>
            Un lien de partage contient votre réseau dans l’adresse elle-même : quand quelqu’un l’ouvre, nous recalculons son image
            d’aperçu, mais nous ne le gardons pas dans notre base.
          </p>
        </Section>

        <Section id="mesure" titre="La mesure d’audience">
          <p>
            Pour savoir combien de personnes jouent et d’où elles viennent, nous comptons les pages vues et quelques gestes du jeu : une
            partie commencée, une ligne construite, un réseau publié. Nous utilisons pour cela PostHog, dont les données sont hébergées en
            Allemagne.
          </p>
          <p>
            Cette mesure ne dépose ni cookie ni aucune autre donnée sur votre appareil : chaque visite est anonyme et oubliée quand vous
            fermez la page. Elle ne lit pas ce que vous tapez et n’enregistre pas votre écran. Comme tout service en ligne, PostHog reçoit
            l’adresse de votre connexion en même temps que la page.
          </p>
        </Section>

        <Section id="droits" titre="Vos droits">
          <p>
            Vous pouvez nous demander ce que nous gardons à votre sujet, le faire corriger ou supprimer, par exemple un réseau publié depuis
            un navigateur que vous n’avez plus. Écrivez-nous avec le bouton plus haut. Si notre réponse ne vous convient pas, vous pouvez
            vous adresser à la CNIL, sur cnil.fr.
          </p>
        </Section>

        <Section id="credits" titre="Données et crédits">
          <p>
            Les cartes viennent d’OpenStreetMap, les habitants et les emplois de l’INSEE, le relief de l’IGN. La police est Figtree, sous
            licence libre SIL Open Font License.
          </p>
        </Section>
      </div>
    </main>
  )
}
