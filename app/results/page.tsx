'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSimulatorStore } from '@/lib/store'
import { PROJECTS } from '@/lib/data'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { ArrowLeft, Download, Share2, Users, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ResultsPage() {
  const router = useRouter()
  const { projectSelections, financingLevers, getBudgetState } = useSimulatorStore()
  const budget = getBudgetState()

  const selectedProjects = projectSelections.map(selection => {
    const project = PROJECTS.find(p => p.id === selection.projectId)!
    return { ...selection, project }
  })

  const m1Projects = selectedProjects.filter(s => s.period === 'M1' || s.period === 'M1+M2')
  const m2Projects = selectedProjects.filter(s => s.period === 'M2' || s.period === 'M1+M2')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/simulator')}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au simulateur
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                Résultats de la Simulation
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-2">
                Synthèse de vos choix budgétaires
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Impact Total</p>
                  <p className="text-2xl md:text-3xl font-bold">
                    {formatNumber(budget.totalImpact)}
                  </p>
                  <p className="text-xs opacity-75">voyageurs/jour</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Mandat 1</p>
                  <p className="text-2xl md:text-3xl font-bold">
                    {formatCurrency(budget.m1)}
                  </p>
                  <p className="text-xs opacity-75">restant</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <p className="text-sm opacity-90">Mandat 2</p>
                  <p className="text-2xl md:text-3xl font-bold">
                    {formatCurrency(budget.m2)}
                  </p>
                  <p className="text-xs opacity-75">restant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Mandat 1 (2026-2032)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {m1Projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun projet sélectionné</p>
                  ) : (
                    m1Projects.map(({ project, period }) => (
                      <div key={project.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{project.name}</p>
                          {project.impact && (
                            <p className="text-xs text-muted-foreground">
                              +{formatNumber(project.impact)} voyageurs/jour
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-semibold text-primary">
                            {formatCurrency(period === 'M1+M2' ? project.cost / 2 : project.cost)}
                          </p>
                          {period === 'M1+M2' && (
                            <span className="text-xs text-muted-foreground">Étalé</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Mandat 2 (2032-2038)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {m2Projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun projet sélectionné</p>
                  ) : (
                    m2Projects.map(({ project, period }) => (
                      <div key={project.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{project.name}</p>
                          {project.impact && (
                            <p className="text-xs text-muted-foreground">
                              +{formatNumber(project.impact)} voyageurs/jour
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-semibold text-primary">
                            {formatCurrency(period === 'M1+M2' ? project.cost / 2 : project.cost)}
                          </p>
                          {period === 'M1+M2' && (
                            <span className="text-xs text-muted-foreground">Étalé</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Leviers de Financement Appliqués</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Gratuité Totale</span>
                  <span className="font-medium">
                    {financingLevers.gratuiteTotale ? 'Activée' : 'Désactivée'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Gratuité Conditionnée</span>
                  <span className="font-medium">
                    {financingLevers.gratuiteConditionnee ? 'Activée' : 'Désactivée'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tarif Abonnements</span>
                  <span className="font-medium">
                    {financingLevers.tarifAbonnements > 0 ? '+' : ''}{financingLevers.tarifAbonnements}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tarif Tickets</span>
                  <span className="font-medium">
                    {financingLevers.tarifTickets > 0 ? '+' : ''}{financingLevers.tarifTickets}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Versement Mobilité</span>
                  <span className="font-medium">
                    {financingLevers.versementMobilite > 0 ? '+' : ''}{financingLevers.versementMobilite}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TVA 5.5%</span>
                  <span className="font-medium">
                    {financingLevers.tva55 ? 'Activée' : 'Désactivée'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 md:mt-8 text-center"
        >
          <Button
            size="lg"
            onClick={() => router.push('/simulator')}
            className="px-8"
          >
            Modifier la simulation
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
