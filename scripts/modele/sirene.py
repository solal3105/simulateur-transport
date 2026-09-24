"""
Télécharge, département par département, les établissements employeurs actifs et géolocalisés de la
base Sirene (export d'Opendatasoft), qui servent à répartir les emplois du recensement entre les
carreaux de 200 m. Les fichiers vont dans data/insee-france/, qui n'est pas versionné.

    python3 scripts/modele/sirene.py 69 75 92
"""
import os
import sys
import time
import urllib.parse
import urllib.request

DOSSIER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'data', 'insee-france')


def telecharger(dep):
    chemin = os.path.join(DOSSIER, f'sirene{dep}.csv')
    if os.path.exists(chemin) and os.path.getsize(chemin) > 1000:
        return 'déjà là'
    q = urllib.parse.urlencode({
        'select': 'trancheeffectifsetablissementtriable,geolocetablissement,codecommuneetablissement',
        'where': f'codecommuneetablissement like "{dep}*" and etatadministratifetablissement="Actif" and trancheeffectifsetablissementtriable>=1',
        'delimiter': ';',
    })
    url = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/economicref-france-sirene-v3/exports/csv?' + q
    for essai in range(4):
        try:
            urllib.request.urlretrieve(url, chemin + '.part')
            os.replace(chemin + '.part', chemin)
            return f'{os.path.getsize(chemin) // 1024} ko'
        except Exception as e:
            time.sleep(10 * (essai + 1))
            erreur = e
    return f'échec : {erreur}'


if __name__ == '__main__':
    os.makedirs(DOSSIER, exist_ok=True)
    for dep in sys.argv[1:]:
        print(dep, telecharger(dep), flush=True)
