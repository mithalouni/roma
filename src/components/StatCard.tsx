import * as Tooltip from '@radix-ui/react-tooltip'
import type { HTMLAttributes, KeyboardEvent, MouseEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'
import { TrendPill } from './dashboard/TrendPill'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  description?: string
  changeLabel?: string
  tooltip?: string
  isLoading?: boolean
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  changeLabel,
  tooltip,
  isLoading,
  className,
  onClick,
  onKeyDown,
  ...rest
}: StatCardProps) {
  if (isLoading) {
    return <div className="h-32 rounded-lg border bg-white animate-pulse" />
  }

  const isInteractive = typeof onClick === 'function'

  const content = (
    <Card
      className={cn(
        'group flex h-full flex-col justify-between rounded-lg border bg-white transition hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
        isInteractive && 'cursor-pointer',
        className
      )}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onClick?.(event as unknown as MouseEvent<HTMLDivElement>)
        }
        onKeyDown?.(event)
      }}
      {...rest}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <Icon aria-hidden className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1 pb-4 pt-0">
        <CardTitle className="text-2xl font-semibold tracking-tight font-tabular">
          {value}
        </CardTitle>
        {change !== undefined && (
          <TrendPill value={change} label={changeLabel ?? 'vs previous period'} />
        )}
      </CardContent>
    </Card>
  )

  if (!tooltip) {
    return content
  }

  return (
    <Tooltip.Root delayDuration={200}>
      <Tooltip.Trigger asChild>{content}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={8}
          className="max-w-xs rounded-lg border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md"
        >
          {tooltip}
          <Tooltip.Arrow className="fill-popover" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
