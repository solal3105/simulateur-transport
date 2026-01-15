'use client'

import { motion } from 'framer-motion'
import { ProjectCard } from '@/components/ProjectCard'
import { FinancingPanel } from '@/components/FinancingPanel'
import { BudgetIndicators } from '@/components/BudgetIndicators'
import { useSimulatorStore } from '@/lib/store'
import { PROJECTS } from '@/lib/data'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function SimulatorPage() {
  const router = useRouter()
  const { projectSelections, setProjectPeriod } = useSimulatorStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 md:mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
            Simulateur de Transport TCL
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Sélectionnez vos projets et ajustez les leviers de financement
          </p>
        </motion.div>

        <BudgetIndicators />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mt-4 md:mt-6">
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
                Projets de Transport ({PROJECTS.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {PROJECTS.map((project) => {
                  const selection = projectSelections.find(s => s.projectId === project.id)
                  return (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      selectedPeriod={selection?.period || null}
                      onSelectPeriod={(period) => setProjectPeriod(project.id, period)}
                    />
                  )
                })}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:sticky lg:top-4 h-fit"
          >
            <FinancingPanel />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
