import { Activity } from 'lucide-react'
import { StatCard } from './StatCard'
import { useNetworkStats } from '../hooks/useDomaData'
import { formatNumber } from '../lib/utils'

export function DailyTransactions() {
  const { data: stats, isLoading } = useNetworkStats()

  if (isLoading || !stats) {
    return <div className="h-32 rounded-lg bg-muted animate-pulse" />
  }

  // Format large numbers with K/M suffix
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`
    }
    return formatNumber(num)
  }

  return (
    <StatCard
      title="Daily Transactions"
      value={formatLargeNumber(stats.transactionsToday)}
      icon={Activity}
      description="Transactions today"
    />
  )
}
