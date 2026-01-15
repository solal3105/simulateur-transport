'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Project, MandatPeriod } from '@/lib/types'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import { Users } from 'lucide-react'

interface ProjectCardProps {
  project: Project
  selectedPeriod: MandatPeriod
  onSelectPeriod: (period: MandatPeriod) => void
}

export function ProjectCard({ project, selectedPeriod, onSelectPeriod }: ProjectCardProps) {
  const periods: MandatPeriod[] = project.mandatOnly === 'M1+M2' 
    ? ['M1+M2'] 
    : ['M1', 'M2', 'M1+M2']

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "p-4 transition-all hover:shadow-md",
        selectedPeriod && "ring-2 ring-primary"
      )}>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm md:text-base text-gray-900">
              {project.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs md:text-sm">
              <span className="font-medium text-primary">
                {formatCurrency(project.cost)}
              </span>
              {project.impact && (
                <span className="flex items-center gap-1 text-gray-600">
                  <Users className="w-3 h-3" />
                  {formatNumber(project.impact)} voyageurs/jour
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {periods.map((period) => (
              <Button
                key={period}
                size="sm"
                variant={selectedPeriod === period ? 'default' : 'outline'}
                onClick={() => onSelectPeriod(selectedPeriod === period ? null : period)}
                className="flex-1 text-xs md:text-sm h-8 md:h-9"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
