"""
Habitants et emplois par carreau de 200 m pour une ville autre que Lyon, avec la méthode de Lyon
(data/insee/SOURCES.md). Écrit public/data/<ville>/carreaux.json : [lon, lat, habitants, emplois].

    python3 scripts/carreaux-ville.py toulouse

Entrées, à télécharger dans data/insee-france/ (non versionné) :
  f21.zip      carroyage Filosofi 2021 à 200 m, France métropolitaine (carreaux_200m_met.csv)
               https://www.insee.fr/fr/statistiques/8735162
  pop22.zip    population 2022 par IRIS (colonnes COM et P22_POP), pour recaler Filosofi sur le recensement
  emploi22.zip emploi au lieu de travail 2022 par commune (base-cc-emploi-pop-active-2022.CSV, P22_EMPLT)
               https://www.insee.fr/fr/statistiques/8581444
  sirene<dép>.csv  établissements employeurs géolocalisés de chaque département, téléchargés par le
               script depuis l'export Sirene d'Opendatasoft s'ils manquent

La liste des communes de l'autorité organisatrice est dans data/<ville>/communes.json. Dépendance : pyproj.
"""
import collections
import csv
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import zipfile

from pyproj import Transformer

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
INSEE = os.path.join(RACINE, 'data', 'insee-france')
VERS_3035 = Transformer.from_crs(4326, 3035, always_xy=True)
VERS_4326 = Transformer.from_crs(3035, 4326, always_xy=True)
# Milieu de chaque tranche d'effectif salarié de Sirene.
MILIEU = {1: 1.5, 2: 4, 3: 7.5, 11: 14.5, 12: 34.5, 21: 74.5, 22: 149.5, 31: 224.5, 32: 374.5, 41: 749.5, 42: 1499.5, 51: 3499.5, 52: 7499.5, 53: 10000}
# Les sièges des grandes administrations créent des pics artificiels, comme à Lyon.
PLAFOND_EMPLOIS = 4000


def sirene(dep):
    chemin = os.path.join(INSEE, f'sirene{dep}.csv')
    if not os.path.exists(chemin):
        q = urllib.parse.urlencode({
            'select': 'trancheeffectifsetablissementtriable,geolocetablissement,codecommuneetablissement',
            'where': f'codecommuneetablissement like "{dep}*" and etatadministratifetablissement="Actif" and trancheeffectifsetablissementtriable>=1',
            'delimiter': ';',
        })
        urllib.request.urlretrieve('https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/economicref-france-sirene-v3/exports/csv?' + q, chemin)
    return chemin


def construire(ville):
    communes = json.load(open(os.path.join(RACINE, 'data', ville, 'communes.json')))['communes']
    ressort = {c['code'] for c in communes}
    # Paris, Lyon et Marseille sont découpées en arrondissements dans les fichiers de l'INSEE et dans Sirene.
    for code, debut, nombre in (('75056', 75101, 20), ('69123', 69381, 9), ('13055', 13201, 16)):
        if code in ressort:
            ressort |= {str(debut + i) for i in range(nombre)}
    departements = sorted({c[:2] for c in ressort})

    # Habitants Filosofi 2021, par carreau (coordonnées du coin sud-ouest en EPSG:3035).
    habitants = collections.Counter()
    carreaux_commune = collections.defaultdict(list)
    f = io.TextIOWrapper(zipfile.ZipFile(os.path.join(INSEE, 'f21.zip')).open('carreaux_200m_met.csv'), encoding='utf-8')
    lecteur = csv.reader(f)
    entete = next(lecteur)
    i_com, i_car, i_ind = entete.index('lcog_geo'), entete.index('idcar_200m'), entete.index('ind')
    for ligne in lecteur:
        com = ligne[i_com][:5]
        if com not in ressort:
            continue
        m = re.match(r'CRS3035RES200mN(\d+)E(\d+)', ligne[i_car])
        k = (int(m.group(2)), int(m.group(1)))
        habitants[k] += float(ligne[i_ind])
        carreaux_commune[com].append(k)

    # Filosofi ne compte que les ménages fiscaux ordinaires : on recale sur le recensement 2022.
    recensement = collections.Counter()
    z = zipfile.ZipFile(os.path.join(INSEE, 'pop22.zip'))
    nom = [x for x in z.namelist() if 'meta' not in x.lower()][0]
    for ligne in csv.DictReader(io.TextIOWrapper(z.open(nom), encoding='utf-8'), delimiter=';'):
        com = ligne['COM'].strip('"')
        if com in ressort:
            recensement[com] += float(ligne['P22_POP'] or 0)
    facteur = sum(recensement.values()) / sum(habitants.values())

    # Emplois du recensement par commune, répartis entre les carreaux selon les effectifs de Sirene.
    emplois_commune = {}
    z = zipfile.ZipFile(os.path.join(INSEE, 'emploi22.zip'))
    for ligne in csv.DictReader(io.TextIOWrapper(z.open('base-cc-emploi-pop-active-2022.CSV'), encoding='utf-8'), delimiter=';'):
        com = ligne['CODGEO'].strip('"')
        if com in ressort:
            emplois_commune[com] = float(ligne['P22_EMPLT'] or 0)
    effectifs = collections.defaultdict(lambda: collections.defaultdict(float))
    total_effectifs = collections.Counter()
    for dep in departements:
        for ligne in csv.DictReader(open(sirene(dep), encoding='utf-8-sig'), delimiter=';'):
            com = ligne['codecommuneetablissement']
            if com not in ressort or not ligne['geolocetablissement']:
                continue
            tranche = int(ligne['trancheeffectifsetablissementtriable'])
            if tranche not in MILIEU:
                continue
            lat, lon = map(float, ligne['geolocetablissement'].split(','))
            x, y = VERS_3035.transform(lon, lat)
            k = (int(x // 200) * 200, int(y // 200) * 200)
            effectifs[k][com] += MILIEU[tranche]
            total_effectifs[com] += MILIEU[tranche]
    emplois = collections.Counter()
    for k, parts in effectifs.items():
        for com, v in parts.items():
            emplois[k] += v * emplois_commune.get(com, 0) / total_effectifs[com]
    # Une commune sans établissement géolocalisé répartit ses emplois comme ses habitants.
    for com in ressort:
        if total_effectifs[com] == 0 and emplois_commune.get(com) and carreaux_commune[com]:
            total = sum(habitants[k] for k in carreaux_commune[com]) or 1
            for k in carreaux_commune[com]:
                emplois[k] += emplois_commune[com] * habitants[k] / total
    for k in emplois:
        emplois[k] = min(emplois[k], PLAFOND_EMPLOIS)

    sortie = []
    for x, y in sorted(set(habitants) | set(emplois)):
        lon, lat = VERS_4326.transform(x + 100, y + 100)
        hab, emp = habitants.get((x, y), 0) * facteur, emplois.get((x, y), 0)
        if hab + emp >= 1:
            sortie.append([round(lon, 5), round(lat, 5), round(hab), round(emp)])
    dossier = os.path.join(RACINE, 'public', 'data', ville)
    os.makedirs(dossier, exist_ok=True)
    json.dump(sortie, open(os.path.join(dossier, 'carreaux.json'), 'w'), separators=(',', ':'))
    print(f'{ville} : {len(ressort)} codes communes, recensement {round(sum(recensement.values()))} habitants, '
          f'facteur {facteur:.4f}, {len(sortie)} carreaux, {round(sum(c[2] for c in sortie))} habitants, {round(sum(c[3] for c in sortie))} emplois')


if __name__ == '__main__':
    construire(sys.argv[1])
