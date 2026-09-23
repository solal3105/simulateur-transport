"""
Le moteur de fréquentation : il essaie des milliers de formules sur toutes les lignes dont on connaît
la fréquentation, juge chacune sur sa capacité à prédire des lignes qu'elle n'a pas vues, et retient
la meilleure.

Une formule prédit le logarithme des voyageurs par jour comme une somme pondérée de variables :
  - le bassin de la ligne : habitants plus une part des emplois à une certaine distance des stations,
    distance qui peut différer entre le métro et les autres modes, plus éventuellement une part de
    ceux qui habitent ou travaillent au-delà, jusqu'à 1 000 m ; le bassin est soit entier, soit
    propre (chaque carreau partagé entre les lignes qui le desservent) ;
  - et, au choix, le nombre de stations, la longueur, les correspondances avec les autres lignes et
    avec les gares, la place dans la ville (distance et part des stations près du centre), le bassin
    de vie et le bassin d'emploi de la ville, les emplois du centre, le bassin large autour de la
    ligne, la concurrence des autres lignes et la taille du réseau ;
  - le mode (métro, tram, bus en site propre) est toujours dans la formule, avec un écart pour les
    lignes de bus renforcées sans site propre continu (Linéo, Chronostar, Lianes, Chronobus), et un
    niveau propre au métro parisien, dont les chiffres comptent les entrées sans les correspondances.

Chaque formule est jugée de trois façons, toutes sur des lignes absentes du calage :
  - ville connue : chaque ville a son propre niveau, tiré vers la moyenne quand elle a peu de lignes
    (comme si on lui ajoutait RETRAIT lignes moyennes) ; on cale sans une ligne, puis on la prédit.
    C'est la situation du jeu, qui connaît les lignes existantes de la ville où l'on joue ;
  - ville inconnue : sans niveau propre aux villes, on cale sans une ville entière, puis on prédit
    ses lignes. C'est la situation d'une ville qu'on ouvrirait sans aucun chiffre local ;
  - ligne par ligne : sans niveau propre aux villes, on cale sans une ligne.
Le moteur ne retient qu'une formule plausible pour un joueur : chaque variable doit agir dans le sens
attendu (plus d'habitants ou de gares, plus de voyageurs ; plus de concurrence, moins de voyageurs).
Une formule qui ferait perdre des voyageurs à une ligne parce qu'elle a des correspondances peut
mieux coller aux chiffres, par un effet de double compte des bassins, mais elle apprendrait au joueur
une règle fausse. La meilleure formule sans ce filtre reste affichée pour comparaison.

Chaque ligne pèse 1 / racine du nombre de lignes de sa ville, dans le calage comme dans les scores :
sans cela, les 26 lignes de Paris dicteraient la formule aux villes qui n'en ont que deux.

Le score est l'écart moyen en logarithme (0,2 vaut environ 20 %). Le classement se fait sur la moyenne
des scores ville connue et ville inconnue, pour retenir une formule qui tienne dans les deux cas.
Beaucoup de formules font presque aussi bien que la meilleure, et leur ordre change dès qu'on ajoute
quelques lignes. On réunit donc les formules plausibles qu'on ne peut pas distinguer de la meilleure
(leur écart à elle ne dépasse pas son erreur type, mesurée ligne par ligne), et on retient les variables
présentes dans plus de la moitié d'entre elles, avec le bassin le plus fréquent : ce qui revient à coup
sûr, sans ce qui tient au hasard d'un classement.

    python3 scripts/modele/moteur.py

Entrées : data/modele/variables.csv et data/modele/frequentation.csv.
Sorties : data/modele/resultats.json (les meilleures formules, leurs coefficients et leurs écarts) et
lib/formule.ts, la formule retenue telle que le jeu et la fonction serveur la lisent.
"""
import itertools
import json
import math
import os
import sys
import time
import warnings

import numpy as np
import pandas as pd

# La bibliothèque de calcul du Mac signale à tort des dépassements dans les produits de matrices.
warnings.filterwarnings('ignore', category=RuntimeWarning)

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
MODELE = os.path.join(RACINE, 'data', 'modele')
RAYONS = [300, 400, 500, 600, 800, 1000]
POIDS_EMPLOIS = [0.0, 0.15, 0.3, 0.5, 0.75, 1.0]
# Poids des habitants et emplois situés entre le rayon choisi et 1 000 m (0 : le rayon seul compte).
POIDS_COURONNE = [0.0, 0.3, 0.6]
# Correction de ville tirée vers zéro : une ville de n lignes compte pour n / (n + RETRAIT).
RETRAIT = 2.0
GROUPES_MAX = 7
BASSINS_RETENUS = 4
# Les villes du jeu (lib/villes.ts), dont la formule exportée donne la constante.
VILLES_DU_JEU = ['lyon', 'toulouse', 'marseille', 'nice', 'paris']
# Les variables de ligne que le jeu sait calculer (lib/modele.ts), sous leur nom dans le jeu.
VARIABLES_DU_JEU = {'bassin': 'bassin', 'stations': 'stations', 'longueur': 'longueur', 'distance_centre': 'distanceCentre',
                    'part_centre': 'partCentre', 'concurrence': 'concurrence', 'bassin_large': 'bassinLarge'}
# Les variables de ville, les mêmes pour toutes les lignes d'une ville : elles entrent dans sa constante.
VARIABLES_DE_VILLE = {'bassin_vie': ('ville_hab_20k', math.log), 'bassin_vie_10k': ('ville_hab_10k', math.log),
                      'bassin_emploi': ('ville_emp_20k', math.log), 'emplois_centre': ('emplois_centre_1k', math.log1p),
                      'reseau': ('lignes_reseau', lambda x: math.log(max(1, x)))}


def charger():
    v = pd.read_csv(os.path.join(MODELE, 'variables.csv'), dtype={'ligne': str})
    f = pd.read_csv(os.path.join(MODELE, 'frequentation.csv'), dtype={'ligne': str}, comment='#')
    f = f[f['voyages_jour'].notna() & (f['retenue'] == 1)]
    d = f.merge(v, on=['ville', 'ligne', 'mode'], how='inner', suffixes=('', '_osm'))
    manquantes = f.merge(v, on=['ville', 'ligne', 'mode'], how='left', indicator=True)
    manquantes = manquantes[manquantes['_merge'] == 'left_only'][['ville', 'ligne', 'mode']]
    return d.reset_index(drop=True), manquantes


def variables_fixes(d):
    """Les variables qui ne dépendent pas du choix du bassin."""
    return {
        'stations': np.log(d['stations']),
        'longueur': np.log(d['longueur_km'].clip(lower=0.5)),
        'correspondances': np.log1p(d['correspondances']),
        'gares': np.log1p(d['gares']),
        'part_centre': d['part_centre'],
        'distance_centre': np.log1p(d['dist_centre_km']),
        'bassin_vie': np.log(d['ville_hab_20k']),
        'bassin_vie_10k': np.log(d['ville_hab_10k']),
        'bassin_emploi': np.log(d['ville_emp_20k']),
        'emplois_centre': np.log1p(d['emplois_centre_1k']),
        'concurrence': d['part_partagee_400'],
        'reseau': np.log(d['lignes_reseau'].clip(lower=1)),
        'metro': (d['mode'] == 'metro').astype(float),
        'bhns': (d['mode'] == 'bhns').astype(float),
        'cable': (d['mode'] == 'cable').astype(float),
    }


# Le sens attendu de chaque variable : +1, elle ajoute des voyageurs, -1, elle en retire.
SIGNES = {
    'bassin': 1, 'correspondances': 1, 'gares': 1, 'part_centre': 1, 'distance_centre': -1, 'bassin_vie': 1,
    'bassin_vie_10k': 1, 'bassin_emploi': 1, 'emplois_centre': 1, 'bassin_large': 1, 'concurrence': -1, 'reseau': 1,
    'metro': 1, 'bhns': -1,
}

# Les groupes de variables que le moteur ajoute ou retire ensemble.
GROUPES = {
    'forme': ['stations'],
    'longueur': ['longueur'],
    'correspondances': ['correspondances'],
    'gares': ['gares'],
    'centre': ['part_centre'],
    'distance_centre': ['distance_centre'],
    'bassin_vie': ['bassin_vie'],
    'bassin_vie_proche': ['bassin_vie_10k'],
    'bassin_emploi': ['bassin_emploi'],
    'emplois_centre': ['emplois_centre'],
    'bassin_large': ['bassin_large'],
    'bassin_entier': ['bassin_entier'],
    'concurrence': ['concurrence'],
    'reseau': ['reseau'],
}


def bassin(d, r_metro, r_autres, w, propre, couronne=0.0):
    lourd = (d['mode'] == 'metro').to_numpy()
    h, e = ('hab_propre', 'emp_propre') if propre else ('hab', 'emp')
    hab = np.where(lourd, d[f'{h}_{r_metro}'], d[f'{h}_{r_autres}'])
    emp = np.where(lourd, d[f'{e}_{r_metro}'], d[f'{e}_{r_autres}'])
    proche = hab + w * emp
    loin = d[f'{h}_1000'].to_numpy() + w * d[f'{e}_1000'].to_numpy()
    return np.log1p(proche + couronne * (loin - proche))


class Juge:
    """Calcule les trois écarts d'une formule, avec des formules fermées quand c'est possible. Le calage
    est pondéré (moindres carrés pondérés) : on multiplie chaque ligne par la racine de son poids."""

    def __init__(self, y, villes):
        self.n = len(y)
        self.villes = villes
        self.noms_villes = sorted(set(villes))
        self.groupes = [np.flatnonzero(villes == v) for v in self.noms_villes]
        taille = {v: (villes == v).sum() for v in self.noms_villes}
        self.poids = np.array([1 / math.sqrt(taille[v]) for v in villes])
        self.r = np.sqrt(self.poids)
        self.y = y * self.r
        self.indicatrices = np.column_stack([(villes == v).astype(float) for v in self.noms_villes]) * self.r[:, None]

    def ville_connue(self, X):
        """Niveau propre à chaque ville, pénalisé (régression ridge sur les seules indicatrices de
        ville) : l'écart sans la ligne i vaut exactement e_i / (1 - h_ii). X est déjà pondérée."""
        Xa = np.column_stack([X, self.indicatrices])
        penalite = np.diag([0.0] * X.shape[1] + [RETRAIT] * self.indicatrices.shape[1])
        M = np.linalg.pinv(Xa.T @ Xa + penalite)
        beta = M @ Xa.T @ self.y
        e = self.y - Xa @ beta
        h = np.einsum('ij,jk,ik->i', Xa, M, Xa)
        e_connue = e / (1 - np.clip(h, None, 1 - 1e-9))
        e_connue[h > 0.99] = np.nan
        return beta, e / self.r, e_connue / self.r

    def ecarts(self, X):
        """Les écarts, en logarithme et sans pondération, pour une matrice X non pondérée."""
        X = X * self.r[:, None]
        y = self.y
        beta_c, e_c, e_connue = self.ville_connue(X)
        XtX_inv = np.linalg.pinv(X.T @ X)
        h = np.einsum('ij,jk,ik->i', X, XtX_inv, X)
        e = y - X @ (XtX_inv @ X.T @ y)
        e_ligne = e / (1 - np.clip(h, None, 1 - 1e-9)) / self.r
        e_ligne[h > 0.99] = np.nan
        e_ville = np.full(self.n, np.nan)
        for g in self.groupes:
            dedans = np.zeros(self.n, dtype=bool)
            dedans[g] = True
            A = X[~dedans]
            # Une variable absente du calage (le seul métro parisien, par exemple) rend ces lignes imprévisibles.
            present = np.abs(A).sum(axis=0) > 0
            b, *_ = np.linalg.lstsq(A, y[~dedans], rcond=None)
            prevu = (y[g] - X[g] @ b) / self.r[g]
            prevu[np.abs(X[g][:, ~present]).sum(axis=1) > 0] = np.nan
            e_ville[g] = prevu
        return beta_c, e_c, e_ligne, e_connue, e_ville


POIDS = None


def resume(e):
    """Écart moyen pondéré (chaque ligne pèse 1 / racine du nombre de lignes de sa ville)."""
    ok = ~np.isnan(e)
    if not ok.any():
        return float('nan')
    return float(np.average(np.abs(e[ok]), weights=POIDS[ok]))


def main():
    d, manquantes = charger()
    if len(manquantes):
        print('Lignes avec une fréquentation mais introuvables dans OpenStreetMap :')
        for _, m in manquantes.iterrows():
            print('  ', m['ville'], m['ligne'], m['mode'])
    y = np.log(d['voyages_jour'].to_numpy(float))
    villes = d['ville'].to_numpy()
    juge = Juge(y, villes)
    global POIDS
    POIDS = juge.poids
    print(f'{len(d)} lignes dans {len(set(villes))} villes', flush=True)
    fixes = variables_fixes(d)
    fixes['entrees'] = ((d['mode'] == 'metro') & d['unite'].str.startswith('entrants')).astype(float)
    fixes['ligne_forte'] = (d['bus'].fillna('') == 'ligne forte').astype(float)
    modes = [m for m in ('metro', 'bhns', 'ligne_forte', 'cable', 'entrees') if fixes[m].sum() > 0]
    debut = time.time()

    def matrice(r_metro, r_autres, w, propre, couronne, groupes_choisis):
        colonnes = [np.ones(len(d)), bassin(d, r_metro, r_autres, w, propre, couronne)]
        noms = ['constante', 'bassin']
        for g in groupes_choisis:
            for v in GROUPES[g]:
                if v == 'bassin_large':
                    colonnes.append(np.log1p(d['hab_2k'] + w * d['emp_2k']))
                elif v == 'bassin_entier':
                    colonnes.append(bassin(d, r_metro, r_autres, w, False))
                else:
                    colonnes.append(fixes[v])
                noms.append(v)
        for m in modes:
            colonnes.append(fixes[m])
            noms.append(m)
        return np.column_stack(colonnes), noms

    def matrice_pour(autres, r):
        f = variables_fixes(autres)
        colonnes = [np.ones(len(autres)), bassin(autres, r['rayon_metro'], r['rayon_autres'], r['poids_emplois'], r['bassin_propre'], r['poids_couronne'])]
        for g in r['groupes']:
            for v in GROUPES[g]:
                if v == 'bassin_large':
                    colonnes.append(np.log1p(autres['hab_2k'] + r['poids_emplois'] * autres['emp_2k']))
                elif v == 'bassin_entier':
                    colonnes.append(bassin(autres, r['rayon_metro'], r['rayon_autres'], r['poids_emplois'], False))
                else:
                    colonnes.append(f[v])
        for m in modes:
            colonnes.append(np.zeros(len(autres)))
        return np.column_stack(colonnes), None

    def evaluer(rm, ra, w, propre, couronne, combi):
        X, noms = matrice(rm, ra, w, propre, couronne, combi)
        beta, _, e_ligne, e_connue, e_ville = juge.ecarts(X)
        coefficients = dict(zip(noms, beta[:X.shape[1]]))
        plausible = all(math.copysign(1, coefficients[v]) == signe for v, signe in SIGNES.items() if v in coefficients)
        s = {
            'plausible': plausible,
            'score_connue': resume(e_connue), 'score_villes': resume(e_ville), 'score_lignes': resume(e_ligne),
            'variables': len(noms), 'rayon_metro': rm, 'rayon_autres': ra, 'poids_emplois': w, 'bassin_propre': propre,
            'poids_couronne': couronne,
            'groupes': list(combi),
        }
        s['score'] = (s['score_connue'] + s['score_villes']) / 2
        # L'écart de chaque ligne, pour comparer deux formules ligne à ligne.
        s['_ecarts'] = np.where(np.isnan(e_ville), np.abs(e_connue), (np.abs(e_connue) + np.abs(e_ville)) / 2)
        return s

    # Premier tour : le bassin seul, pour choisir les distances et le poids des emplois.
    premiers = []
    for propre in (False, True):
        for rm in RAYONS:
            for ra in RAYONS:
                if ra > rm:
                    continue
                for w in POIDS_EMPLOIS:
                    for couronne in POIDS_COURONNE:
                        if couronne and rm == 1000 and ra == 1000:
                            continue
                        premiers.append(evaluer(rm, ra, w, propre, couronne, []))
    premiers.sort(key=lambda s: s['score'])
    print(f'Premier tour : {len(premiers)} bassins essayés. Les meilleurs :')
    for s in premiers[:BASSINS_RETENUS]:
        print(f"  {'propre' if s['bassin_propre'] else 'entier'}, métro {s['rayon_metro']} m, autres {s['rayon_autres']} m, emplois x{s['poids_emplois']}, couronne x{s['poids_couronne']} : "
              f"{s['score']:.3f} (ville connue {s['score_connue']:.3f}, inconnue {s['score_villes']:.3f})")

    # Second tour : toutes les combinaisons de groupes de variables autour de ces bassins.
    scenarios = []
    noms_groupes = list(GROUPES)
    for b in premiers[:BASSINS_RETENUS]:
        for k in range(0, GROUPES_MAX + 1):
            for combi in itertools.combinations(noms_groupes, k):
                # Le bassin entier ne s'ajoute qu'au bassin propre : avec le bassin entier, ce serait un doublon.
                if 'bassin_entier' in combi and not b['bassin_propre']:
                    continue
                s = evaluer(b['rayon_metro'], b['rayon_autres'], b['poids_emplois'], b['bassin_propre'], b['poids_couronne'], combi)
                if not math.isnan(s['score']):
                    scenarios.append(s)
    duree = time.time() - debut
    print(f'Second tour : {len(scenarios)} formules évaluées, {len(premiers) + len(scenarios)} en tout, en {duree:.0f} s')

    scenarios.sort(key=lambda s: s['score'])
    meilleure_sans_filtre = scenarios[0]
    plausibles = [s for s in scenarios if s['plausible']]
    meilleure = plausibles[0]
    poids = juge.poids / juge.poids.sum()
    n_effectif = 1 / (poids ** 2).sum()
    for s in plausibles:
        diff = s['_ecarts'] - meilleure['_ecarts']
        moyenne = (poids * diff).sum()
        s['erreur_type'] = float(math.sqrt(max(0.0, (poids * (diff - moyenne) ** 2).sum()) / n_effectif))
    indiscernables = [s for s in plausibles if s['score'] - meilleure['score'] <= s['erreur_type']]
    frequence = {g: sum(g in s['groupes'] for s in indiscernables) / len(indiscernables) for g in GROUPES}
    reglages = {}
    for s in indiscernables:
        k = (s['rayon_metro'], s['rayon_autres'], s['poids_emplois'], s['bassin_propre'], s['poids_couronne'])
        reglages[k] = reglages.get(k, 0) + 1
    rm, ra, w, propre, couronne = max(reglages, key=reglages.get)
    groupes = tuple(g for g in GROUPES if frequence[g] > 0.5)
    retenue = evaluer(rm, ra, w, propre, couronne, groupes)
    if not retenue['plausible']:
        retenue = min(indiscernables, key=lambda s: (s['variables'], s['score']))
    retenue['frequence_des_variables'] = {g: round(f, 2) for g, f in frequence.items() if f > 0}
    retenue['formules_indiscernables'] = len(indiscernables)
    retenue.pop('_ecarts', None)
    for s in scenarios:
        s.pop('_ecarts', None)
    for s in premiers:
        s.pop('_ecarts', None)

    X, noms = matrice(retenue['rayon_metro'], retenue['rayon_autres'], retenue['poids_emplois'], retenue['bassin_propre'], retenue['poids_couronne'], retenue['groupes'])
    beta_complet, e, e_ligne, e_connue, e_ville = juge.ecarts(X)
    beta = beta_complet[:X.shape[1]]
    correction_ville = dict(zip(juge.noms_villes, [float(b) for b in beta_complet[X.shape[1]:]]))
    detail = []
    for i, r in d.iterrows():
        detail.append({
            'ville': r['ville'], 'ligne': r['ligne'], 'mode': r['mode'], 'reel': round(float(r['voyages_jour'])),
            'ecart_ville_connue': None if math.isnan(e_connue[i]) else round(float(math.expm1(-e_connue[i])) * 100),
            'ecart_ville_inconnue': None if math.isnan(e_ville[i]) else round(float(math.expm1(-e_ville[i])) * 100),
        })
    resultat = {
        'lignes': len(d), 'villes': len(set(villes)), 'formules_evaluees': len(premiers) + len(scenarios), 'duree_s': round(duree),
        'retenue': {**retenue, 'coefficients': dict(zip(noms, [float(b) for b in beta])),
                    'ecart_type_residus': float(np.std(e)), 'correction_ville': correction_ville},
        'meilleure_sans_filtre': meilleure_sans_filtre,
        'formules_plausibles': len(plausibles),
        'meilleures': plausibles[:40],
        'premier_tour': premiers[:20],
        'detail': detail,
    }
    # Le téléphérique n'a pas de ligne dans le calage : on estime son écart au tram sur Téléo (Toulouse) et
    # le téléphérique de Brest, écartés du calage, en les prédisant comme des trams.
    coefficients = dict(zip(noms, [float(b) for b in beta]))
    niveaux = correction_ville
    toutes = pd.read_csv(os.path.join(MODELE, 'variables.csv'), dtype={'ligne': str})
    freq = pd.read_csv(os.path.join(MODELE, 'frequentation.csv'), dtype={'ligne': str}, comment='#')
    cables = freq[freq['mode'] == 'cable'].merge(toutes, on=['ville', 'ligne', 'mode'])
    ecarts_cable = []
    if len(cables):
        cables = cables.assign(bus='')
        Xc, _ = matrice_pour(cables, retenue)
        prevu = Xc @ beta + np.array([niveaux.get(v, 0.0) for v in cables['ville']])
        ecarts_cable = list(np.log(cables['voyages_jour'].to_numpy(float)) - prevu)
    cable = float(np.mean(ecarts_cable)) if ecarts_cable else math.log(0.6)
    resultat['retenue']['cable'] = {'coefficient': cable, 'lignes': [
        {'ville': v, 'ligne': l, 'reel': round(float(r)), 'ecart_log': round(float(x), 3)} for v, l, r, x in zip(cables['ville'], cables['ligne'], cables['voyages_jour'], ecarts_cable)]}
    json.dump(resultat, open(os.path.join(MODELE, 'resultats.json'), 'w'), ensure_ascii=False, indent=1)
    exporter(retenue, coefficients, niveaux, cable, e_connue, e_ville, juge.poids, d, toutes, len(premiers) + len(scenarios))

    print('\nFormule retenue :', {k: retenue[k] for k in ('rayon_metro', 'rayon_autres', 'poids_emplois', 'bassin_propre', 'poids_couronne', 'groupes')})
    print('  niveau propre à chaque ville :', {k: round(v, 2) for k, v in correction_ville.items()})
    print(f"  écart moyen ville connue {retenue['score_connue']:.3f}, ville inconnue {retenue['score_villes']:.3f}, ligne par ligne {retenue['score_lignes']:.3f}")
    print('  coefficients :', {k: round(v, 3) for k, v in resultat['retenue']['coefficients'].items()})
    print(f"\n{len(plausibles)} formules plausibles sur {len(scenarios)}. Meilleure sans le filtre : {meilleure_sans_filtre['score']:.3f} {meilleure_sans_filtre['groupes']}")
    print(f"Meilleure plausible : {meilleure['score']:.3f} {meilleure['groupes']} ; {len(indiscernables)} formules indiscernables d'elle")
    print('Présence de chaque variable dans ces formules :', retenue['frequence_des_variables'])
    print('Les 12 meilleures formules plausibles :')
    for s in plausibles[:12]:
        print(f"  {s['score']:.3f} (connue {s['score_connue']:.3f}, inconnue {s['score_villes']:.3f}, lignes {s['score_lignes']:.3f}) "
              f"{'propre' if s['bassin_propre'] else 'entier'} métro {s['rayon_metro']} autres {s['rayon_autres']} emplois x{s['poids_emplois']} couronne x{s['poids_couronne']} {s['groupes']}")
    print('\nÉcart de prédiction par ligne (en %, positif quand la formule prédit plus que le réel) :')
    for x in detail:
        print(f"  {x['ville']:10} {x['ligne']:6} {x['mode']:6} réel {x['reel']:>7}  ville connue {x['ecart_ville_connue']!s:>5}  ville inconnue {x['ecart_ville_inconnue']!s:>5}")


NOMS_DE_MODE = {'metro': 'Métro', 'tram': 'Tram', 'bhns': 'Bus', 'cable': 'Téléphérique'}


def valeur_ligne(x, nom, r):
    """La valeur d'une variable de ligne pour une ligne du calage, comme dans matrice()."""
    rayon = r['rayon_metro'] if x['mode'] == 'metro' else r['rayon_autres']
    w = r['poids_emplois']
    if nom == 'bassin':
        proche = x[f'hab_{rayon}'] + w * x[f'emp_{rayon}']
        loin = x['hab_1000'] + w * x['emp_1000']
        return math.log1p(proche + r['poids_couronne'] * (loin - proche))
    return {
        'stations': math.log(x['stations']), 'longueur': math.log(max(0.5, x['longueur_km'])),
        'distance_centre': math.log1p(x['dist_centre_km']), 'part_centre': x['part_centre'],
        'concurrence': x['part_partagee_400'], 'bassin_large': math.log1p(x['hab_2k'] + w * x['emp_2k']),
    }[nom]
NOMS_DE_VILLE = {'bassin_vie': 'bassinVie', 'bassin_vie_10k': 'bassinVieProche', 'bassin_emploi': 'bassinEmploi',
                 'emplois_centre': 'emploisCentre', 'reseau': 'reseau'}


def exporter(retenue, coefficients, niveaux, cable, e_connue, e_ville, poids, d, toutes, n_formules):
    """Écrit lib/formule.ts : la formule retenue, dans les termes du jeu."""
    n_lignes, n_villes = len(d), d['ville'].nunique()
    # L'écart moyen en pourcentage du réel (estimation / réel - 1, en valeur absolue), pondéré comme les scores.
    def pourcent(e):
        ok = ~np.isnan(e)
        return round(float(np.average(np.abs(np.expm1(-e[ok])), weights=poids[ok])) * 100)
    calage = {}
    for v in VILLES_DU_JEU:
        lignes_v = [(r['mode'], r['ligne'], float(r['voyages_jour']), e_connue[i]) for i, r in d.iterrows() if r['ville'] == v and not math.isnan(e_connue[i])]
        lignes_v.sort(key=lambda x: -x[2])
        calage[v] = [{'ligne': f"{NOMS_DE_MODE[m]} {l}", 'reel': int(round(reel, -2)), 'ecart': round(float(math.expm1(-e)) * 100)} for m, l, reel, e in lignes_v]
    if retenue['bassin_propre']:
        raise SystemExit('Le jeu ne sait pas encore calculer le bassin propre : ajoutez-le à lib/modele.ts avant de le retenir.')
    ligne = {}
    constante_commune = coefficients['constante']
    par_ville = {v: 0.0 for v in VILLES_DU_JEU}
    for nom, b in coefficients.items():
        if nom in ('constante', 'metro', 'bhns', 'ligne_forte', 'cable', 'entrees'):
            continue
        if nom in VARIABLES_DU_JEU:
            ligne[VARIABLES_DU_JEU[nom]] = b
        elif nom in VARIABLES_DE_VILLE:
            colonne, f = VARIABLES_DE_VILLE[nom]
            for v in VILLES_DU_JEU:
                par_ville[v] += b * f(float(toutes.loc[toutes['ville'] == v, colonne].iloc[0]))
        else:
            raise SystemExit(f'Le jeu ne sait pas calculer la variable « {nom} » : ajoutez-la à lib/modele.ts.')
    constantes = {v: constante_commune + par_ville[v] + niveaux.get(v, 0.0) for v in VILLES_DU_JEU}
    ok = ~np.isnan(e_connue)
    # Le réel est entre bas et haut fois l'estimation pour huit lignes sur dix.
    bas, haut = (float(math.exp(np.quantile(e_connue[ok], q))) for q in (0.1, 0.9))
    modes = {'tram': 0.0, 'metro': coefficients.get('metro', 0.0), 'bus': coefficients.get('bhns', 0.0), 'cable': cable}
    r = lambda x: round(x, 4)
    lignes_ts = '\n'.join(f'    {k}: {r(v)},' for k, v in ligne.items())
    calage_ts = '\n'.join(
        f'    {v}: [\n' + ''.join(f"      {{ ligne: '{x['ligne']}', reel: {x['reel']}, ecart: {x['ecart']} }},\n" for x in lignes) + '    ],'
        for v, lignes in calage.items())
    texte = f'''/**
 * La formule de fréquentation retenue par le moteur (scripts/modele/moteur.py, docs/modele.md). Ce
 * fichier est écrit par le moteur : pour le changer, on relance le moteur, on ne le modifie pas à la main.
 *
 * Calée sur {n_lignes} lignes de {n_villes} villes. Sur une ligne absente du calage, l'écart moyen vaut
 * {round(retenue['score_connue'] * 100)} % quand on connaît les autres lignes de la ville, et {round(retenue['score_villes'] * 100)} % pour une ville sans aucun chiffre.
 *
 *   voyageurs par jour = exp(constante de la ville + mode + somme des coefficients × variables)
 *
 * bassin : log(1 + habitants + {retenue['poids_emplois']} × emplois) à moins de rayonMetro d'une station de métro
 * ou de rayonAutres d'un arrêt des autres modes ; distanceCentre : log(1 + distance en km de l'arrêt le
 * plus proche du centre) ; concurrence : part des habitants et emplois (0,3 par emploi) à moins de 400 m
 * des arrêts qui sont déjà à moins de 400 m d'une station existante ; stations : log du nombre d'arrêts ;
 * longueur : log de la longueur en km ; partCentre : part des arrêts à moins de 1,5 km du centre ;
 * bassinLarge : log(1 + habitants + emplois pondérés) à moins de 2 km.
 *
 * La constante de chaque ville réunit la constante commune, les variables de ville (bassin de vie à
 * 10 et 20 km du centre, emplois, taille du réseau) et le niveau propre à la ville tiré de ses lignes.
 * Le téléphérique n'a aucune ligne dans le calage : son écart au tram est estimé sur Téléo et sur le
 * téléphérique de Brest, prédits comme des trams.
 */
import type {{ ModeLigne }} from './types'
import type {{ IdVille }} from './villes'

export type VariableLigne = 'bassin' | 'stations' | 'longueur' | 'distanceCentre' | 'partCentre' | 'concurrence' | 'bassinLarge'

export interface Formule {{
  rayonMetro: number
  rayonAutres: number
  poidsEmplois: number
  poidsCouronne: number
  coefficients: Partial<Record<VariableLigne, number>>
  modes: Record<ModeLigne, number>
  /** Constante de chaque ville, recalée sur les carreaux du jeu (scripts/modele/recaler-jeu.ts). */
  constantes: Record<IdVille, number>
  /** Constante de chaque ville telle que le moteur la calcule sur sa grille nationale. */
  constantesMoteur: Record<IdVille, number>
  /** Ce qu'ajoute le recalage sur les carreaux du jeu, par ville. */
  recalage: Record<IdVille, number>
  /** Écarts propres à une ville et à un mode : le métro parisien compte ses entrées, sans les correspondances. */
  ajustements: Partial<Record<IdVille, Partial<Record<ModeLigne, number>>>>
  /** Le réel se situe entre bas et haut fois l'estimation pour huit lignes sur dix du calage. */
  fourchette: {{ bas: number; haut: number }}
  /** Les variables de ville réunies dans la constante de chaque ville. */
  variablesDeVille: ('bassinVie' | 'bassinVieProche' | 'bassinEmploi' | 'emploisCentre' | 'reseau')[]
  /** Ce qu'on dit de la formule à l'écran : combien de formules essayées, sur combien de lignes et de villes. */
  formules: number
  lignes: number
  villes: number
  /** Écart moyen, en pourcentage du réel, sur une ligne absente du calage, selon qu'on connaît sa ville ou non. */
  ecartVilleConnue: number
  ecartVilleInconnue: number
  /** Les lignes de chaque ville, du calage, avec l'écart de l'estimation quand on les prédit sans elles. */
  calage: Record<IdVille, {{ ligne: string; reel: number; ecart: number }}[]>
}}

export const FORMULE: Formule = {{
  rayonMetro: {retenue['rayon_metro']},
  rayonAutres: {retenue['rayon_autres']},
  poidsEmplois: {retenue['poids_emplois']},
  poidsCouronne: {retenue['poids_couronne']},
  coefficients: {{
{lignes_ts}
  }},
  modes: {{ tram: 0, metro: {r(modes['metro'])}, bus: {r(modes['bus'])}, cable: {r(modes['cable'])} }},
  constantes: {{ {', '.join(f'{v}: {r(k)}' for v, k in constantes.items())} }},
  constantesMoteur: {{ {', '.join(f'{v}: {r(k)}' for v, k in constantes.items())} }},
  recalage: {{ {', '.join(f'{v}: 0' for v in constantes)} }},
  ajustements: {{ {'paris: { metro: ' + str(r(coefficients['entrees'])) + ' }' if 'entrees' in coefficients else ''} }},
  fourchette: {{ bas: {round(bas, 2)}, haut: {round(haut, 2)} }},
  variablesDeVille: [{', '.join(repr(NOMS_DE_VILLE[v]) for v in coefficients if v in VARIABLES_DE_VILLE)}],
  formules: {n_formules},
  lignes: {n_lignes},
  villes: {n_villes},
  ecartVilleConnue: {pourcent(e_connue)},
  ecartVilleInconnue: {pourcent(e_ville)},
  calage: {{
{calage_ts}
  }},
}}
'''
    open(os.path.join(RACINE, 'lib', 'formule.ts'), 'w').write(texte)
    # Les lignes des villes du jeu, avec la prédiction du moteur, pour vérifier et recaler le calcul du
    # jeu sur ses propres carreaux (scripts/modele/recaler-jeu.ts).
    stations = json.load(open(os.path.join(MODELE, 'stations.json')))
    controle = []
    for i, x in d.iterrows():
        if x['ville'] not in VILLES_DU_JEU or x['mode'] not in ('metro', 'tram', 'bhns') or x.get('bus') == 'ligne forte':
            continue
        arrets = stations.get(x['ville'], {}).get(f"{x['mode']}|{x['ligne']}")
        if not arrets:
            continue
        prevu = constantes[x['ville']] + modes[{'bhns': 'bus'}.get(x['mode'], x['mode'])] + sum(
            b * valeur_ligne(x, nom, retenue) for nom, b in coefficients.items() if nom in VARIABLES_DU_JEU)
        controle.append({'ville': x['ville'], 'ligne': x['ligne'], 'mode': {'bhns': 'bus'}.get(x['mode'], x['mode']),
                         'reel': round(float(x['voyages_jour'])), 'moteur': float(prevu), 'arrets': arrets})
    json.dump(controle, open(os.path.join(MODELE, 'controle-jeu.json'), 'w'), ensure_ascii=False)
    print('\nlib/formule.ts écrit : constantes', {v: round(k, 3) for v, k in constantes.items()}, f'fourchette {bas:.2f} à {haut:.2f}, téléphérique {cable:.2f}')


if __name__ == '__main__':
    sys.exit(main())
