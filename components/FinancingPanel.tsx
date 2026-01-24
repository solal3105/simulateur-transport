'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSimulatorStore } from '@/lib/store'
import { RotateCcw } from 'lucide-react'
import { FinancingLeverPeriod } from '@/lib/types'

// Helper to convert FinancingLeverPeriod to boolean for Switch
const isActive = (lever: FinancingLeverPeriod): boolean => 
  lever === true || lever === 'M1' || lever === 'M2' || lever === 'M1+M2'

export function FinancingPanel() {
  const { financingLevers, setFinancingLever, reset } = useSimulatorStore()

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl">Leviers de Financement</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-8 px-2"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Réinitialiser</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Gratuité Totale</label>
              <p className="text-xs text-muted-foreground">-1 925 M€/mandat</p>
            </div>
            <Switch
              checked={isActive(financingLevers.gratuiteTotale)}
              onCheckedChange={(checked) => setFinancingLever('gratuiteTotale', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Gratuité Conditionnée</label>
              <p className="text-xs text-muted-foreground">-300 M€/mandat</p>
            </div>
            <Switch
              checked={isActive(financingLevers.gratuiteConditionnee)}
              onCheckedChange={(checked) => setFinancingLever('gratuiteConditionnee', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Tarif Abonnements</label>
              <span className="text-sm font-medium text-primary">
                {financingLevers.tarifAbonnements > 0 ? '+' : ''}{financingLevers.tarifAbonnements}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Base: 74.10€ | +1% = +12 M€
            </p>
            <Slider
              value={[financingLevers.tarifAbonnements]}
              onValueChange={([value]) => setFinancingLever('tarifAbonnements', value)}
              min={-50}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Tarif Tickets</label>
              <span className="text-sm font-medium text-primary">
                {financingLevers.tarifTickets > 0 ? '+' : ''}{financingLevers.tarifTickets}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Base: 2.10€ | +1% = +8 M€
            </p>
            <Slider
              value={[financingLevers.tarifTickets]}
              onValueChange={([value]) => setFinancingLever('tarifTickets', value)}
              min={-50}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <label className="text-sm font-medium">Versement Mobilité</label>
            <Select
              value={financingLevers.versementMobilite.toString()}
              onValueChange={(value) => setFinancingLever('versementMobilite', parseInt(value) as -25 | 0 | 25 | 50)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-25">-25% (-700 M€)</SelectItem>
                <SelectItem value="0">Actuel (0 M€)</SelectItem>
                <SelectItem value="25">+25% (+700 M€)</SelectItem>
                <SelectItem value="50">+50% (+1 400 M€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">TVA 5.5%</label>
              <p className="text-xs text-muted-foreground">+96 M€/mandat</p>
            </div>
            <Switch
              checked={isActive(financingLevers.tva55)}
              onCheckedChange={(checked) => setFinancingLever('tva55', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
