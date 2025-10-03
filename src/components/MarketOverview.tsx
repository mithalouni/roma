import { Activity, Layers, DollarSign, Users } from 'lucide-react'
import { StatCard } from './StatCard'
import { useMarketStats } from '../hooks/useDomaData'
import { formatNumber, formatCurrency } from '../lib/utils'

export function MarketOverview() {
  const { data: stats, isLoading } = useMarketStats()

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="24h Revenue"
        value={formatCurrency(stats.revenue24h)}
        change={stats.revenueChange24h}
        changeLabel="vs previous 24h"
        icon={DollarSign}
      />
      <StatCard
        title="24h Transactions"
        value={formatNumber(stats.transactions24h)}
        change={stats.transactionsChange24h}
        changeLabel="vs previous 24h"
        icon={Activity}
      />
      <StatCard
        title="24h Active Wallets"
        value={formatNumber(stats.activeWallets24h)}
        change={stats.walletChange24h}
        changeLabel="vs previous 24h"
        icon={Users}
      />
      <StatCard
        title="Total Volume"
        value={formatCurrency(stats.totalVolume)}
        icon={DollarSign}
        description="All-time traded volume"
      />
      <StatCard
        title="Total Transactions"
        value={formatNumber(stats.totalTransactions)}
        icon={Activity}
        description="All-time marketplace transactions"
      />
      <StatCard
        title="Active Domains"
        value={formatNumber(stats.activeDomains)}
        icon={Layers}
        description="Tokenized on Doma"
      />
    </div>
  )
}
