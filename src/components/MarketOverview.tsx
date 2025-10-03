import { TrendingUp, Activity, Layers, DollarSign } from 'lucide-react'
import { StatCard } from './StatCard'
import { useMarketStats } from '../hooks/useDomaData'
import { formatNumber, formatCurrency } from '../lib/utils'

export function MarketOverview() {
  const { data: stats, isLoading } = useMarketStats()

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Volume"
        value={formatCurrency(stats.totalVolume)}
        change={stats.volumeChange24h}
        icon={DollarSign}
      />
      <StatCard
        title="Total Transactions"
        value={formatNumber(stats.totalTransactions)}
        icon={Activity}
        description="All-time transactions"
      />
      <StatCard
        title="Active Domains"
        value={formatNumber(stats.activeDomains)}
        icon={Layers}
        description="Tokenized on Doma"
      />
      <StatCard
        title="Average Price"
        value={formatCurrency(stats.averagePrice)}
        icon={TrendingUp}
        description="30-day average"
      />
    </div>
  )
}
