import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'soft' | 'outline'
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em]',
        variant === 'default' && 'bg-primary text-primary-foreground',
        variant === 'soft' && 'bg-primary/10 text-primary ring-1 ring-primary/20',
        variant === 'outline' && 'border border-muted text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}
