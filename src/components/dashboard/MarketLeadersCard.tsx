import * as Tabs from '@radix-ui/react-tabs'
import { useMemo } from 'react'
import type { TopAccount } from '../../services/domaService'
import { formatAddress, formatCurrency } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'

interface MarketLeadersCardProps {
  buyers?: TopAccount[]
  sellers?: TopAccount[]
  isLoading?: boolean
}

export function MarketLeadersCard({ buyers, sellers, isLoading }: MarketLeadersCardProps) {
  const isEmpty = !buyers?.length && !sellers?.length

  const loadingSkeleton = (
    <div className="space-y-3" aria-hidden>
      {[1, 2, 3].map((row) => (
        <div key={row} className="h-16 rounded-lg bg-muted/60 animate-pulse" />
      ))}
    </div>
  )

  const renderList = (items: TopAccount[] | undefined) => {
    if (!items?.length) {
      return (
        <div className="rounded-lg border border-dashed border-muted p-6 text-sm text-muted-foreground">
          No accounts match the current filters yet.
        </div>
      )
    }

    return (
      <ul className="space-y-3">
        {items.map((account, index) => (
          <li
            key={`${account.address}-${index}`}
            className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 transition hover:border-primary/40"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                #{index + 1}
              </span>
              <span className="font-medium text-base text-foreground">
                {formatAddress(account.address)}
              </span>
              <span className="text-xs text-muted-foreground">
                {account.tradeCount} {account.tradeCount === 1 ? 'trade' : 'trades'}
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-sm font-tabular">
                {formatCurrency(account.totalVolume)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  const defaultTab = useMemo(() => {
    if (buyers?.length) return 'buyers'
    if (sellers?.length) return 'sellers'
    return 'buyers'
  }, [buyers, sellers])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Accounts</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {loadingSkeleton}
            {loadingSkeleton}
          </div>
        ) : (
          <Tabs.Root defaultValue={defaultTab} className="space-y-4">
            <Tabs.List
              className="inline-flex items-center gap-1 rounded-full border border-muted bg-muted/50 p-1 text-sm font-medium"
              aria-label="Top marketplace wallets"
            >
              <Tabs.Trigger
                value="buyers"
                className="rounded-full px-4 py-2 transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                Top Buyers
              </Tabs.Trigger>
              <Tabs.Trigger
                value="sellers"
                className="rounded-full px-4 py-2 transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                Top Sellers
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="buyers" className="focus-visible:outline-none">
              {renderList(buyers)}
            </Tabs.Content>
            <Tabs.Content value="sellers" className="focus-visible:outline-none">
              {renderList(sellers)}
            </Tabs.Content>
          </Tabs.Root>
        )}
        {!isLoading && isEmpty && (
          <div className="mt-6 rounded-xl border border-dashed border-muted p-6 text-center text-sm text-muted-foreground">
            We couldn’t find any market leaders for this time range. Try adjusting the filters.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
