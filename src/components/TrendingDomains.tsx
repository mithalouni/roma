import { ExternalLink, Layers } from 'lucide-react'
import type { AnalyticsTimeRange } from '../types/analytics'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { useRecentTransactions } from '../hooks/useDomaData'
import { formatAddress, formatCurrency, formatDateTime } from '../lib/utils'

interface TrendingDomainsProps {
  timeRange: AnalyticsTimeRange
}

export function TrendingDomains({ timeRange }: TrendingDomainsProps) {
  const { data: transactions, isLoading } = useRecentTransactions(timeRange)

  if (isLoading || !transactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentFive = transactions.slice(0, 5)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {recentFive.map((transaction) => (
            <div
              key={transaction.id}
              className="group flex items-center gap-4 p-3 rounded-lg border bg-background transition hover:bg-muted/40 cursor-pointer"
            >
              <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" aria-hidden />
              </span>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {transaction.domainName}
                  </p>
                  <span className="text-sm font-semibold text-foreground flex-shrink-0">
                    {formatCurrency(transaction.priceUsd)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate">{formatAddress(transaction.buyer)}</span>
                    <span>←</span>
                    <span className="truncate">{formatAddress(transaction.seller)}</span>
                  </div>
                  <span className="flex-shrink-0">{formatDateTime(transaction.timestamp)}</span>
                </div>
              </div>
              <ExternalLink
                aria-hidden
                className="h-4 w-4 flex-shrink-0 text-muted-foreground transition group-hover:text-primary"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
