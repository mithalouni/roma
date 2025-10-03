import { Activity, Layers, Clock, Users } from 'lucide-react'
import { StatCard } from './StatCard'
import { useNetworkStats } from '../hooks/useDomaData'
import { formatNumber } from '../lib/utils'

export function NetworkOverview() {
  const { data: stats, isLoading } = useNetworkStats()

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
        title="Total Blocks"
        value={formatNumber(stats.totalBlocks)}
        icon={Layers}
        description="Blocks mined on chain"
      />
      <StatCard
        title="Total Transactions"
        value={formatNumber(stats.totalTransactions)}
        icon={Activity}
        description="All-time network transactions"
      />
      <StatCard
        title="Total Addresses"
        value={formatNumber(stats.totalAddresses)}
        icon={Users}
        description="Unique wallet addresses"
      />
      <StatCard
        title="Average Block Time"
        value={`${stats.averageBlockTime.toFixed(1)}s`}
        icon={Clock}
        description="Time between blocks"
      />
    </div>
  )
}
