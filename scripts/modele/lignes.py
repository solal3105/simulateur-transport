"""
Les lignes du moteur de fréquentation : pour chaque ville, les lignes de métro et de tram (et les bus
à haut niveau de service qu'on lui demande) avec leurs stations dans l'ordre, et les gares, tirées
d'OpenStreetMap par Overpass.

    python3 scripts/modele/lignes.py                 toutes les villes
    python3 scripts/modele/lignes.py lyon nantes     quelques villes
    python3 scripts/modele/lignes.py gares           les gares ferroviaires de toute la France
    python3 scripts/modele/lignes.py bus marseille B1 B2    des lignes de bus rapides d'une ville
    OVERPASS_URL=... python3 scripts/modele/lignes.py

Les réponses brutes vont dans data/modele/osm/<ville>.json (non versionné).
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
DOSSIER = os.path.join(RACINE, 'data', 'modele', 'osm')
SERVEUR = os.environ.get('OVERPASS_URL', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter')

# Emprise de chaque ville : sud, ouest, nord, est.
VILLES = {
    'lyon': (45.60, 4.70, 45.90, 5.10),
    'toulouse': (43.50, 1.30, 43.72, 1.56),
    'marseille': (43.20, 5.25, 43.45, 5.65),
    'nice': (43.62, 7.10, 43.80, 7.40),
    'paris': (48.60, 2.00, 49.05, 2.70),
    'bordeaux': (44.75, -0.75, 44.95, -0.45),
    'strasbourg': (48.50, 7.65, 48.65, 7.85),
    'nantes': (47.13, -1.70, 47.30, -1.45),
    'rennes': (48.05, -1.75, 48.16, -1.60),
    'lille': (50.55, 2.95, 50.75, 3.25),
    'montpellier': (43.55, 3.75, 43.70, 3.98),
    'grenoble': (45.10, 5.65, 45.25, 5.85),
    'rouen': (49.35, 1.00, 49.50, 1.15),
    'saint-etienne': (45.38, 4.30, 45.48, 4.45),
    'le-mans': (47.95, 0.10, 48.05, 0.25),
    'angers': (47.42, -0.62, 47.52, -0.50),
    'tours': (47.33, 0.62, 47.45, 0.75),
    'dijon': (47.28, 4.97, 47.37, 5.10),
    'brest': (48.37, -4.55, 48.43, -4.43),
    'clermont-ferrand': (45.73, 3.05, 45.82, 3.15),
    'reims': (49.20, 3.98, 49.30, 4.08),
    'caen': (49.13, -0.43, 49.23, -0.30),
    'orleans': (47.85, 1.85, 47.95, 1.98),
    'besancon': (47.20, 5.95, 47.28, 6.08),
    'mulhouse': (47.70, 7.25, 47.80, 7.40),
    'nancy': (48.65, 6.10, 48.72, 6.25),
    'valenciennes': (50.30, 3.45, 50.40, 3.60),
    'avignon': (43.90, 4.75, 43.98, 4.88),
    'le-havre': (49.47, 0.08, 49.53, 0.20),
    'metz': (49.07, 6.12, 49.15, 6.22),
    'nimes': (43.80, 4.30, 43.88, 4.42),
    'amiens': (49.86, 2.25, 49.93, 2.35),
    'pau': (43.28, -0.40, 43.35, -0.30),
}


def requete(ville, bus_refs=()):
    s, o, n, e = VILLES[ville]
    b = f'{s},{o},{n},{e}'
    bus = ''
    if bus_refs:
        motif = '|'.join(bus_refs)
        bus = f'rel["route"~"^(bus|trolleybus)$"]["ref"~"^({motif})$"]({b});'
    return (
        f'[out:json][timeout:180];'
        f'(rel["route"~"^(subway|tram|light_rail|monorail|aerialway)$"]({b});{bus})->.r;'
        f'.r out body;'
        f'node(r.r)->.n;.n out skel;'
        f'(node["railway"~"^(station|halt)$"]["train"="yes"]({b});node["railway"~"^(station|halt)$"]["station"="train"]({b}););out body;'
    )


# Les gares de toute la France métropolitaine, pour les correspondances avec le train.
FRANCE = '41.3,-5.2,51.1,9.6'
REQUETE_GARES = (
    f'[out:json][timeout:300];('
    f'node["railway"~"^(station|halt)$"]["train"="yes"]({FRANCE});'
    f'node["railway"~"^(station|halt)$"]["station"="train"]({FRANCE});'
    f'node["railway"~"^(station|halt)$"][!"station"][!"subway"][!"tram"][!"light_rail"]({FRANCE});'
    f');out body;'
)


def telecharger(ville, bus_refs=()):
    chemin = os.path.join(DOSSIER, f'{ville}.json')
    # Une ville déjà téléchargée n'est pas redemandée, sauf avec FORCER=1.
    if os.path.exists(chemin) and not os.environ.get('FORCER'):
        return 'déjà là'
    texte = REQUETE_GARES if ville == 'gares' else requete(ville, bus_refs)
    donnees = urllib.parse.urlencode({'data': texte}).encode()
    for essai in range(5):
        try:
            req = urllib.request.Request(SERVEUR, data=donnees, headers={'User-Agent': 'simulateur-transport-modele/1.0'})
            corps = urllib.request.urlopen(req, timeout=200).read()
            json.loads(corps)
            open(chemin, 'wb').write(corps)
            return f'{len(corps) // 1024} ko'
        except Exception as ex:
            erreur = ex
            time.sleep(20 * (essai + 1))
    return f'échec : {erreur}'


def telecharger_bus(ville, refs):
    """Les lignes de bus rapides d'une ville dont on connaît la fréquentation, dans <ville>-bus.json."""
    s, o, n, e = VILLES[ville]
    b = f'{s},{o},{n},{e}'
    motif = '|'.join(refs)
    texte = f'[out:json][timeout:180];rel["route"~"^(bus|trolleybus)$"]["ref"~"^({motif})$"]({b})->.r;.r out body;node(r.r)->.n;.n out skel;'
    donnees = urllib.parse.urlencode({'data': texte}).encode()
    for essai in range(5):
        try:
            req = urllib.request.Request(SERVEUR, data=donnees, headers={'User-Agent': 'simulateur-transport-modele/1.0'})
            corps = urllib.request.urlopen(req, timeout=200).read()
            json.loads(corps)
            open(os.path.join(DOSSIER, f'{ville}-bus.json'), 'wb').write(corps)
            return f'{len(corps) // 1024} ko'
        except Exception as ex:
            erreur = ex
            time.sleep(20 * (essai + 1))
    return f'échec : {erreur}'


if __name__ == '__main__':
    os.makedirs(DOSSIER, exist_ok=True)
    if sys.argv[1:2] == ['bus']:
        print(sys.argv[2], telecharger_bus(sys.argv[2], sys.argv[3:]))
        sys.exit()
    villes = sys.argv[1:] or list(VILLES)
    for v in villes:
        print(v, telecharger(v), flush=True)
        time.sleep(3)
