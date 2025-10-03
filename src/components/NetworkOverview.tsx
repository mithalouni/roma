import { Activity, Clock, Layers, Users } from 'lucide-react'
import { useNetworkStats } from '../hooks/useDomaData'
import { formatNumber } from '../lib/utils'
import { KPIGrid } from './dashboard/KPIGrid'
import { StatCard } from './StatCard'

export function NetworkOverview() {
  const { data: stats, isLoading } = useNetworkStats()

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Transactions"
        value={stats ? formatNumber(stats.totalTransactions) : '—'}
        icon={Activity}
        isLoading={isLoading}
      />
      <StatCard
        title="Total Addresses"
        value={stats ? formatNumber(stats.totalAddresses) : '—'}
        icon={Users}
        isLoading={isLoading}
      />
      <StatCard
        title="Total Blocks"
        value={stats ? formatNumber(stats.totalBlocks) : '—'}
        icon={Layers}
        isLoading={isLoading}
      />
      <StatCard
        title="Avg Block Time"
        value={stats ? `${stats.averageBlockTime.toFixed(1)}s` : '—'}
        icon={Clock}
        isLoading={isLoading}
      />
    </div>
  )
}
