import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'

interface TrendPillProps {
  value?: number | null
  label?: string
  className?: string
  compact?: boolean
}

export function TrendPill({ value, label, className, compact = false }: TrendPillProps) {
  if (value === null || value === undefined) {
    return null
  }

  const numericValue = Number(value)
  const isPositive = numericValue > 0
  const isNegative = numericValue < 0
  const directionLabel = isPositive ? 'up' : isNegative ? 'down' : 'flat'

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold',
          isPositive && 'bg-success/10 text-success',
          isNegative && 'bg-destructive/10 text-destructive',
          !isPositive && !isNegative && 'bg-muted text-muted-foreground',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={`${label ?? 'change'} ${directionLabel} ${Math.abs(numericValue).toFixed(1)} percent`}
      >
        {isPositive && '↑'}
        {isNegative && '↓'}
        {!isPositive && !isNegative && '—'}
        {`${Math.abs(numericValue).toFixed(1)}%`}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full py-1 text-xs font-medium uppercase tracking-wide',
        isPositive && 'bg-success/10 text-success',
        isNegative && 'bg-destructive/10 text-destructive',
        !isPositive && !isNegative && 'text-muted-foreground',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`${label ?? 'change'} ${directionLabel} ${Math.abs(numericValue).toFixed(2)} percent`}
    >
      {isPositive ? (
        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      ) : isNegative ? (
        <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Minus className="h-3.5 w-3.5" aria-hidden />
      )}
      <span className="font-semibold">
        {isPositive && '↑'}
        {isNegative && '↓'}
        {!isPositive && !isNegative && '—'}
        {`${Math.abs(numericValue).toFixed(2)}%`}
      </span>
    </span>
  )
}
