import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useTrendingDomains } from '../hooks/useDomaData'
import { formatCurrency } from '../lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../lib/utils'

export function TrendingDomains() {
  const { data: domains, isLoading } = useTrendingDomains()

  if (isLoading || !domains) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Domains</CardTitle>
          <CardDescription>Most active domains by transaction volume</CardDescription>
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
    <Card>
      <CardHeader>
        <CardTitle>Trending Domains</CardTitle>
        <CardDescription>Top domains by transaction volume in the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {domains.map((domain, index) => (
            <div
              key={domain.domainName}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold">{domain.domainName}</p>
                  <p className="text-sm text-muted-foreground">
                    {domain.transactionCount} transactions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(domain.totalVolume)}</p>
                <div className={cn(
                  'flex items-center gap-1 text-sm',
                  domain.priceChange24h > 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {domain.priceChange24h > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(domain.priceChange24h).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
