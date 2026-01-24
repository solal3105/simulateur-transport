'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, isLeverActive } from '@/lib/gameStore'
import { FinancingLevers, MandatPeriod, FinancingLeverPeriod } from '@/lib/types'
import { BASE_PRICES } from '@/lib/data'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { formatCurrency, cn } from '@/lib/utils'
import { 
  Coins, 
  Users, 
  CreditCard,
  Building2,
  Percent,
  AlertTriangle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Gavel,
  Moon,
  GraduationCap,
  X
} from 'lucide-react'
import { useState } from 'react'

interface LeverInfo {
  title: string
  description: string
  impact: string
  warning?: string
  icon: React.ElementType
  color: string
  requiresLaw?: boolean
  lawType?: string
}

const leverInfos: Record<string, LeverInfo> = {
  gratuiteTotale: {
    title: "Gratuité Totale",
    description: "Rendre tous les transports gratuits pour tous les usagers. Active cette option pour bloquer les modifications de tarifs et les remettre à zéro.",
    impact: "-1 925 Millions €/mandat",
    warning: "⚠️ Bloque la possibilité de jouer avec les tarifs et remet les prix à leur valeur initiale.",
    icon: Users,
    color: "from-red-500 to-rose-600",
  },
  gratuiteConditionnee: {
    title: "Gratuité Conditionnée - Que pour les habitants de Lyon",
    description: "Gratuité réservée aux habitants de Lyon uniquement (pas les autres communes de la métropole) et dont les revenus sont inférieurs à 2 500€/mois.",
    impact: "-300 Millions €/mandat",
    warning: "Mesure sociale ciblée excluant les non-lyonnais et les revenus supérieurs à 2 500€.",
    icon: Users,
    color: "from-orange-500 to-amber-600",
  },
  suppressionTarifSocial: {
    title: "Supprimer la tarification sociale",
    description: "Fin de la gratuité pour les plus précaires, fin des abonnements solidaires. Mesure impopulaire mais qui génère des revenus supplémentaires.",
    impact: "+240 Millions €/mandat",
    warning: "⚠️ Mesure socialement contestable. Impacte les personnes les plus vulnérables. Bloqué si gratuité totale active.",
    icon: Users,
    color: "from-red-600 to-rose-700",
  },
  gratuiteJeunesAbonnes: {
    title: "Gratuité 11-18 ans enfants d'abonnés",
    description: "Gratuité des transports TCL pour les jeunes de 11 à 18 ans dont au moins un parent est abonné TCL.",
    impact: "-48 Millions €/mandat",
    icon: GraduationCap,
    color: "from-pink-500 to-rose-600",
  },
  metro24hWeekend: {
    title: "Métro 24h/24 les weekends",
    description: "Ouverture du métro toute la nuit les vendredis et samedis soirs pour faciliter les sorties nocturnes.",
    impact: "-24 Millions €/mandat",
    icon: Moon,
    color: "from-indigo-500 to-purple-600",
  },
  tarifAbonnements: {
    title: "Tarif Abonnements",
    description: "Ajuster le prix des abonnements mensuels.",
    impact: "+12 Millions € par +1%",
    icon: CreditCard,
    color: "from-blue-500 to-cyan-600",
  },
  tarifTickets: {
    title: "Tarif Tickets",
    description: "Ajuster le prix du ticket unitaire.",
    impact: "+8 Millions € par +1%",
    icon: CreditCard,
    color: "from-purple-500 to-pink-600",
  },
  versementMobilite: {
    title: "Versement Mobilité",
    description: "Taxation des entreprises de plus de 11 salariés pour financer les transports en commun. Baisser le taux peut se faire sans loi, mais l'augmenter nécessite une loi nationale.",
    impact: "±700 Millions € par ±25%",
    warning: "⚖️ Augmenter le taux nécessite une loi nationale.",
    icon: Building2,
    color: "from-green-500 to-emerald-600",
    requiresLaw: true,
    lawType: "Versement Mobilité",
  },
  tva55: {
    title: "TVA à 5,5%",
    description: "Passage de la TVA de 10% à 5,5% sur les transports publics.",
    impact: "+96 Millions €/mandat",
    warning: "⚖️ Nécessite une décision gouvernementale.",
    icon: Percent,
    color: "from-teal-500 to-cyan-600",
    requiresLaw: true,
    lawType: "TVA réduite",
  },
  electrificationBus: {
    title: "Électrification des Bus",
    description: "Conversion de la flotte de bus thermiques vers l'électrique. Réduction des émissions et du bruit, mais coût initial important.",
    impact: "460 Millions € total",
    warning: "⚠️ Désactiver augmentera les coûts de maintenance, de carburant et la pollution sur le long terme. C'est perdant économiquement et écologiquement.",
    icon: Building2,
    color: "from-green-500 to-teal-600",
  },
  entretienBus: {
    title: "Entretien Flotte de Bus",
    description: "Maintenance et renouvellement de la flotte de bus TCL. Indispensable pour maintenir la qualité de service sur l'ensemble du réseau.",
    impact: "800 Millions € total",
    warning: "⚠️ Désactiver dégradera la qualité de service et augmentera les pannes. Obligatoire pour un réseau fonctionnel.",
    icon: Building2,
    color: "from-orange-500 to-red-600",
  },
}

export function GameFinancingPanel() {
  const { financingLevers, setFinancingLever, getBudgetState } = useGameStore()
  const [expandedLever, setExpandedLever] = useState<string | null>(null)
  const [lawPopup, setLawPopup] = useState<{ show: boolean; lawType: string; onConfirm: () => void } | null>(null)
  const [budgetWarning, setBudgetWarning] = useState<{ show: boolean; deficit: number } | null>(null)
  const [electrificationWarning, setElectrificationWarning] = useState<{ show: boolean; onConfirm: () => void } | null>(null)
  const [entretienBusWarning, setEntretienBusWarning] = useState<{ show: boolean; onConfirm: () => void } | null>(null)
  const budget = getBudgetState()

  const totalLeverImpact = calculateTotalImpact(financingLevers)

  // Handle gratuité totale toggle - reset tariffs and disable incompatible options
  const handleGratuiteTotaleChange = (checked: boolean) => {
    if (checked) {
      setFinancingLever('tarifAbonnements', 0)
      setFinancingLever('tarifTickets', 0)
      setFinancingLever('gratuiteConditionnee', false)
      setFinancingLever('gratuiteJeunesAbonnes', false) // Already included in total gratuity
      setFinancingLever('suppressionTarifSocial', false) // Incompatible avec gratuité totale
    }
    setFinancingLever('gratuiteTotale', checked)
  }

  // Handle levers that require a law
  const handleLawLeverChange = (lever: keyof FinancingLevers, value: any, lawType: string) => {
    setLawPopup({
      show: true,
      lawType,
      onConfirm: () => {
        setFinancingLever(lever, value)
        setLawPopup(null)
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 tablet:space-y-6"
    >
      {/* Budget Summary - Sticky */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 -mx-4 px-4 py-3 -mt-3 mb-3 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={cn(
              "px-4 py-2 rounded-xl border-2",
              budget.m1 >= 0 ? "bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700" : "bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700"
            )}>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mandat 1</p>
              <p className={cn("text-lg font-bold", budget.m1 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {formatCurrency(budget.m1)}
              </p>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-xl border-2",
              budget.m2 >= 0 ? "bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700" : "bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700"
            )}>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mandat 2</p>
              <p className={cn("text-lg font-bold", budget.m2 >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {formatCurrency(budget.m2)}
              </p>
            </div>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-xl border-2",
            totalLeverImpact >= 0 ? "bg-emerald-50 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700" : "bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700"
          )}>
            <p className="text-xs text-gray-500 dark:text-gray-400">Leviers</p>
            <p className={cn("text-lg font-bold", totalLeverImpact >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
              {totalLeverImpact >= 0 ? '+' : ''}{formatCurrency(totalLeverImpact)}
            </p>
          </div>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl tablet:rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 tablet:p-6 shadow-lg">
        <div className="flex items-center gap-3 tablet:gap-4 mb-4 tablet:mb-5">
          <div className="w-10 h-10 tablet:w-14 tablet:h-14 rounded-xl tablet:rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <Coins className="w-5 h-5 tablet:w-7 tablet:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-lg tablet:text-2xl font-bold text-gray-900 dark:text-white">Leviers de Financement</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-0.5 tablet:mt-1 text-xs tablet:text-base">Équilibrez votre budget</p>
          </div>
        </div>
        
        {/* Total impact indicator */}
        <div className={cn(
          "px-3 tablet:px-5 py-3 tablet:py-4 rounded-lg tablet:rounded-xl flex items-center justify-between",
          totalLeverImpact >= 0 
            ? "bg-emerald-50 dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-600" 
            : "bg-red-50 dark:bg-gray-800 border-2 border-red-200 dark:border-red-500"
        )}>
          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm tablet:text-base">Impact total</span>
          <span className={cn(
            "text-base tablet:text-xl font-bold",
            totalLeverImpact >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
          )}>
            {totalLeverImpact >= 0 ? '+' : ''}{formatCurrency(totalLeverImpact)}/mandat
          </span>
        </div>
      </div>

      {/* Law Popup */}
      <AnimatePresence>
        {lawPopup?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setLawPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-amber-400 dark:border-amber-500 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Gavel className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-xl">Loi requise</h3>
                  <p className="text-amber-600 dark:text-amber-400 font-medium">{lawPopup.lawType}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Cette mesure nécessite un <strong className="text-gray-900 dark:text-white">changement législatif au niveau national</strong>. 
                Vous devrez convaincre le gouvernement et le parlement d&apos;adopter cette loi.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLawPopup(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={lawPopup.onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
                >
                  J&apos;assume !
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Warning Popup */}
      <AnimatePresence>
        {budgetWarning?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setBudgetWarning(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-400 dark:border-red-500 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-xl">Budget en déficit !</h3>
                  <p className="text-red-600 dark:text-red-400 font-medium">Financement insuffisant</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                Votre budget passerait en <strong className="text-red-600 dark:text-red-400">déficit de {formatCurrency(Math.abs(budgetWarning.deficit))}</strong>.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Les 2 milliards de base par mandat représentent déjà l&apos;équilibre très endetté du Sytral. 
                <strong className="text-gray-900 dark:text-white"> Vous devez trouver des financements supplémentaires</strong> avant de valider ce projet.
              </p>
              <button
                onClick={() => setBudgetWarning(null)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg"
              >
                Compris, je vais ajuster mon budget
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Electrification Warning Popup */}
      <AnimatePresence>
        {electrificationWarning?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setElectrificationWarning(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-orange-400 dark:border-orange-500 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-xl">Attention !</h3>
                  <p className="text-orange-600 dark:text-orange-400 font-medium">Désactivation de l&apos;électrification</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Impacts écologiques :</strong> Maintien des émissions de CO2 et de particules fines, aggravation de la pollution de l&apos;air.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Coûts de maintenance :</strong> Les bus thermiques nécessitent plus d&apos;entretien (moteur, échappement, filtres).
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Coûts de carburant :</strong> Dépendance au diesel dont le prix est volatile et en hausse.
                </p>
                <p className="text-red-600 dark:text-red-400 font-bold">
                  Sur le long terme, c&apos;est perdant économiquement et écologiquement.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setElectrificationWarning(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={electrificationWarning.onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
                >
                  Désactiver quand même
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entretien Bus Warning Popup */}
      <AnimatePresence>
        {entretienBusWarning?.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setEntretienBusWarning(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-red-400 dark:border-red-500 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-bold text-xl">Danger !</h3>
                  <p className="text-red-600 dark:text-red-400 font-medium">Désactivation de l&apos;entretien de la flotte</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Sécurité des usagers :</strong> Augmentation drastique des risques de pannes et d&apos;accidents. Mise en danger des voyageurs.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Qualité de service :</strong> Multiplication des retards, annulations et interruptions de service. Dégradation de l&apos;image du réseau TCL.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-900 dark:text-white">Coûts exponentiels :</strong> Les réparations d&apos;urgence coûtent 3 à 5 fois plus cher que l&apos;entretien préventif.
                </p>
                <p className="text-red-600 dark:text-red-400 font-bold">
                  Sans entretien, le réseau de bus s&apos;effondrera en quelques mois. C&apos;est irresponsable et intenable.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEntretienBusWarning(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={entretienBusWarning.onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold hover:from-red-600 hover:to-rose-700 transition-all shadow-lg"
                >
                  Désactiver quand même
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Tarification Sociale */}
      <div className="bg-white dark:bg-gray-800 rounded-xl tablet:rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 tablet:p-6 shadow-lg">
        <div className="flex items-center gap-2 tablet:gap-3 mb-3 tablet:mb-5">
          <div className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-lg tablet:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
            <Users className="w-4 h-4 tablet:w-5 tablet:h-5 text-white" />
          </div>
          <h3 className="text-base tablet:text-lg font-bold text-gray-900 dark:text-white">Tarification Sociale</h3>
        </div>
        <div className="space-y-4">
          {/* Gratuité Totale */}
          <LeverToggle
            lever="gratuiteTotale"
            info={leverInfos.gratuiteTotale}
            checked={financingLevers.gratuiteTotale}
            disabled={financingLevers.gratuiteConditionnee}
            onChange={handleGratuiteTotaleChange}
            expanded={expandedLever === 'gratuiteTotale'}
            onToggleExpand={() => setExpandedLever(expandedLever === 'gratuiteTotale' ? null : 'gratuiteTotale')}
          />

          {/* Gratuité Conditionnée (Aulas) */}
          <LeverToggle
            lever="gratuiteConditionnee"
            info={leverInfos.gratuiteConditionnee}
            checked={financingLevers.gratuiteConditionnee}
            disabled={financingLevers.gratuiteTotale}
            onChange={(checked) => setFinancingLever('gratuiteConditionnee', checked)}
            expanded={expandedLever === 'gratuiteConditionnee'}
            onToggleExpand={() => setExpandedLever(expandedLever === 'gratuiteConditionnee' ? null : 'gratuiteConditionnee')}
          />

          {/* Gratuité 11-18 ans */}
          <div className="relative">
            <LeverToggle
              lever="gratuiteJeunesAbonnes"
              info={leverInfos.gratuiteJeunesAbonnes}
              checked={financingLevers.gratuiteJeunesAbonnes}
              disabled={financingLevers.gratuiteTotale}
              onChange={(checked) => setFinancingLever('gratuiteJeunesAbonnes', checked)}
              expanded={expandedLever === 'gratuiteJeunesAbonnes'}
              onToggleExpand={() => setExpandedLever(expandedLever === 'gratuiteJeunesAbonnes' ? null : 'gratuiteJeunesAbonnes')}
            />
            {financingLevers.gratuiteTotale && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                <p className="text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>Déjà inclus dans la gratuité totale - inutile de l&apos;activer séparément</span>
                </p>
              </div>
            )}
          </div>

          {/* Métro 24h/24 weekends */}
          <LeverToggle
            lever="metro24hWeekend"
            info={leverInfos.metro24hWeekend}
            checked={financingLevers.metro24hWeekend}
            onChange={(checked) => setFinancingLever('metro24hWeekend', checked)}
            expanded={expandedLever === 'metro24hWeekend'}
            onToggleExpand={() => setExpandedLever(expandedLever === 'metro24hWeekend' ? null : 'metro24hWeekend')}
          />

          {/* Supprimer la tarification sociale */}
          <div className="relative">
            <LeverToggle
              lever="suppressionTarifSocial"
              info={leverInfos.suppressionTarifSocial}
              checked={financingLevers.suppressionTarifSocial}
              disabled={financingLevers.gratuiteTotale}
              onChange={(checked) => setFinancingLever('suppressionTarifSocial', checked)}
              expanded={expandedLever === 'suppressionTarifSocial'}
              onToggleExpand={() => setExpandedLever(expandedLever === 'suppressionTarifSocial' ? null : 'suppressionTarifSocial')}
            />
            {financingLevers.gratuiteTotale && (
              <div className="mt-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                <p className="text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>Incompatible avec la gratuité totale - remis à 0€</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Tarification */}
      <div className="bg-white dark:bg-gray-800 rounded-xl tablet:rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 tablet:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3 tablet:mb-5">
          <div className="flex items-center gap-2 tablet:gap-3">
            <div className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-lg tablet:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
              <CreditCard className="w-4 h-4 tablet:w-5 tablet:h-5 text-white" />
            </div>
            <h3 className="text-base tablet:text-lg font-bold text-gray-900 dark:text-white">Tarification</h3>
          </div>
          {financingLevers.gratuiteTotale && (
            <span className="px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 text-xs font-semibold">Bloqué - Gratuité active</span>
          )}
        </div>
        <div className="space-y-4">
          {/* Tarif Abonnements */}
          <LeverSlider
            lever="tarifAbonnements"
            info={leverInfos.tarifAbonnements}
            value={financingLevers.tarifAbonnements}
            onChange={(val) => setFinancingLever('tarifAbonnements', val)}
            min={0}
            max={50}
            basePrice={BASE_PRICES.abonnement}
            impactPerPercent={12}
            expanded={expandedLever === 'tarifAbonnements'}
            onToggleExpand={() => setExpandedLever(expandedLever === 'tarifAbonnements' ? null : 'tarifAbonnements')}
            disabled={financingLevers.gratuiteTotale}
          />

          {/* Tarif Tickets */}
          <LeverSlider
            lever="tarifTickets"
            info={leverInfos.tarifTickets}
            value={financingLevers.tarifTickets}
            onChange={(val) => setFinancingLever('tarifTickets', val)}
            min={0}
            max={50}
            basePrice={BASE_PRICES.ticket}
            impactPerPercent={8}
            expanded={expandedLever === 'tarifTickets'}
            onToggleExpand={() => setExpandedLever(expandedLever === 'tarifTickets' ? null : 'tarifTickets')}
            disabled={financingLevers.gratuiteTotale}
          />
        </div>
      </div>

      {/* Section Fiscalité */}
      <div className="bg-white dark:bg-gray-800 rounded-xl tablet:rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-4 tablet:p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3 tablet:mb-5">
          <div className="flex items-center gap-2 tablet:gap-3">
            <div className="w-8 h-8 tablet:w-10 tablet:h-10 rounded-lg tablet:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Building2 className="w-4 h-4 tablet:w-5 tablet:h-5 text-white" />
            </div>
            <h3 className="text-base tablet:text-lg font-bold text-gray-900 dark:text-white">Fiscalité</h3>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 text-xs font-semibold flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" />
            Loi requise
          </span>
        </div>
        <div className="space-y-4">

        {/* Versement Mobilité */}
        <LeverSelect
          lever="versementMobilite"
          info={leverInfos.versementMobilite}
          value={financingLevers.versementMobilite}
          onChange={(val) => {
            if (val > 0) {
              handleLawLeverChange('versementMobilite', val as -25 | 0 | 25 | 50, 'Augmentation du Versement Mobilité')
            } else {
              setFinancingLever('versementMobilite', val as -25 | 0 | 25 | 50)
            }
          }}
          expanded={expandedLever === 'versementMobilite'}
          onToggleExpand={() => setExpandedLever(expandedLever === 'versementMobilite' ? null : 'versementMobilite')}
        />

        {/* TVA 5.5% */}
        <LeverToggle
          lever="tva55"
          info={leverInfos.tva55}
          checked={financingLevers.tva55}
          onChange={(checked) => {
            if (checked) {
              handleLawLeverChange('tva55', true, 'Baisse de la TVA à 5,5%')
            } else {
              setFinancingLever('tva55', false)
            }
          }}
          expanded={expandedLever === 'tva55'}
          onToggleExpand={() => setExpandedLever(expandedLever === 'tva55' ? null : 'tva55')}
          showLawBadge
        />
        </div>
      </div>

      {/* Educational tip */}
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-2xl border-2 border-sky-200 dark:border-sky-700 p-5 shadow-lg">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">Conseil stratégique</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              Équilibrez augmentation des tarifs et aides sociales pour maintenir l&apos;attractivité du réseau tout en finançant vos projets ambitieux.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function LeverToggle({ 
  lever, 
  info, 
  checked, 
  disabled,
  onChange, 
  expanded, 
  onToggleExpand,
  showLawBadge = false,
}: {
  lever: string
  info: LeverInfo
  checked: FinancingLeverPeriod
  disabled?: FinancingLeverPeriod
  onChange: (checked: boolean) => void
  expanded: boolean
  onToggleExpand: () => void
  showLawBadge?: boolean
}) {
  const Icon = info.icon
  const isChecked = isLeverActive(checked)
  const isDisabled = disabled !== undefined ? isLeverActive(disabled) : false

  return (
    <div className={cn(
      "rounded-xl border-2 transition-all",
      isChecked 
        ? "border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" 
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50",
      showLawBadge && !isChecked ? "border-amber-300 dark:border-amber-600" : "",
      isDisabled ? "opacity-50" : ""
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
              info.color
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-semibold">{info.title}</p>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{info.impact}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onToggleExpand} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <Switch 
              checked={isChecked} 
              onCheckedChange={onChange}
              disabled={isDisabled}
            />
          </div>
        </div>
        
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">{info.description}</p>
            {info.warning && (
              <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-amber-700 dark:text-amber-300 text-sm">{info.warning}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function LeverSlider({
  lever,
  info,
  value,
  onChange,
  min,
  max,
  basePrice,
  impactPerPercent,
  expanded,
  onToggleExpand,
  disabled = false,
}: {
  lever: string
  info: LeverInfo
  value: number
  onChange: (val: number) => void
  min: number
  max: number
  basePrice: number
  impactPerPercent: number
  expanded: boolean
  onToggleExpand: () => void
  disabled?: FinancingLeverPeriod
}) {
  const Icon = info.icon
  const impact = value * impactPerPercent
  const currentPrice = basePrice * (1 + value / 100)
  const isDisabled = disabled !== undefined ? isLeverActive(disabled) : false

  return (
    <div className={cn(
      "rounded-xl border-2 transition-all",
      isDisabled ? "opacity-50 pointer-events-none" : "",
      value !== 0 
        ? "border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20" 
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
              info.color
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-semibold">{info.title}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Base: {basePrice.toFixed(2)}€</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className={cn(
                "text-lg font-bold",
                value > 0 ? "text-emerald-600 dark:text-emerald-400" : value < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
              )}>
                {value > 0 ? '+' : ''}{value}%
              </p>
              <p className={cn(
                "text-sm font-medium",
                value !== 0 ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
              )}>
                → {currentPrice.toFixed(2)}€
              </p>
              <p className={cn(
                "text-xs font-medium",
                impact > 0 ? "text-emerald-600 dark:text-emerald-400" : impact < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"
              )}>
                {impact > 0 ? '+' : ''}{formatCurrency(impact)}
              </p>
            </div>
            <button onClick={onToggleExpand} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Slider
            value={[value]}
            onValueChange={([val]) => onChange(val)}
            min={min}
            max={max}
            step={1}
            className="flex-1"
            disabled={isDisabled}
          />
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={value}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0
                onChange(Math.max(min, Math.min(max, val)))
              }}
              min={min}
              max={max}
              disabled={isDisabled}
              className="w-14 px-2 py-1.5 text-center text-sm font-semibold rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
            />
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">%</span>
          </div>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">{info.description}</p>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Prix actuel: <span className="text-gray-900 dark:text-white font-bold">{currentPrice.toFixed(2)}€</span>
                {value !== 0 && (
                  <span className={value > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                    {' '}({value > 0 ? '+' : ''}{(currentPrice - basePrice).toFixed(2)}€)
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function LeverSelect({
  lever,
  info,
  value,
  onChange,
  expanded,
  onToggleExpand,
}: {
  lever: string
  info: LeverInfo
  value: number
  onChange: (val: number) => void
  expanded: boolean
  onToggleExpand: () => void
}) {
  const Icon = info.icon
  const options = [
    { value: -25, label: '-25%', impact: '-700 M€' },
    { value: 0, label: 'Actuel', impact: '0' },
    { value: 25, label: '+25%', impact: '+700 M€' },
    { value: 50, label: '+50%', impact: '+1.4 Milliards €' },
  ]

  return (
    <div className={cn(
      "rounded-xl border-2 transition-all",
      value !== 0 
        ? "border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" 
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
              info.color
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-semibold">{info.title}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{info.impact}</p>
            </div>
          </div>
          <button onClick={onToggleExpand} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "py-3 px-2 rounded-xl text-sm font-semibold transition-all",
                value === opt.value
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <span className="block font-bold">{opt.label}</span>
              <span className={cn(
                "block text-xs mt-0.5",
                value === opt.value ? "text-white/80" : opt.value > 0 ? "text-emerald-600 dark:text-emerald-400" : opt.value < 0 ? "text-red-600 dark:text-red-400" : "text-gray-500"
              )}>
                {opt.impact}
              </span>
            </button>
          ))}
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">{info.description}</p>
            {info.warning && (
              <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-amber-700 dark:text-amber-300 text-sm">{info.warning}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function LeverPeriodSelect({
  lever,
  info,
  value,
  onChange,
  expanded,
  onToggleExpand,
}: {
  lever: string
  info: LeverInfo
  value: MandatPeriod
  onChange: (val: MandatPeriod) => void
  expanded: boolean
  onToggleExpand: () => void
}) {
  const Icon = info.icon
  const options: { value: MandatPeriod; label: string }[] = [
    { value: null, label: 'Désactivé' },
    { value: 'M1', label: 'Mandat 1' },
    { value: 'M2', label: 'Mandat 2' },
    { value: 'M1+M2', label: 'Étalé' },
  ]

  return (
    <div className={cn(
      "rounded-xl border-2 transition-all",
      value !== null 
        ? "border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20" 
        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
    )}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-md",
              info.color
            )}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-semibold">{info.title}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{info.impact}</p>
            </div>
          </div>
          <button onClick={onToggleExpand} className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => onChange(opt.value)}
              className={cn(
                "py-3 px-2 rounded-xl text-sm font-semibold transition-all",
                value === opt.value
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">{info.description}</p>
            {info.warning && (
              <div className="flex gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-amber-700 dark:text-amber-300 text-sm">{info.warning}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function calculateTotalImpact(levers: FinancingLevers): number {
  let impact = 0
  if (levers.gratuiteTotale) impact -= 1925
  if (levers.gratuiteConditionnee) impact -= 300
  if (levers.gratuiteJeunesAbonnes) impact -= 48
  if (levers.metro24hWeekend) impact -= 24
  // Suppression tarification sociale ne s'applique pas si gratuité totale
  if (levers.suppressionTarifSocial && !levers.gratuiteTotale) impact += 240
  // Les tarifs ne s'appliquent pas si gratuité totale
  if (!levers.gratuiteTotale) {
    impact += levers.tarifAbonnements * 12
    impact += levers.tarifTickets * 8
  }
  const vmImpacts: Record<string, number> = { '-25': -700, '0': 0, '25': 700, '50': 1400 }
  impact += vmImpacts[levers.versementMobilite.toString()] || 0
  if (levers.tva55) impact += 96
  // electrificationBus is now handled as a project cost, not a lever impact
  return impact
}
