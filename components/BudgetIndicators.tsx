'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSimulatorStore } from '@/lib/store'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import { Users, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BudgetIndicators() {
  const router = useRouter()
  const { getBudgetState } = useSimulatorStore()
  const budget = getBudgetState()

  const isValid = budget.m1 >= 0 && budget.m2 >= 0

  return (
    <div className="sticky top-4 space-y-3 md:space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
      >
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Impact Total</p>
              <p className="text-base md:text-lg font-bold text-gray-900 truncate">
                {formatNumber(budget.totalImpact)}
              </p>
              <p className="text-xs text-muted-foreground">voyageurs/jour</p>
            </div>
          </div>
        </Card>

        <Card className={cn(
          "p-4",
          budget.m1 < 0 && "ring-2 ring-red-500"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              budget.m1 >= 0 ? "bg-green-100" : "bg-red-100"
            )}>
              <TrendingUp className={cn(
                "w-5 h-5",
                budget.m1 >= 0 ? "text-green-600" : "text-red-600"
              )} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Budget M1</p>
              <p className={cn(
                "text-base md:text-lg font-bold truncate",
                budget.m1 >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(Math.abs(budget.m1))}
              </p>
              <p className="text-xs text-muted-foreground">
                {budget.m1 >= 0 ? 'restant' : 'déficit'}
              </p>
            </div>
          </div>
        </Card>

        <Card className={cn(
          "p-4",
          budget.m2 < 0 && "ring-2 ring-red-500"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
              budget.m2 >= 0 ? "bg-green-100" : "bg-red-100"
            )}>
              <TrendingUp className={cn(
                "w-5 h-5",
                budget.m2 >= 0 ? "text-green-600" : "text-red-600"
              )} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Budget M2</p>
              <p className={cn(
                "text-base md:text-lg font-bold truncate",
                budget.m2 >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {formatCurrency(Math.abs(budget.m2))}
              </p>
              <p className="text-xs text-muted-foreground">
                {budget.m2 >= 0 ? 'restant' : 'déficit'}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <Button
        size="lg"
        disabled={!isValid}
        onClick={() => router.push('/results')}
        className="w-full text-base h-12 md:h-14"
      >
        {isValid ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Valider la simulation
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 mr-2" />
            Budget déséquilibré
          </>
        )}
      </Button>

      {!isValid && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-center text-red-600"
        >
          Ajustez vos choix pour équilibrer les budgets des deux mandats
        </motion.p>
      )}
    </div>
  )
}
