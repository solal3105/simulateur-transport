"""
Les variables de chaque ligne, pour le moteur de fréquentation.

Pour toutes les lignes de métro, de tram et de bus à haut niveau de service trouvées dans
OpenStreetMap (scripts/modele/lignes.py), on calcule autour de leurs stations :
  - les habitants et les emplois à 300, 400, 500, 600, 800 et 1 000 m (chaque carreau compté une fois) ;
  - les habitants et les emplois à 2 et 5 km de la ligne, son bassin propre ;
  - le bassin de vie et le bassin d'emploi de la ville : habitants et emplois à 10 et 20 km du centre ;
  - les correspondances : pour chaque station, les autres lignes à moins de 250 m, et les gares à
    moins de 300 m ;
  - la place de la ligne dans la ville : distance du centre, part des stations à moins de 1,5 km du
    centre, emplois à moins de 1 km du centre ;
  - la concurrence : la part de ses habitants et emplois à 400 m qui sont aussi à 400 m d'une autre ligne ;
  - le bassin propre à chaque distance : chaque carreau est partagé à parts égales entre les lignes de
    métro, de tram ou de téléphérique qui le desservent (un bus rapide compte pour une part de plus) ;
  - sa forme : nombre de stations, longueur (arbre couvrant des stations), taille du réseau de la ville.

    python3 scripts/modele/variables.py

Entrées : data/modele/grille.npz et data/modele/osm/<ville>.json.
Sorties : data/modele/variables.csv, une ligne par ligne de transport, et data/modele/stations.json,
leurs stations en longitude et latitude, qui servent à vérifier le calcul du jeu (scripts/modele/recaler-jeu.ts).
"""
import csv
import json
import math
import os
import re

import numpy as np
from pyproj import Transformer
from scipy.sparse.csgraph import minimum_spanning_tree
from scipy.spatial import cKDTree

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
MODELE = os.path.join(RACINE, 'data', 'modele')
VERS_3035 = Transformer.from_crs(4326, 3035, always_xy=True)
VERS_4326 = Transformer.from_crs(3035, 4326, always_xy=True)

RAYONS = [300, 400, 500, 600, 800, 1000]
# Le centre de chaque ville : l'hôtel de ville ou la place principale.
CENTRES = {
    'lyon': (45.7640, 4.8357), 'toulouse': (43.6045, 1.4440), 'marseille': (43.2965, 5.3698), 'nice': (43.6975, 7.2700),
    'paris': (48.8566, 2.3522), 'bordeaux': (44.8378, -0.5792), 'strasbourg': (48.5833, 7.7458), 'nantes': (47.2184, -1.5536),
    'rennes': (48.1113, -1.6800), 'lille': (50.6365, 3.0635), 'montpellier': (43.6085, 3.8795), 'grenoble': (45.1885, 5.7245),
    'rouen': (49.4431, 1.0993), 'saint-etienne': (45.4397, 4.3872), 'le-mans': (48.0061, 0.1996), 'angers': (47.4712, -0.5518),
    'tours': (47.3941, 0.6848), 'dijon': (47.3220, 5.0415), 'brest': (48.3904, -4.4861), 'clermont-ferrand': (45.7772, 3.0870),
    'reims': (49.2583, 4.0317), 'caen': (49.1829, -0.3707), 'orleans': (47.9029, 1.9093), 'besancon': (47.2378, 6.0241),
    'mulhouse': (47.7508, 7.3359), 'nancy': (48.6921, 6.1844), 'valenciennes': (50.3570, 3.5235), 'avignon': (43.9493, 4.8055),
    'le-havre': (49.4944, 0.1079), 'metz': (49.1193, 6.1757), 'nimes': (43.8367, 4.3601), 'amiens': (49.8941, 2.2958),
    'pau': (43.2951, -0.3708),
}
MODES = {'subway': 'metro', 'monorail': 'metro', 'light_rail': 'tram', 'tram': 'tram', 'bus': 'bhns', 'trolleybus': 'bhns', 'aerialway': 'cable'}
# Trains régionaux, navettes d'événements et autres relations qui ne sont pas des lignes urbaines.
EXCLUS = re.compile(r'^(TER|TN\d|RER|Transilien|Train|Navette|Nav)', re.I)
# Une relation sans numéro le porte souvent dans son nom : « Tram B : Pessac Centre → ... ».
NUMERO_DANS_LE_NOM = re.compile(r'^(?:Tram|Tramway|Métro|Metro|Bus|Ligne)\s+([A-Za-z0-9]{1,4})\b')
# Les lignes dont la fréquentation n'est publiée qu'ensemble, calculées aussi comme une seule ligne.
REUNIONS = {
    ('lille', 'tram'): {'R+T': ['R', 'T']},
    ('valenciennes', 'tram'): {'T1+T2': ['T1', 'T2']},
    ('le-havre', 'tram'): {'A+B': ['A', 'B']},
    ('metz', 'bhns'): {'A+B': ['A', 'B']},
}
ROLES_ARRET = {'stop', 'stop_entry_only', 'stop_exit_only'}
ROLES_QUAI = {'platform', 'platform_entry_only', 'platform_exit_only'}


def fusionner(points, seuil=150.0):
    """Regroupe les arrêts des deux sens et les quais d'une même station."""
    gardes = []
    for p in points:
        if all(math.hypot(p[0] - q[0], p[1] - q[1]) > seuil for q in gardes):
            gardes.append(p)
    return gardes


def gares_de_france():
    """Les gares ferroviaires de toute la France (scripts/modele/lignes.py gares), en mètres."""
    donnees = json.load(open(os.path.join(MODELE, 'osm', 'gares.json')))
    points = [(e['lon'], e['lat']) for e in donnees['elements'] if e['type'] == 'node' and 'lat' in e]
    x, y = VERS_3035.transform(np.array([p[0] for p in points]), np.array([p[1] for p in points]))
    return np.column_stack([x, y])


def lignes_de(ville):
    """Les lignes d'une ville : les relations de même mode et de même nom qui partagent au moins une
    station forment une ligne (les deux sens, les branches). Deux lignes homonymes qui ne se touchent
    pas, comme la T1 de Marseille et celle d'Aubagne, restent séparées : la plus grande garde le nom,
    l'autre prend en plus celui de son réseau."""
    relations = []
    noeuds = {}
    for nom in (f'{ville}.json', f'{ville}-bus.json'):
        chemin = os.path.join(MODELE, 'osm', nom)
        if not os.path.exists(chemin):
            continue
        donnees = json.load(open(chemin))
        noeuds.update({e['id']: (e['lon'], e['lat']) for e in donnees['elements'] if e['type'] == 'node' and 'lat' in e})
        relations += [e for e in donnees['elements'] if e['type'] == 'relation']
    groupes = {}
    vues = set()
    for r in relations:
        if r['id'] in vues:
            continue
        vues.add(r['id'])
        t = r.get('tags', {})
        ref = (t.get('ref') or '').strip()
        if not ref:
            m = NUMERO_DANS_LE_NOM.match(t.get('name', ''))
            ref = m.group(1) if m else ''
        mode = MODES.get(t.get('route'))
        if not ref or not mode or EXCLUS.match(ref):
            continue
        membres = [m for m in r['members'] if m['type'] == 'node' and m['ref'] in noeuds]
        # Les arrêts et les quais sont deux façons de marquer les stations : on garde la plus complète,
        # certaines lignes de bus n'ayant que quelques arrêts marqués pour tous leurs quais.
        arrets = [m for m in membres if m['role'] in ROLES_ARRET]
        quais = [m for m in membres if m['role'] in ROLES_QUAI]
        arrets = max(arrets, quais, key=len) or membres
        pts = [noeuds[m['ref']] for m in arrets]
        if len(pts) < 2:
            continue
        lon, lat = zip(*pts)
        x, y = VERS_3035.transform(np.array(lon), np.array(lat))
        groupes.setdefault((mode, ref), []).append({'reseau': t.get('network') or t.get('operator') or '', 'nom': t.get('name', ''), 'points': list(zip(x, y))})
    lignes = []
    for (mode, ref), rels in groupes.items():
        # Union des relations qui ont une station à moins de 200 m l'une de l'autre.
        parent = list(range(len(rels)))
        def racine(i):
            while parent[i] != i:
                parent[i] = parent[parent[i]]
                i = parent[i]
            return i
        arbres = [cKDTree(np.array(r['points'])) for r in rels]
        for i in range(len(rels)):
            for j in range(i + 1, len(rels)):
                if racine(i) != racine(j) and arbres[j].query(np.array(rels[i]['points']), distance_upper_bound=200)[0].min() < np.inf:
                    parent[racine(j)] = racine(i)
        paquets = {}
        for i, r in enumerate(rels):
            paquets.setdefault(racine(i), []).append(r)
        candidates = []
        for paquet in paquets.values():
            stations = fusionner([p for r in paquet for p in r['points']])
            if len(stations) >= 2:
                candidates.append({'mode': mode, 'ref': ref, 'nom': paquet[0]['nom'], 'reseau': paquet[0]['reseau'], 'stations': stations})
        candidates.sort(key=lambda c: -len(c['stations']))
        for n, c in enumerate(candidates):
            if n > 0:
                c['ref'] = f"{ref} ({c['reseau'] or n + 1})"
            lignes.append(c)
    return lignes


def reunions(ville, lignes):
    """Les lignes réunies, ajoutées à part : elles ne comptent ni dans les correspondances ni dans le réseau."""
    ajouts = []
    for (v, mode), groupes in REUNIONS.items():
        if v != ville:
            continue
        for nom, refs in groupes.items():
            membres = [l for l in lignes if l['mode'] == mode and l['ref'] in refs]
            if len(membres) == len(refs):
                ajouts.append({'mode': mode, 'ref': nom, 'nom': ' et '.join(l['nom'] for l in membres), 'reseau': membres[0]['reseau'],
                               'stations': fusionner([p for l in membres for p in l['stations']])})
    return ajouts


def main():
    g = np.load(os.path.join(MODELE, 'grille.npz'))
    xy = np.column_stack([g['x'], g['y']]).astype(np.float64)
    hab = g['habitants'].astype(np.float64)
    emp = g['emplois'].astype(np.float64)
    arbre = cKDTree(xy)
    arbre_gares = cKDTree(gares_de_france())

    def somme(points, rayon):
        vus = set()
        for i in arbre.query_ball_point(points, rayon):
            vus.update(i)
        idx = np.fromiter(vus, dtype=np.int64) if vus else np.zeros(0, dtype=np.int64)
        return idx, hab[idx].sum(), emp[idx].sum()

    sortie = []
    stations = {}
    for ville in sorted(CENTRES):
        if not os.path.exists(os.path.join(MODELE, 'osm', f'{ville}.json')):
            continue
        lignes = lignes_de(ville)
        cx, cy = VERS_3035.transform(CENTRES[ville][1], CENTRES[ville][0])
        centre = np.array([[cx, cy]])
        _, pop10, emp10 = somme(centre, 10000)
        _, pop20, emp20 = somme(centre, 20000)
        _, _, emp_centre = somme(centre, 1000)
        # Toutes les stations de la ville, pour les correspondances et la concurrence.
        toutes = [(k, s) for k, l in enumerate(lignes) if l['mode'] != 'bhns' for s in l['stations']]
        arbre_stations = cKDTree(np.array([s for _, s in toutes])) if toutes else None
        n_lourdes = sum(1 for l in lignes if l['mode'] in ('metro', 'tram'))
        stations_lourdes = sum(len(l['stations']) for l in lignes if l['mode'] in ('metro', 'tram'))
        # Pour le bassin propre : combien de lignes lourdes desservent chaque carreau, à chaque distance.
        couverture = {}
        couvre = {}
        for r in RAYONS:
            compte = {}
            couvre[r] = {}
            for k, l in enumerate(lignes):
                if l['mode'] == 'bhns':
                    continue
                vus = set()
                for i in arbre.query_ball_point(np.array(l['stations']), r):
                    vus.update(i)
                couvre[r][k] = vus
                for i in vus:
                    compte[i] = compte.get(i, 0) + 1
            couverture[r] = compte
        # Une ligne réunie remplace ses membres : ils ne comptent ni comme correspondances ni comme concurrents.
        a_calculer = [(l, {k}) for k, l in enumerate(lignes)]
        for r_ in reunions(ville, lignes):
            membres = {k for k, l in enumerate(lignes) if l['mode'] == r_['mode'] and l['ref'] in REUNIONS[(ville, r_['mode'])][r_['ref']]}
            a_calculer.append((r_, membres))
        for l, soi in a_calculer:
            st = np.array(l['stations'])
            lon, lat = VERS_4326.transform(st[:, 0], st[:, 1])
            stations.setdefault(ville, {})[f"{l['mode']}|{l['ref']}"] = [[round(float(a), 6), round(float(b), 6)] for a, b in zip(lon, lat)]
            d = np.hypot(st[:, 0] - cx, st[:, 1] - cy)
            n = len(st)
            dist = np.hypot(st[:, None, 0] - st[None, :, 0], st[:, None, 1] - st[None, :, 1])
            longueur = minimum_spanning_tree(dist).sum() / 1000
            ligne = {
                'ville': ville, 'ligne': l['ref'], 'mode': l['mode'], 'nom': l['nom'], 'reseau': l['reseau'], 'stations': n, 'longueur_km': round(longueur, 2),
                'dist_centre_km': round(d.min() / 1000, 2), 'part_centre': round(float((d < 1500).mean()), 3),
                'ville_hab_10k': round(pop10), 'ville_emp_10k': round(emp10), 'ville_hab_20k': round(pop20), 'ville_emp_20k': round(emp20),
                'emplois_centre_1k': round(emp_centre), 'lignes_reseau': n_lourdes, 'stations_reseau': stations_lourdes,
            }
            for r in RAYONS:
                idx, h, e = somme(st, r)
                ligne[f'hab_{r}'] = round(h)
                ligne[f'emp_{r}'] = round(e)
                # Le carreau se partage entre les lignes lourdes qui le desservent, la ligne elle-même comprise.
                def lignes_du_carreau(i):
                    n = couverture[r].get(i, 0) - sum(1 for k in soi if i in couvre[r].get(k, ()))
                    return n + 1
                parts = np.array([1.0 / lignes_du_carreau(int(i)) for i in idx])
                ligne[f'hab_propre_{r}'] = round(float((hab[idx] * parts).sum())) if len(idx) else 0
                ligne[f'emp_propre_{r}'] = round(float((emp[idx] * parts).sum())) if len(idx) else 0
            for r in (2000, 5000):
                _, h, e = somme(st, r)
                ligne[f'hab_{r // 1000}k'] = round(h)
                ligne[f'emp_{r // 1000}k'] = round(e)
            # Correspondances avec les autres lignes et avec les gares.
            corr = 0
            stations_corr = 0
            for s in st:
                # Une ville sans métro ni tram (Metz, Nîmes, Pau) n'offre aucune correspondance.
                proches = arbre_stations.query_ball_point(s, 250) if arbre_stations is not None else []
                autres = {toutes[i][0] for i in proches} - soi
                corr += len(autres)
                stations_corr += 1 if autres else 0
            ligne['correspondances'] = corr
            ligne['stations_correspondance'] = stations_corr
            ligne['gares'] = sum(1 for s in st if arbre_gares.query_ball_point(s, 300))
            # Concurrence : la part du bassin à 400 m déjà couverte par une autre ligne.
            idx, h, e = somme(st, 400)
            autres = np.array([s for j, s in toutes if j not in soi])
            if len(autres) and len(idx):
                dans = cKDTree(autres).query(xy[idx], distance_upper_bound=400)[0] < np.inf
                partage = (hab[idx][dans].sum() + 0.3 * emp[idx][dans].sum()) / max(1.0, h + 0.3 * e)
            else:
                partage = 0.0
            ligne['part_partagee_400'] = round(float(partage), 3)
            sortie.append(ligne)
        print(ville, len(a_calculer), 'lignes', flush=True)

    colonnes = list(sortie[0].keys())
    with open(os.path.join(MODELE, 'variables.csv'), 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=colonnes)
        w.writeheader()
        w.writerows(sortie)
    json.dump(stations, open(os.path.join(MODELE, 'stations.json'), 'w'), separators=(',', ':'))
    print(len(sortie), 'lignes au total')


if __name__ == '__main__':
    main()
