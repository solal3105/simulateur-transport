"""
La grille nationale du moteur de fréquentation : habitants et emplois par carreau de 200 m, en
coordonnées métriques (EPSG:3035), pour toute la France métropolitaine.

Habitants : carroyage Filosofi 2021, recalé commune par commune sur le recensement 2022 (Filosofi
ignore les ménages non fiscaux, foyers et résidences). Emplois : emplois au lieu de travail du
recensement 2022 par commune, répartis entre les carreaux selon les établissements employeurs de
Sirene (milieu de chaque tranche d'effectif), plafonnés à 4 000 par carreau comme à Lyon ; dans une
commune sans établissement géolocalisé, ou dans un département dont Sirene n'est pas téléchargé,
les emplois suivent les habitants.

    python3 scripts/modele/grille.py

Entrées dans data/insee-france/ (voir scripts/carreaux-ville.py et scripts/modele/sirene.py).
Sortie : data/modele/grille.npz (non versionné, reconstruit en une minute).
"""
import collections
import csv
import glob
import io
import os
import re
import zipfile

import numpy as np
from pyproj import Transformer

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
INSEE = os.path.join(RACINE, 'data', 'insee-france')
SORTIE = os.path.join(RACINE, 'data', 'modele')
MILIEU = {1: 1.5, 2: 4, 3: 7.5, 11: 14.5, 12: 34.5, 21: 74.5, 22: 149.5, 31: 224.5, 32: 374.5, 41: 749.5, 42: 1499.5, 51: 3499.5, 52: 7499.5, 53: 10000}
PLAFOND_EMPLOIS = 4000
VERS_3035 = Transformer.from_crs(4326, 3035, always_xy=True)
# Paris, Lyon et Marseille : le recensement et Sirene parlent en arrondissements, Filosofi aussi.
ARRONDISSEMENTS = {'75056': [str(75101 + i) for i in range(20)], '69123': [str(69381 + i) for i in range(9)], '13055': [str(13201 + i) for i in range(16)]}


def lire_filosofi():
    """Habitants Filosofi par carreau (coin sud-ouest en mètres) et commune principale du carreau."""
    z = zipfile.ZipFile(os.path.join(INSEE, 'f21.zip'))
    lecteur = csv.reader(io.TextIOWrapper(z.open('carreaux_200m_met.csv'), encoding='utf-8'))
    entete = next(lecteur)
    i_car, i_com, i_ind = entete.index('idcar_200m'), entete.index('lcog_geo'), entete.index('ind')
    motif = re.compile(r'CRS3035RES200mN(\d+)E(\d+)')
    xs, ys, pops, communes = [], [], [], []
    for ligne in lecteur:
        m = motif.match(ligne[i_car])
        ys.append(int(m.group(1)))
        xs.append(int(m.group(2)))
        pops.append(float(ligne[i_ind]))
        # Un carreau à cheval sur plusieurs communes les énumère : on garde la première.
        communes.append(ligne[i_com][:5])
    return np.array(xs, dtype=np.int32), np.array(ys, dtype=np.int32), np.array(pops, dtype=np.float64), communes


def lire_recensement():
    z = zipfile.ZipFile(os.path.join(INSEE, 'pop22.zip'))
    nom = [x for x in z.namelist() if 'meta' not in x.lower()][0]
    pop = collections.Counter()
    for ligne in csv.DictReader(io.TextIOWrapper(z.open(nom), encoding='utf-8'), delimiter=';'):
        pop[ligne['COM'].strip('"')] += float(ligne['P22_POP'] or 0)
    return pop


def lire_emplois():
    z = zipfile.ZipFile(os.path.join(INSEE, 'emploi22.zip'))
    emplois = {}
    for ligne in csv.DictReader(io.TextIOWrapper(z.open('base-cc-emploi-pop-active-2022.CSV'), encoding='utf-8'), delimiter=';'):
        emplois[ligne['CODGEO'].strip('"')] = float(ligne['P22_EMPLT'] or 0)
    return emplois


def main():
    os.makedirs(SORTIE, exist_ok=True)
    xs, ys, pops, communes = lire_filosofi()
    print(len(xs), 'carreaux Filosofi', flush=True)

    # Recalage des habitants, commune par commune.
    recensement = lire_recensement()
    filosofi = collections.Counter()
    for c, p in zip(communes, pops):
        filosofi[c] += p
    facteur = {c: (recensement[c] / filosofi[c] if filosofi[c] > 0 and recensement.get(c) else 1.0) for c in filosofi}
    # Des facteurs extrêmes viennent de communes minuscules ou d'un carreau mal attribué : on les borne.
    habitants = np.array([p * min(3.0, max(0.5, facteur[c])) for p, c in zip(pops, communes)])

    # Emplois : Sirene là où il est téléchargé, sinon au prorata des habitants.
    emplois_commune = lire_emplois()
    for ville, arrs in ARRONDISSEMENTS.items():
        for a in arrs:
            emplois_commune.setdefault(a, 0.0)
    cle = lambda x, y: (int(x // 200) * 200, int(y // 200) * 200)
    poids = collections.defaultdict(lambda: collections.defaultdict(float))
    total_poids = collections.Counter()
    departements = set()
    for chemin in sorted(glob.glob(os.path.join(INSEE, 'sirene*.csv'))):
        dep = os.path.basename(chemin)[6:-4]
        departements.add(dep)
        lons, lats, lignes = [], [], []
        for ligne in csv.DictReader(open(chemin, encoding='utf-8-sig'), delimiter=';'):
            if not ligne['geolocetablissement']:
                continue
            tranche = int(ligne['trancheeffectifsetablissementtriable'] or 0)
            if tranche not in MILIEU:
                continue
            lat, lon = map(float, ligne['geolocetablissement'].split(','))
            lons.append(lon)
            lats.append(lat)
            lignes.append((ligne['codecommuneetablissement'], MILIEU[tranche]))
        if not lons:
            continue
        x3, y3 = VERS_3035.transform(np.array(lons), np.array(lats))
        for (com, effectif), x, y in zip(lignes, x3, y3):
            poids[com][cle(x, y)] += effectif
            total_poids[com] += effectif
        print('Sirene', dep, len(lignes), 'établissements', flush=True)

    index = {(int(x), int(y)): i for i, (x, y) in enumerate(zip(xs, ys))}
    emplois = np.zeros(len(xs))
    extra_x, extra_y, extra_e = [], [], []
    habitants_commune = collections.defaultdict(list)
    for i, c in enumerate(communes):
        habitants_commune[c].append(i)
    for com, total in emplois_commune.items():
        if total <= 0:
            continue
        if total_poids[com] > 0:
            for (x, y), w in poids[com].items():
                e = total * w / total_poids[com]
                j = index.get((x, y))
                if j is None:
                    extra_x.append(x)
                    extra_y.append(y)
                    extra_e.append(e)
                else:
                    emplois[j] += e
        elif habitants_commune.get(com):
            idx = habitants_commune[com]
            s = habitants[idx].sum() or 1.0
            emplois[idx] += total * habitants[idx] / s
    # Les carreaux d'emplois sans habitant s'ajoutent à la grille (zones d'activité, quartiers de bureaux).
    fusion = collections.Counter()
    for x, y, e in zip(extra_x, extra_y, extra_e):
        fusion[(x, y)] += e
    ex = np.array([k[0] for k in fusion], dtype=np.int32)
    ey = np.array([k[1] for k in fusion], dtype=np.int32)
    ee = np.array(list(fusion.values()))
    xs = np.concatenate([xs, ex])
    ys = np.concatenate([ys, ey])
    habitants = np.concatenate([habitants, np.zeros(len(ex))])
    emplois = np.minimum(np.concatenate([emplois, ee]), PLAFOND_EMPLOIS)

    np.savez_compressed(
        os.path.join(SORTIE, 'grille.npz'),
        x=xs + 100,
        y=ys + 100,
        habitants=habitants.astype(np.float32),
        emplois=emplois.astype(np.float32),
        departements=np.array(sorted(departements)),
    )
    print(f'{len(xs)} carreaux, {habitants.sum():.0f} habitants, {emplois.sum():.0f} emplois, départements Sirene : {" ".join(sorted(departements))}')


if __name__ == '__main__':
    main()
