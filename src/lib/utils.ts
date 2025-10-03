import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num.toString()
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`
}

export function formatAddress(address: string): string {
  if (!address) return ''
  const normalized = address.includes(':') ? address.split(':').pop() ?? address : address
  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString()
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString()
}
