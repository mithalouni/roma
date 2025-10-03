import { TooltipProvider } from '@radix-ui/react-tooltip'
import { useState } from 'react'
import { KeywordTrends } from '../components/KeywordTrends'
import { MarketOverview } from '../components/MarketOverview'
import { NetworkOverview } from '../components/NetworkOverview'
import { RecentTransactions } from '../components/RecentTransactions'
import { TopAccounts } from '../components/TopAccounts'
import { TrendingDomains } from '../components/TrendingDomains'
import { VolumeChart } from '../components/VolumeChart'
import type { AnalyticsTimeRange } from '../types/analytics'

export function Home() {
  const [timeRange] = useState<AnalyticsTimeRange>('30d')

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

          <RecentTransactions timeRange={timeRange} />
        </div>
      </main>
    </TooltipProvider>
  )
}
