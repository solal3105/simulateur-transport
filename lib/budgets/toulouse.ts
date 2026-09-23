import type { BudgetVille, Source } from '../budget'

const TISSEO = 'https://tisseo-collectivites.fr/sites/default/files/media'

const BUDGET_2026: Source = {
  titre: 'Tisséo Collectivités, budget primitif 2026',
  url: `${TISSEO}/pdfs/deliberations/2026/CS%2011.02.2026/D.2026.02.11.7.1-PJ.pdf`,
  pages: 'p. 4, 19 et 20',
}

export const toulouse: BudgetVille = {
  payeur: 'Tisséo Collectivités',
  total: {
    montants: { 1: 2600, 2: 1300 },
    simple: 'Tisséo investira environ 2,6 milliards d’euros de 2026 à 2032, puis 1,3 milliard de 2032 à 2038.',
    explication:
      'Tisséo Collectivités n’a pas publié de programme d’investissement pour 2026-2038. Pour le premier mandat, nous additionnons ses budgets : 869,9 M€ votés pour 2026, 763 M€ attendus en 2027 selon l’agence de notation Moody’s, environ 800 M€ de 2028 à 2030, ce qui reste de son plan de 4,5 milliards sur 2023-2030, puis environ 200 M€ en 2031. Pour le second mandat, une fois la ligne C payée, nous prenons ce que Tisséo peut investir chaque année sans s’endetter davantage : environ 200 M€ d’épargne et une vingtaine de millions de subventions, soit 1 300 M€ en six ans.',
    sources: [
      BUDGET_2026,
      {
        titre: 'Moody’s, analyse de crédit de Tisséo Collectivités, juin 2026',
        url: `${TISSEO}/downloads/Credit_Opinion_-_Translation-Tisseo-Collectivites-SMTCAT-15Jun2026-PBC_1481862.pdf`,
        pages: 'p. 5',
      },
      {
        titre: 'Tisséo Collectivités, prospectus obligataire 2026, plan d’investissement 2023-2030',
        url: `${TISSEO}/downloads/EUO2-%232006747555-v1%20Tisseo%20-%20EMTN%202026%20-%20Prospectus%20de%20Base%20%28Final%20with%20approval%20number%29.pdf`,
        pages: 'p. 19',
      },
      {
        titre: 'Tisséo Collectivités, présentation aux investisseurs, mai 2025',
        url: `${TISSEO}/downloads/tisseo-collectivites-investor-presentation_05-2025.pdf`,
        pages: 'p. 16',
      },
    ],
  },
  decides: {
    montants: { 1: 1800, 2: 0 },
    simple: 'La ligne C du métro, qui ouvre fin 2028, en prend encore 1,8 milliard au premier mandat.',
    explication:
      'La ligne C du métro, la ligne Aéroport et le prolongement de la ligne B à Labège sont déjà dessinés sur notre carte. Leur enveloppe est de 3,4 milliards en euros de 2017, dont 1,6 milliard dépensé de 2022 à 2024. Tisséo ne publie pas ce qui reste à payer : nous l’estimons à 1,8 milliard sur le premier mandat, les 768 M€ inscrits au budget 2026 puis environ un milliard en 2027 et 2028. Rien ne reste à payer au second mandat.',
    sources: [
      BUDGET_2026,
      {
        titre: 'Tisséo Collectivités, enveloppe de la ligne C et de la ligne Aéroport, délibération du 24 juin 2026',
        url: `${TISSEO}/pdfs/deliberations/2026/CS%2024.06.2026/D.2026.06.24.1.2.5.pdf`,
        pages: 'p. 2',
      },
      {
        titre: 'Tisséo Collectivités, enveloppe de la connexion de la ligne B, délibération du 24 juin 2026',
        url: `${TISSEO}/pdfs/deliberations/2026/CS%2024.06.2026/D.2026.06.24.1.2.8.pdf`,
        pages: 'p. 2',
      },
      {
        titre: 'Tisséo Collectivités, rapport d’allocation des obligations vertes 2024',
        url: `${TISSEO}/downloads/rapport_allocation_fonds_et_impact_2024.pdf`,
        pages: 'p. 10 et 22',
      },
    ],
  },
  bus: {
    montants: { 1: 150, 2: 200 },
    simple: 'Renouveler les bus et électrifier leurs dépôts coûte 150 à 200 millions par mandat.',
    explication:
      'Tisséo possède ses 572 bus. Il prévoit de 320 à 395 M€ pour les renouveler et électrifier leurs dépôts de 2025 à 2040, soit 20 à 25 M€ par an. Trois achats sont déjà votés : la conversion du dépôt de Langlade à l’électrique, 65 bus électriques et 55 bus articulés. Nous répartissons ces montants selon son calendrier d’achat, plus chargé au second mandat : 163 bus articulés électriques sont prévus de 2031 à 2040, et 164 bus standards de 2034 à 2038.',
    sources: [
      {
        titre: 'Tisséo Collectivités, stratégie énergétique des bus, 20 mai 2026',
        url: `${TISSEO}/downloads/D.2026.05.20.8.1.pdf`,
        pages: 'p. 2 à 6',
      },
      {
        titre: 'Tisséo Collectivités, stratégie d’achat des bus, 17 décembre 2025',
        url: `${TISSEO}/pdfs/deliberations/2025/CS%2017.12.2025/D.2025.12.17.5.3.pdf`,
        pages: 'p. 3',
      },
    ],
  },
  lignes: {
    montants: { 1: 450, 2: 450 },
    simple: 'Entretenir le métro et le tram, et remplacer leurs rames, coûte environ 450 millions par mandat.',
    explication:
      'Tisséo renouvelle lui-même ses rames et ses équipements : 64 M€ de travaux en 2023, 45 M€ en 2024, 95,4 M€ au budget 2026. Sont en cours 15 rames de VAL, 9 rames de tram, les escaliers mécaniques de la ligne B et l’alimentation électrique de la ligne A. Nous prolongeons ce rythme, environ 75 M€ par an. Le doublement de la ligne B, annoncé sans coût ni date, n’y est pas.',
    sources: [
      {
        titre: 'Tisséo Collectivités, rapport sur le compte administratif 2023',
        url: `${TISSEO}/pdfs/deliberations/2024/CS%2027.06.2024/D.2024.06.27.7.2-PJ.pdf`,
        pages: 'p. 2',
      },
      {
        titre: 'Tisséo Collectivités, rapport sur le compte administratif 2024',
        url: `${TISSEO}/pdfs/deliberations/2025/CS%2018.06.2025/D.2025.06.18.7.3-PJ.pdf`,
        pages: 'p. 3',
      },
      BUDGET_2026,
      {
        titre: 'Tisséo Collectivités, achat de rames de VAL, délibération du 11 février 2026',
        url: `${TISSEO}/pdfs/deliberations/2026/CS%2011.02.2026/D.2026.02.11.7.4.pdf`,
        pages: 'p. 2',
      },
      {
        titre: 'Tisséo Collectivités, achat de rames de tram, délibération du 11 février 2026',
        url: `${TISSEO}/pdfs/deliberations/2026/CS%2011.02.2026/D.2026.02.11.7.6.pdf`,
        pages: 'p. 2',
      },
    ],
  },
  leviers: {
    tarifs: { abonnement: 59, ticket: 1.9 },
    rendement: { abonnements: 3, tickets: 3.3, versementMobilite: 21 },
    tauxVersement: 2,
    fixes: { gratuiteTotale: -694, gratuiteMoins25: -150, suppressionTarifSocial: 155, metroNuit: -11, tva: 30 },
    textes: {
      metroNuit: {
        titre: 'Métro toute la nuit le week-end',
        detail: 'Les vendredis et samedis, sur les lignes A et B, qui roulent déjà jusqu’à 3 h.',
      },
    },
    simple:
      'Les billets et les abonnements rapportent environ 116 millions d’euros par an, et le versement mobilité des entreprises 352 millions.',
    explication:
      'Les recettes de trafic ont atteint 115,7 M€ hors taxes en 2025 : 55,1 M€ de tickets et de titres occasionnels, 50,2 M€ d’abonnements, et 9,9 M€ de titres payés par le Département pour les scolaires et les allocataires du RSA. Le versement mobilité est déjà à son taux maximal, 2 % de la masse salariale, et a rapporté 351,6 M€. Les moins de 26 ans font 22,5 % des recettes : leur gratuité coûterait environ 25 M€ par an avant 25 ans. Tisséo ne publie pas ce que coûte sa tarification solidaire, qui va jusqu’à la gratuité : si ses bénéficiaires payaient autant par voyage que les abonnés au plein tarif, ils rapporteraient au plus 26 M€ de plus par an, selon notre estimation. Le métro roule déjà jusqu’à 3 h les jeudis, vendredis et samedis : le faire rouler toute la nuit le week-end coûterait environ 1,8 M€ par an, d’après son coût au kilomètre. Les hausses de prix supposent que la fréquentation ne baisse pas.',
    sources: [
      {
        titre: 'Tisséo Voyageurs, rapport d’activité 2025, annexe à la séance du 24 juin 2026',
        url: 'https://www.tisseo.fr/sites/default/files/media/Seance-2026-06-24_02-Resolution-2.1-Annexe.pdf',
        pages: 'p. 51 à 55',
      },
      {
        titre: 'Tisséo Collectivités, chiffres clés 2025',
        url: `${TISSEO}/downloads/TISSEO_Chiffres%20cles_2025_WEB.pdf`,
        pages: 'p. 25 à 30',
      },
      {
        titre: 'Tisséo Collectivités, délibération sur le compte administratif 2025, 24 juin 2026',
        url: `${TISSEO}/pdfs/deliberations/2026/CS%2024.06.2026/D.2026.06.24.5.3.pdf`,
        pages: 'p. 3',
      },
      {
        titre: 'Tisséo Collectivités, supplément au prospectus, 1er juillet 2026',
        url: `${TISSEO}/downloads/Suppl%C3%A9ment%20prospectus%20CA%202025%20Vfinale.pdf`,
        pages: 'p. 4',
      },
      {
        titre: 'Code général des collectivités territoriales, article L2333-67, plafond du versement mobilité',
        url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043343028',
      },
      {
        titre: 'Tisséo, droits à réduction des jeunes et des étudiants, 2026',
        url: 'https://www.tisseo.fr/sites/default/files/media/Droits-a-reduction_Jeunes-etudiants-scolaires.pdf',
      },
    ],
  },
  limites: [
    'Tisséo n’a publié ni les montants de sa programmation 2026-2038 ni son étude de soutenabilité financière : les montants après 2027 sont déduits de ses documents, pas lus dedans.',
    'Le coût final de la ligne C en euros d’aujourd’hui n’est publié nulle part : ce qui reste à payer peut s’écarter de 300 M€ de notre estimation, dans un sens ou dans l’autre.',
    'Au premier mandat, l’argent libre n’arrive en réalité qu’à partir de 2029, une fois la ligne C payée. Le jeu ne fait pas cette différence.',
    'Toulouse Métropole porte sa contribution à 202 M€ en 2028 pour payer la ligne C, puis prévoit de la ramener à 130 M€. Si elle la gardait, il y aurait jusqu’à 400 M€ de plus par mandat.',
  ],
  releve: 'septembre 2026',
}
