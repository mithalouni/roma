import type { AnalyticsTimeRange } from '../types/analytics'
import { useTopAccounts } from '../hooks/useDomaData'
import { MarketLeadersCard } from './dashboard/MarketLeadersCard'

interface TopAccountsProps {
  timeRange: AnalyticsTimeRange
}

export function TopAccounts({ timeRange }: TopAccountsProps) {
  const { data, isLoading } = useTopAccounts(timeRange)

  return <MarketLeadersCard buyers={data?.buyers} sellers={data?.sellers} isLoading={isLoading} />
}
