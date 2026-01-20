import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  
  if (absValue >= 1000) {
    const billions = absValue / 1000
    const formattedBillions = billions % 1 === 0 ? billions.toFixed(0) : billions.toFixed(1)
    return `${sign}${formattedBillions} Milliard${billions > 1 ? 's' : ''} €`
  }
  return `${sign}${absValue} Million${absValue > 1 ? 's' : ''} €`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}
