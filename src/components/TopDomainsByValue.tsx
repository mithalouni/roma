import { ChevronLeft, ChevronRight, Layers } from 'lucide-react'
import { useState } from 'react'
import type { AnalyticsTimeRange } from '../types/analytics'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { useTrendingDomains } from '../hooks/useDomaData'
import { formatCurrency } from '../lib/utils'
import { Sparkline } from './dashboard/Sparkline'
import { TrendPill } from './dashboard/TrendPill'

interface TopDomainsByValueProps {
  timeRange: AnalyticsTimeRange
}

export function TopDomainsByValue({ timeRange }: TopDomainsByValueProps) {
  const { data: domains, isLoading } = useTrendingDomains(timeRange)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const totalPages = Math.ceil((domains?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedDomains = domains?.slice(startIndex, endIndex)

  if (isLoading || !domains) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Domains by Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 20 }).map((_, i) => (
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
        <CardTitle>Top Domains by Value</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="divide-y divide-border/60" aria-label="Top domains by value">
          {paginatedDomains?.map((domain, index) => {
            const globalIndex = startIndex + index
            return (
              <li key={domain.domainName} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {globalIndex + 1}
                  </span>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Layers className="h-4 w-4 text-primary flex-shrink-0" aria-hidden />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{domain.domainName}</p>
                      <p className="text-xs text-muted-foreground">
                        {domain.transactionCount === 1
                          ? `Single sale · ${formatCurrency(domain.totalVolume)}`
                          : `${domain.transactionCount} sales`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(domain.totalVolume)}</p>
                    {domain.transactionCount > 1 && (
                      <p className="text-xs text-muted-foreground">Avg {formatCurrency(domain.averagePrice)}</p>
                    )}
                  </div>
                  {domain.priceChange24h !== 0 && (
                    <div className="flex items-center gap-2">
                      <Sparkline change={domain.priceChange24h} compact />
                      <TrendPill value={domain.priceChange24h} compact />
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
        {domains && domains.length > itemsPerPage && (
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, domains.length)} of {domains.length} domains
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
