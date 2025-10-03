import type { AnalyticsTimeRange } from '../types/analytics'
import { useRecentTransactions } from '../hooks/useDomaData'
import { TransactionsTable } from './dashboard/TransactionsTable'

interface RecentTransactionsProps {
  timeRange: AnalyticsTimeRange
}

export function RecentTransactions({ timeRange }: RecentTransactionsProps) {
  const { data: transactions, isLoading } = useRecentTransactions(timeRange)

  return <TransactionsTable transactions={transactions} isLoading={isLoading} />
}
