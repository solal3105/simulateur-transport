// La fonction « communaute » : la seule porte d'écriture de la communauté.
//
// Le site lit directement les réseaux publiés, mais tout ce qui écrit passe ici : publier, soutenir,
// reprendre, signaler, retirer, s'inscrire à l'accès anticipé et envoyer un bug ou une amélioration.
// Chaque navigateur se présente avec sa clé secrète, dont la base ne garde que l'empreinte. Avant
// d'enregistrer un réseau, la fonction recalcule ses lignes, son score, son coût et l'équilibre de son
// budget avec le code même du jeu (copié dans ./lib).
import { createClient } from 'jsr:@supabase/supabase-js@2'

import { PROJETS } from './lib/catalogue.ts'
import { preparerCarreaux, type Carreaux } from './lib/modele.ts'
import { compacter, normaliserPartie, villeDePartie } from './lib/partie.ts'
import { resoudre, resumer } from './lib/regles.ts'
import { preparerTerrain, type ReliefBrut } from './lib/terrain.ts'
import { estVille, VILLES, type IdVille } from './lib/villes.ts'

const base = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// Empreinte des données du modèle de chaque ville (carreaux.json et arrets.json de public/data ou
// public/data/<ville>) : seules ces données exactes peuvent être déposées, une fois par ville.
const EMPREINTES: Record<IdVille, string> = {
  lyon: 'a2127334171f48f6fd596c2b0bc21474867bfd188eb8e65bd723ad1097519631',
  toulouse: '8bb4ba127285f7407c9a4df8fc00492e6c80f8de1ece55b5495cee124e9878fa',
  marseille: '559c8700d0582cc5f128704869d91843b4e0ce655b4e8a4a77b75c44cc51a2f1',
  nice: '18766bf4503eb0e2fea45f62571b703e1bf9cc611ae5c5d48df35cee46127fff',
  idf: '2899dcf2ef96441bfc27385f07c7ea65db3327c1facc89043e8da9bc3115aebb',
}

// Empreinte du terrain de chaque ville (relief.json et grands cours d'eau de fond.json), déposé par
// scripts/deposer-terrain.mjs : le coût d'une ligne tient compte des pentes et des fleuves.
const EMPREINTES_TERRAIN: Record<IdVille, string> = {
  lyon: '9f45bf50914e61814e647713485d09f1abcefa2c86a279405b9158000c7c9475',
  toulouse: 'a8cd3128bd12119781338530bc821317926e4b7108e488238e5b09d163db3c37',
  marseille: '0e2e7a4c0bf5746cbd5c9b8747075ef4bc8c258f6144e7fd3fc111e2e32ad714',
  nice: '0854b2d1bff72cef0cdd8c26a82b1d638d64c10ccd902ee7d2ee7ed39d59b211',
  idf: 'cccac0219febb9e39866f2056bcdb883d4c6f0433b9f9509d2fe169f77411076',
}

const ENTETES = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const repondre = (corps: unknown, statut = 200) =>
  new Response(JSON.stringify(corps), { status: statut, headers: { ...ENTETES, 'Content-Type': 'application/json' } })
const refuser = (message: string, statut = 400) => repondre({ erreur: message }, statut)

async function empreinte(texte: string) {
  const octets = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte))
  return [...new Uint8Array(octets)].map((o) => o.toString(16).padStart(2, '0')).join('')
}

const carreaux = new Map<IdVille, Promise<Carreaux>>()
function chargerCarreaux(ville: IdVille) {
  let p = carreaux.get(ville)
  if (!p) {
    p = (async () => {
      const { data, error } = await base.from('modele').select('carreaux, arrets, terrain').eq('ville', ville).single()
      if (error || !data) throw new Error(`Données du modèle absentes pour ${ville}`)
      const terrain = data.terrain as { relief: ReliefBrut; fleuves: [number, number][][] } | null
      return preparerCarreaux(
        data.carreaux as number[][],
        data.arrets as number[][],
        VILLES[ville],
        terrain ? preparerTerrain(terrain.relief, terrain.fleuves) : undefined,
      )
    })().catch((e) => {
      carreaux.delete(ville)
      throw e
    })
    carreaux.set(ville, p)
  }
  return p
}

// Quelques insultes et termes haineux, comparés mot à mot une fois les accents et les chiffres déguisés retirés.
const INTERDITS = new Set([
  'con',
  'conne',
  'connard',
  'connasse',
  'salope',
  'salaud',
  'pute',
  'putain',
  'encule',
  'enculer',
  'nique',
  'niquer',
  'batard',
  'pd',
  'pede',
  'tapette',
  'gouine',
  'negre',
  'negro',
  'bougnoule',
  'youpin',
  'raton',
  'bicot',
  'fdp',
  'ntm',
  'tg',
  'abruti',
  'debile',
  'merde',
  'nazi',
  'hitler',
])
function convenable(texte: string) {
  const mots = texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4|@/g, 'a')
    .replace(/5|\$/g, 's')
    .split(/[^a-z]+/)
  return !mots.some((m) => INTERDITS.has(m))
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const texte = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : '')

// Une adresse électronique plausible : on ne vérifie pas qu'elle existe, seulement qu'elle en a la forme.
const ADRESSE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i
const PROFILS_JOUEUR = ['usager', 'etudiant', 'professionnel', 'elu', 'journaliste', 'autre']

/** Un objet JSON gardé tel quel s'il n'est pas trop gros, sinon rien. */
function jsonBorne(v: unknown, max: number) {
  if (!v || typeof v !== 'object') return null
  return JSON.stringify(v).length <= max ? v : null
}

async function profilDe(cle: string) {
  const { data } = await base.from('cles').select('profil, profils(id, pseudo)').eq('empreinte', cle).maybeSingle()
  return (data?.profils as { id: string; pseudo: string } | null) ?? null
}

async function reseauExiste(id: unknown) {
  if (typeof id !== 'string' || !UUID.test(id)) return null
  const { data } = await base.from('reseaux').select('id, auteur').eq('id', id).maybeSingle()
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: ENTETES })
  if (req.method !== 'POST') return refuser('Méthode non prise en charge.', 405)
  try {
    const corps = await req.json()
    const action = corps?.action

    // Dépôt unique des données du modèle d'une ville, vérifiées par leur empreinte.
    if (action === 'deposer') {
      const ville = corps.ville ?? 'lyon'
      if (!estVille(ville)) return refuser('Ville inconnue.')
      const { count } = await base.from('modele').select('ville', { count: 'exact', head: true }).eq('ville', ville)
      if (count) return refuser('Les données sont déjà déposées.', 409)
      if (!Array.isArray(corps.carreaux) || !Array.isArray(corps.arrets)) return refuser('Données incomplètes.')
      if ((await empreinte(`${JSON.stringify(corps.carreaux)}|${JSON.stringify(corps.arrets)}`)) !== EMPREINTES[ville]) {
        return refuser('Ces données ne sont pas celles du modèle.', 403)
      }
      const { error } = await base.from('modele').insert({ ville, carreaux: corps.carreaux, arrets: corps.arrets })
      if (error) throw error
      return repondre({ ok: true })
    }

    // Dépôt unique du terrain d'une ville, vérifié par son empreinte.
    if (action === 'deposer-terrain') {
      const ville = corps.ville
      if (!estVille(ville)) return refuser('Ville inconnue.')
      const { data: ligne } = await base.from('modele').select('terrain').eq('ville', ville).maybeSingle()
      if (!ligne) return refuser('Les données du modèle ne sont pas encore déposées.', 409)
      if (ligne.terrain) return refuser('Le terrain est déjà déposé.', 409)
      if (!corps.relief || !Array.isArray(corps.fleuves)) return refuser('Données incomplètes.')
      if ((await empreinte(`${JSON.stringify(corps.relief)}|${JSON.stringify(corps.fleuves)}`)) !== EMPREINTES_TERRAIN[ville]) {
        return refuser('Ces données ne sont pas celles du terrain.', 403)
      }
      const { error } = await base
        .from('modele')
        .update({ terrain: { relief: corps.relief, fleuves: corps.fleuves } })
        .eq('ville', ville)
      if (error) throw error
      carreaux.delete(ville)
      return repondre({ ok: true })
    }

    if (typeof corps?.cle !== 'string' || corps.cle.length < 20 || corps.cle.length > 200) return refuser('Clé manquante.', 401)
    const cle = await empreinte(corps.cle)
    await base.from('cles').upsert({ empreinte: cle }, { onConflict: 'empreinte', ignoreDuplicates: true })

    switch (action) {
      case 'profil': {
        return repondre({ profil: await profilDe(cle) })
      }

      case 'publier': {
        const titre = texte(corps.titre, 60)
        const intention = texte(corps.intention, 200)
        const visibilite = corps.visibilite === 'lien' ? 'lien' : 'publique'
        if (titre.length < 3) return refuser('Le titre doit faire au moins 3 caractères.')
        if (!convenable(titre) || !convenable(intention))
          return refuser('Le titre ou la phrase contiennent un mot que nous ne publions pas.')

        let profil = await profilDe(cle)
        const pseudo = texte(corps.pseudo, 30)
        if (pseudo) {
          if (pseudo.length < 2) return refuser('Le pseudo doit faire au moins 2 caractères.')
          if (!convenable(pseudo)) return refuser('Ce pseudo contient un mot que nous ne publions pas.')
        }
        if (!profil) {
          if (!pseudo) return refuser('Choisissez un pseudo pour publier.')
          const { data, error } = await base.from('profils').insert({ pseudo }).select('id, pseudo').single()
          if (error) throw error
          profil = data
          await base.from('cles').update({ profil: data.id }).eq('empreinte', cle)
        } else if (pseudo && pseudo !== profil.pseudo) {
          await base.from('profils').update({ pseudo }).eq('id', profil.id)
          profil = { ...profil, pseudo }
        }

        // Pas plus de dix publications par jour et par personne.
        const hier = new Date(Date.now() - 86_400_000).toISOString()
        const { count } = await base
          .from('reseaux')
          .select('id', { count: 'exact', head: true })
          .eq('auteur', profil.id)
          .gte('cree_le', hier)
        if ((count ?? 0) >= 10) return refuser('Vous avez déjà publié dix réseaux aujourd’hui. Revenez demain.', 429)

        const ville = villeDePartie(corps.partie)
        if (!ville) return refuser('Ce réseau est illisible.')
        const { data: fiche } = await base.from('villes').select('ouverte').eq('slug', ville).maybeSingle()
        if (!fiche?.ouverte) return refuser('Les réseaux de cette ville ne peuvent pas encore être publiés.')
        const partie = normaliserPartie(corps.partie, await chargerCarreaux(ville))
        if (!partie) return refuser('Ce réseau est illisible.')
        if (partie.chantiers.length + partie.lignes.length === 0) return refuser('Ce réseau ne contient aucun projet.')
        // Les noms des lignes et des stations se lisent sur la page du réseau : ils passent le même filtre que le titre.
        const noms = partie.lignes.flatMap((l) => [l.nom, ...(l.noms ?? []).filter((x): x is string => Boolean(x))])
        if (!noms.every(convenable)) return refuser('Le nom d’une ligne ou d’une station contient un mot que nous ne publions pas.')
        const r = resumer(partie.chantiers, partie.lignes, partie.leviers, VILLES[ville])
        // Un réseau en jeu libre n'a pas de budget à tenir : il est publié à part, marqué comme tel.
        if (!r.equilibre && !partie.libre) return refuser('Ce réseau ne tient pas le budget des deux mandats : il ne peut pas être publié.')

        const modes = new Set<string>(partie.lignes.map((l) => l.mode))
        for (const c of partie.chantiers) {
          const p = PROJETS.get(c.id)
          if (p) modes.add(resoudre(p, c).mode)
        }
        const source = await reseauExiste(corps.inspire_de)

        const { data, error } = await base
          .from('reseaux')
          .insert({
            auteur: profil.id,
            ville,
            titre,
            intention: intention || null,
            visibilite,
            partie: compacter(partie),
            libre: partie.libre,
            voyageurs: r.voyageurs,
            investi: Math.round(r.investi),
            retenus: r.retenus,
            lignes: partie.lignes.length,
            modes: [...modes],
            inspire_de: source?.id ?? null,
          })
          .select('id')
          .single()
        if (error) throw error
        return repondre({ id: data.id, profil })
      }

      case 'soutenir': {
        const reseau = await reseauExiste(corps.reseau)
        if (!reseau) return refuser('Ce réseau n’existe plus.', 404)
        const profil = await profilDe(cle)
        if (profil && profil.id === reseau.auteur) return refuser('Vous ne pouvez pas soutenir votre propre réseau.')
        if (corps.oui === false) await base.from('soutiens').delete().eq('reseau', reseau.id).eq('empreinte', cle)
        else
          await base
            .from('soutiens')
            .upsert({ reseau: reseau.id, empreinte: cle }, { onConflict: 'reseau,empreinte', ignoreDuplicates: true })
        const { data } = await base.from('reseaux').select('soutiens').eq('id', reseau.id).single()
        return repondre({ soutiens: data?.soutiens ?? 0, soutenu: corps.oui !== false })
      }

      case 'reprendre': {
        const reseau = await reseauExiste(corps.reseau)
        if (!reseau) return refuser('Ce réseau n’existe plus.', 404)
        await base
          .from('reprises')
          .upsert({ reseau: reseau.id, empreinte: cle }, { onConflict: 'reseau,empreinte', ignoreDuplicates: true })
        return repondre({ ok: true })
      }

      case 'signaler': {
        const reseau = await reseauExiste(corps.reseau)
        if (!reseau) return refuser('Ce réseau n’existe plus.', 404)
        const motif = ['propos', 'triche', 'autre'].includes(corps.motif) ? corps.motif : 'autre'
        await base
          .from('signalements')
          .upsert({ reseau: reseau.id, empreinte: cle, motif }, { onConflict: 'reseau,empreinte', ignoreDuplicates: true })
        return repondre({ ok: true })
      }

      case 'retirer': {
        const reseau = await reseauExiste(corps.reseau)
        const profil = await profilDe(cle)
        if (!reseau || !profil || reseau.auteur !== profil.id) return refuser('Seul l’auteur d’un réseau peut le retirer.', 403)
        await base.from('reseaux').delete().eq('id', reseau.id)
        return repondre({ ok: true })
      }

      // L'entrée dans l'accès anticipé : l'adresse du joueur, et ce navigateur rattaché à elle.
      case 'inscrire': {
        const email = texte(corps.email, 254).toLowerCase()
        if (!ADRESSE.test(email)) return refuser('Cette adresse électronique ne semble pas complète.')
        // Au-delà de 120 inscriptions en une minute, c'est un robot plutôt qu'une foule.
        const ilYaUneMinute = new Date(Date.now() - 60_000).toISOString()
        const { count } = await base.from('inscriptions').select('id', { count: 'exact', head: true }).gte('cree_le', ilYaUneMinute)
        if ((count ?? 0) >= 120) return refuser('Beaucoup de monde arrive en même temps. Réessayez dans une minute.', 429)
        const profil = PROFILS_JOUEUR.includes(corps.profil) ? corps.profil : undefined
        const ville = estVille(corps.ville) ? corps.ville : undefined
        const { data, error } = await base
          .from('inscriptions')
          .upsert({ email, ...(profil ? { profil } : {}), ...(ville ? { ville } : {}) }, { onConflict: 'email' })
          .select('id')
          .single()
        if (error) throw error
        await base.from('cles').update({ inscription: data.id }).eq('empreinte', cle)
        return repondre({ ok: true })
      }

      // Un bug ou une amélioration, avec l'écran et la partie du joueur pour les reproduire.
      case 'retour': {
        const type = corps.type === 'bug' || corps.type === 'amelioration' ? corps.type : null
        if (!type) return refuser('Dites-nous s’il s’agit d’un bug ou d’une amélioration.')
        const message = typeof corps.texte === 'string' ? corps.texte.replace(/\r\n?/g, '\n').trim().slice(0, 2000) : ''
        if (message.length < 10) return refuser('Décrivez-le en quelques mots de plus.')
        // Pas plus de trente signalements par jour et par navigateur.
        const hier = new Date(Date.now() - 86_400_000).toISOString()
        const { count } = await base.from('retours').select('id', { count: 'exact', head: true }).eq('empreinte', cle).gte('cree_le', hier)
        if ((count ?? 0) >= 30) return refuser('Vous avez déjà envoyé trente signalements aujourd’hui. Merci, et revenez demain.', 429)
        const { data: lien } = await base.from('cles').select('inscription').eq('empreinte', cle).maybeSingle()
        const { data, error } = await base
          .from('retours')
          .insert({
            type,
            texte: message,
            contexte: jsonBorne(corps.contexte, 4000),
            partie: jsonBorne(corps.partie, 200_000),
            navigateur: texte(corps.navigateur, 300) || null,
            empreinte: cle,
            inscription: lien?.inscription ?? null,
          })
          .select('id')
          .single()
        if (error) throw error
        return repondre({ id: data.id })
      }

      default:
        return refuser('Action inconnue.')
    }
  } catch (e) {
    console.error(e)
    return refuser('Une erreur est survenue de notre côté. Réessayez dans un instant.', 500)
  }
})
