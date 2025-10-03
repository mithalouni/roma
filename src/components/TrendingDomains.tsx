import type { AnalyticsTimeRange } from '../types/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useTrendingDomains } from '../hooks/useDomaData'
import { formatCurrency } from '../lib/utils'
import { Sparkline } from './dashboard/Sparkline'
import { TrendPill } from './dashboard/TrendPill'

interface TrendingDomainsProps {
  timeRange: AnalyticsTimeRange
}

export function TrendingDomains({ timeRange }: TrendingDomainsProps) {
  const { data: domains, isLoading } = useTrendingDomains(timeRange)

  if (isLoading || !domains) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Trending Domains</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="divide-y divide-border/60" aria-label="Top trending domains">
          {domains.map((domain, index) => (
            <li key={domain.domainName} className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">{domain.domainName}</p>
                  <p className="text-sm text-muted-foreground">
                    {domain.transactionCount} {domain.transactionCount === 1 ? 'sale' : 'sales'} · Avg {formatCurrency(domain.averagePrice)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total volume {formatCurrency(domain.totalVolume)}</p>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-between gap-6 lg:justify-end">
                <Sparkline change={domain.priceChange24h} />
                <TrendPill value={domain.priceChange24h} label="24h price change" />
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
