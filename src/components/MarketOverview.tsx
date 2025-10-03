import { Activity, DollarSign, Layers } from 'lucide-react'
import type { AnalyticsTimeRange } from '../types/analytics'
import { useMarketStats } from '../hooks/useDomaData'
import { formatCurrency, formatNumber } from '../lib/utils'
import { StatCard } from './StatCard'

interface MarketOverviewProps {
  timeRange: AnalyticsTimeRange
}

export function MarketOverview({ timeRange }: MarketOverviewProps) {
  const { data: stats, isLoading } = useMarketStats(timeRange)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="24h Revenue"
        value={stats ? formatCurrency(stats.revenue24h) : '—'}
        change={stats?.revenueChange24h}
        icon={DollarSign}
        isLoading={isLoading}
      />
      <StatCard
        title="24h Transactions"
        value={stats ? formatNumber(stats.transactions24h) : '—'}
        change={stats?.transactionsChange24h}
        icon={Activity}
        isLoading={isLoading}
      />
      <StatCard
        title="Total Volume"
        value={stats ? formatCurrency(stats.totalVolume) : '—'}
        icon={DollarSign}
        isLoading={isLoading}
      />
      <StatCard
        title="Active Domains"
        value={stats ? formatNumber(stats.activeDomains) : '—'}
        icon={Layers}
        isLoading={isLoading}
      />
    </div>
  )
}
