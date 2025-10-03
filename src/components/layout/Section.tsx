import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface SectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  actions?: ReactNode
}

export function Section({
  title,
  description,
  actions,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn('space-y-6', className)} {...props}>
      {(title || description || actions) && (
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground max-w-3xl">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )}
