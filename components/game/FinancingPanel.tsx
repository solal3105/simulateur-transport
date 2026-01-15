'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/gameStore'
import { FinancingLevers } from '@/lib/types'
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
    impact: "-1 925 M€/mandat",
    warning: "⚠️ Bloque la possibilité de jouer avec les tarifs et remet les prix à leur valeur initiale.",
    icon: Users,
    color: "from-red-500 to-rose-600",
  },
  gratuiteConditionnee: {
    title: "Gratuité Conditionnée (Proposition Aulas)",
    description: "Gratuité réservée aux habitants de Lyon uniquement (pas les autres communes de la métropole) et dont les revenus sont inférieurs à 2 500€/mois.",
    impact: "-300 M€/mandat",
    warning: "Mesure sociale ciblée excluant les non-lyonnais et les revenus supérieurs à 2 500€.",
    icon: Users,
    color: "from-orange-500 to-amber-600",
  },
  gratuiteJeunesAbonnes: {
    title: "Gratuité 11-18 ans enfants d'abonnés",
    description: "Gratuité des transports TCL pour les jeunes de 11 à 18 ans dont au moins un parent est abonné TCL.",
    impact: "-48 M€/mandat",
    icon: GraduationCap,
    color: "from-pink-500 to-rose-600",
  },
  metro24hWeekend: {
    title: "Métro 24h/24 les weekends",
    description: "Ouverture du métro toute la nuit les vendredis et samedis soirs pour faciliter les sorties nocturnes.",
    impact: "-24 M€/mandat",
    icon: Moon,
    color: "from-indigo-500 to-purple-600",
  },
  tarifAbonnements: {
    title: "Tarif Abonnements",
    description: "Ajuster le prix des abonnements mensuels.",
    impact: "+12 M€ par +1%",
    icon: CreditCard,
    color: "from-blue-500 to-cyan-600",
  },
  tarifTickets: {
    title: "Tarif Tickets",
    description: "Ajuster le prix du ticket unitaire.",
    impact: "+8 M€ par +1%",
    icon: CreditCard,
    color: "from-purple-500 to-pink-600",
  },
  versementMobilite: {
    title: "Versement Mobilité",
    description: "Taxe payée par les entreprises de +11 salariés.",
    impact: "±700 M€ par ±25%",
    warning: "⚖️ Nécessite une loi nationale pour modifier le taux.",
    icon: Building2,
    color: "from-green-500 to-emerald-600",
    requiresLaw: true,
    lawType: "Versement Mobilité",
  },
  tva55: {
    title: "TVA à 5,5%",
    description: "Passage de la TVA de 10% à 5,5% sur les transports publics.",
    impact: "+96 M€/mandat",
    warning: "⚖️ Nécessite une décision gouvernementale.",
    icon: Percent,
    color: "from-teal-500 to-cyan-600",
    requiresLaw: true,
    lawType: "TVA réduite",
  },
}

export function GameFinancingPanel() {
  const { financingLevers, setFinancingLever, getBudgetState } = useGameStore()
  const [expandedLever, setExpandedLever] = useState<string | null>(null)
  const [lawPopup, setLawPopup] = useState<{ show: boolean; lawType: string; onConfirm: () => void } | null>(null)
  const budget = getBudgetState()

  const totalLeverImpact = calculateTotalImpact(financingLevers)

  // Handle gratuité totale toggle - reset tariffs when enabled
  const handleGratuiteTotaleChange = (checked: boolean) => {
    if (checked) {
      setFinancingLever('tarifAbonnements', 0)
      setFinancingLever('tarifTickets', 0)
    }
    setFinancingLever('gratuiteTotale', checked)
    if (checked) setFinancingLever('gratuiteConditionnee', false)
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
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold">Leviers de Financement</h2>
            <p className="text-gray-400 text-sm">Ajustez vos sources de revenus</p>
          </div>
        </div>
        
        {/* Total impact indicator */}
        <div className={cn(
          "mt-3 px-3 py-2 rounded-xl flex items-center justify-between",
          totalLeverImpact >= 0 ? "bg-green-500/20" : "bg-red-500/20"
        )}>
          <span className="text-gray-300 text-sm">Impact total leviers</span>
          <span className={cn(
            "font-bold",
            totalLeverImpact >= 0 ? "text-green-400" : "text-red-400"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setLawPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl border border-yellow-500/50 p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Gavel className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Loi requise</h3>
                  <p className="text-yellow-400 text-sm">{lawPopup.lawType}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Cette mesure nécessite un <strong className="text-white">changement législatif au niveau national</strong>. 
                Vous devrez convaincre le gouvernement et le parlement d&apos;adopter cette loi.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLawPopup(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={lawPopup.onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold hover:opacity-90 transition-opacity"
                >
                  J&apos;assume !
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section Politiques Publiques */}
      <div className="p-4 border-b border-gray-700/50">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" />
          Politiques Publiques
        </h3>
        <div className="space-y-3">
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
          <LeverToggle
            lever="gratuiteJeunesAbonnes"
            info={leverInfos.gratuiteJeunesAbonnes}
            checked={financingLevers.gratuiteJeunesAbonnes}
            onChange={(checked) => setFinancingLever('gratuiteJeunesAbonnes', checked)}
            expanded={expandedLever === 'gratuiteJeunesAbonnes'}
            onToggleExpand={() => setExpandedLever(expandedLever === 'gratuiteJeunesAbonnes' ? null : 'gratuiteJeunesAbonnes')}
          />

          {/* Métro 24h/24 weekends */}
          <LeverToggle
            lever="metro24hWeekend"
            info={leverInfos.metro24hWeekend}
            checked={financingLevers.metro24hWeekend}
            onChange={(checked) => setFinancingLever('metro24hWeekend', checked)}
            expanded={expandedLever === 'metro24hWeekend'}
            onToggleExpand={() => setExpandedLever(expandedLever === 'metro24hWeekend' ? null : 'metro24hWeekend')}
          />
        </div>
      </div>

      {/* Section Tarification */}
      <div className="p-4 border-b border-gray-700/50">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-400" />
          Tarification
          {financingLevers.gratuiteTotale && (
            <span className="text-xs text-red-400 ml-2">(Bloqué - Gratuité totale active)</span>
          )}
        </h3>
        <div className="space-y-3">
          {/* Tarif Abonnements */}
          <LeverSlider
            lever="tarifAbonnements"
            info={leverInfos.tarifAbonnements}
            value={financingLevers.tarifAbonnements}
            onChange={(val) => setFinancingLever('tarifAbonnements', val)}
            min={-30}
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
            min={-30}
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
      <div className="p-4 space-y-3">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-green-400" />
          Fiscalité
          <span className="text-xs text-yellow-400/70 ml-2">(Nécessite une loi)</span>
        </h3>

        {/* Versement Mobilité */}
        <LeverSelect
          lever="versementMobilite"
          info={leverInfos.versementMobilite}
          value={financingLevers.versementMobilite}
          onChange={(val) => {
            if (val !== 0) {
              handleLawLeverChange('versementMobilite', val as -25 | 0 | 25 | 50, 'Modification du Versement Mobilité')
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

      {/* Educational tip */}
      <div className="p-4 bg-green-500/10 border-t border-green-500/20">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-300/80 text-sm">
            <strong>Conseil :</strong> Équilibrez augmentation des tarifs et aides sociales pour maintenir l&apos;attractivité du réseau tout en finançant vos projets.
          </p>
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
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
  expanded: boolean
  onToggleExpand: () => void
  showLawBadge?: boolean
}) {
  const Icon = info.icon

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      checked ? "border-blue-500/50 bg-blue-500/10" : "border-gray-700/50 bg-gray-900/30",
      showLawBadge && !checked ? "border-yellow-500/30" : ""
    )}>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
              info.color
            )}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{info.title}</p>
              <p className="text-red-400 text-xs font-medium">{info.impact}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onToggleExpand} className="p-1 text-gray-400 hover:text-white">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <Switch 
              checked={checked} 
              onCheckedChange={onChange}
              disabled={disabled}
            />
          </div>
        </div>
        
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-700/50"
          >
            <p className="text-gray-400 text-sm mb-2">{info.description}</p>
            {info.warning && (
              <div className="flex gap-2 text-yellow-500/80 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{info.warning}</span>
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
  disabled?: boolean
}) {
  const Icon = info.icon
  const impact = value * impactPerPercent
  const currentPrice = basePrice * (1 + value / 100)

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      disabled ? "opacity-50 pointer-events-none" : "",
      value !== 0 ? "border-blue-500/50 bg-blue-500/10" : "border-gray-700/50 bg-gray-900/30"
    )}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
              info.color
            )}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{info.title}</p>
              <p className="text-gray-500 text-xs">Base: {basePrice.toFixed(2)}€</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className={cn(
                "font-bold",
                value > 0 ? "text-green-400" : value < 0 ? "text-red-400" : "text-gray-400"
              )}>
                {value > 0 ? '+' : ''}{value}%
              </p>
              <p className={cn(
                "text-xs font-medium",
                value !== 0 ? "text-yellow-400" : "text-gray-500"
              )}>
                → {currentPrice.toFixed(2)}€
              </p>
              <p className={cn(
                "text-xs",
                impact > 0 ? "text-green-400/70" : impact < 0 ? "text-red-400/70" : "text-gray-500"
              )}>
                {impact > 0 ? '+' : ''}{formatCurrency(impact)}
              </p>
            </div>
            <button onClick={onToggleExpand} className="p-1 text-gray-400 hover:text-white">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Slider
          value={[value]}
          onValueChange={([val]) => onChange(val)}
          min={min}
          max={max}
          step={1}
          className="w-full"
          disabled={disabled}
        />

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-gray-700/50"
          >
            <p className="text-gray-400 text-sm">{info.description}</p>
            <p className="text-gray-500 text-xs mt-2">
              Prix actuel: <span className="text-white font-medium">{currentPrice.toFixed(2)}€</span>
              {value !== 0 && (
                <span className={value > 0 ? "text-green-400" : "text-red-400"}>
                  {' '}({value > 0 ? '+' : ''}{(currentPrice - basePrice).toFixed(2)}€)
                </span>
              )}
            </p>
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
    { value: 0, label: 'Actuel', impact: '0 M€' },
    { value: 25, label: '+25%', impact: '+700 M€' },
    { value: 50, label: '+50%', impact: '+1 400 M€' },
  ]

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      value !== 0 ? "border-blue-500/50 bg-blue-500/10" : "border-gray-700/50 bg-gray-900/30"
    )}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
              info.color
            )}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{info.title}</p>
              <p className="text-gray-500 text-xs">{info.impact}</p>
            </div>
          </div>
          <button onClick={onToggleExpand} className="p-1 text-gray-400 hover:text-white">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "py-2 px-2 rounded-lg text-xs font-medium transition-all",
                value === opt.value
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                  : "bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
              )}
            >
              <span className="block">{opt.label}</span>
              <span className={cn(
                "block text-xs",
                opt.value > 0 ? "text-green-400/70" : opt.value < 0 ? "text-red-400/70" : ""
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
            className="mt-3 pt-3 border-t border-gray-700/50"
          >
            <p className="text-gray-400 text-sm mb-2">{info.description}</p>
            {info.warning && (
              <div className="flex gap-2 text-yellow-500/80 text-xs">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{info.warning}</span>
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
  // Les tarifs ne s'appliquent pas si gratuité totale
  if (!levers.gratuiteTotale) {
    impact += levers.tarifAbonnements * 12
    impact += levers.tarifTickets * 8
  }
  const vmImpacts: Record<string, number> = { '-25': -700, '0': 0, '25': 700, '50': 1400 }
  impact += vmImpacts[levers.versementMobilite.toString()] || 0
  if (levers.tva55) impact += 96
  return impact
}
