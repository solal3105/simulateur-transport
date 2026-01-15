import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)} Md€`
  }
  return `${value} M€`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('fr-FR').format(value)
}
