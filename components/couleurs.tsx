'use client'

import { useEffect } from 'react'

import { cssCouleurs, VILLES, type IdVille } from '@/lib/villes'

/**
 * Les couleurs d'un réseau dès la première peinture de sa page, avant que le jeu ne se charge : sans
 * elles, la page d'Île-de-France Mobilités s'afficherait un instant en rouge TCL.
 */
export function StyleReseau({ ville }: { ville: IdVille }) {
  return <style dangerouslySetInnerHTML={{ __html: cssCouleurs(VILLES[ville].couleurs) }} />
}

/** Donne à toute l'interface les couleurs du réseau affiché, et à la barre du navigateur sur téléphone. */
export function useCouleursReseau(ville: IdVille) {
  useEffect(() => {
    const c = VILLES[ville].couleurs
    const style = document.documentElement.style
    style.setProperty('--color-rouge', c.principale)
    style.setProperty('--color-rouge-fonce', c.fonce)
    style.setProperty('--color-rouge-pale', c.pale)
    style.setProperty('--color-rouge-moyen', c.moyen)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.principale)
  }, [ville])
}
