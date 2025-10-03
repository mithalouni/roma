import { MarketOverview } from '../components/MarketOverview'
import { VolumeChart } from '../components/VolumeChart'
import { TrendingDomains } from '../components/TrendingDomains'
import { KeywordTrends } from '../components/KeywordTrends'
import { RecentTransactions } from '../components/RecentTransactions'
import { TopAccounts } from '../components/TopAccounts'
import { DomainSearch } from '../components/DomainSearch'

export function Home() {
  return (
    <main className="container py-6 space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight">Blockchain Domain Explorer</h2>
        <p className="text-muted-foreground max-w-2xl">
          Monitor live transaction flow, identify the hottest domains, and uncover the keywords and wallets driving Doma&apos;s on-chain marketplace.
        </p>
      </div>

      <DomainSearch />

      <MarketOverview />

      <div className="grid gap-6 lg:grid-cols-2">
        <VolumeChart />
        <KeywordTrends />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendingDomains />
        <TopAccounts />
      </div>

      <RecentTransactions />
    </main>
  )
}
