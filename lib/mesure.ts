'use client'

import posthog from 'posthog-js'

/**
 * La mesure d'audience, avec PostHog hébergé dans l'Union européenne. Rien n'est écrit sur l'appareil du
 * visiteur (ni cookie ni stockage local) : chaque visite est anonyme et oubliée à la fermeture de la page, ce
 * qui dispense de bandeau de consentement. Nous comptons les pages vues et quelques gestes du jeu, jamais
 * les textes saisis ni les enregistrements d'écran. Sans clé de projet, rien ne part.
 */
const CLE = process.env.NEXT_PUBLIC_POSTHOG_KEY
let pret = false

export function demarrerMesure() {
  if (!CLE || pret || typeof window === 'undefined') return
  posthog.init(CLE, {
    api_host: 'https://eu.i.posthog.com',
    persistence: 'memory',
    person_profiles: 'never',
    capture_pageview: 'history_change',
    capture_pageleave: false,
    autocapture: false,
    rageclick: false,
    capture_dead_clicks: false,
    capture_heatmaps: false,
    capture_exceptions: false,
    capture_performance: false,
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_flags: true,
    disable_external_dependency_loading: true,
    save_referrer: true,
  })
  pret = true
}

/** Un geste du jeu à compter : une partie commencée, une ligne construite, un réseau publié. */
export function mesurer(evenement: string, proprietes?: Record<string, string | number | boolean>) {
  if (!pret) return
  posthog.capture(evenement, proprietes)
}
