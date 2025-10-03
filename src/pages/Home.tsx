import { TooltipProvider } from '@radix-ui/react-tooltip'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { KeywordTrends } from '../components/KeywordTrends'
import { MarketOverview } from '../components/MarketOverview'
import { NetworkOverview } from '../components/NetworkOverview'
import { TopAccounts } from '../components/TopAccounts'
import { TopDomainsByValue } from '../components/TopDomainsByValue'
import { TrendingDomains } from '../components/TrendingDomains'
import { VolumeChart } from '../components/VolumeChart'
import { useMarketActivity, useNetworkStats, useDashboardStats } from '../hooks/useDomaData'
import type { AnalyticsTimeRange } from '../types/analytics'

export function Home() {
  const [timeRange] = useState<AnalyticsTimeRange>('30d')

  const { isLoading: networkLoading } = useNetworkStats()
  const { isLoading: dashboardLoading } = useDashboardStats(timeRange)
  const { isLoading: activityLoading } = useMarketActivity(timeRange)

  const isLoading = networkLoading || dashboardLoading || activityLoading

  if (isLoading) {
    return (
      <TooltipProvider delayDuration={200}>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" aria-hidden />
            <p className="text-lg font-medium text-muted-foreground">Loading analytics data...</p>
          </div>
        </main>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto space-y-8">
          <NetworkOverview />

          <MarketOverview timeRange={timeRange} />

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <VolumeChart timeRange={timeRange} />
            </div>
            <div className="lg:col-span-5">
              <KeywordTrends timeRange={timeRange} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <TrendingDomains timeRange={timeRange} />
            </div>
            <div className="lg:col-span-6">
              <TopAccounts timeRange={timeRange} />
            </div>
          </div>

          <TopDomainsByValue timeRange={timeRange} />
        </div>
      </main>
    </TooltipProvider>
  )
}
