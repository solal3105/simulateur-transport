import { PageMethode } from '@/components/explications/PageMethode'
import { affichage, metadonneesMethode } from '@/lib/pages'

export const metadata = metadonneesMethode('lyon')
export const viewport = affichage('lyon')

export default function Page() {
  return (
    <>
      <PageMethode ville="lyon" />
    </>
  )
}
