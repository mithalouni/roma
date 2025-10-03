import { NetworkOverview } from '../components/NetworkOverview'
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
        <h2 className="text-3xl font-bold tracking-tight">Doma Analytics Dashboard</h2>
        <p className="text-muted-foreground max-w-2xl">
          Monitor network statistics, track domain marketplace activity, and discover trending domains on the Doma blockchain.
        </p>
      </div>

      <DomainSearch />

      {/* Network-level blockchain statistics */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold">Network Statistics</h3>
        <NetworkOverview />
      </div>

      {/* Domain marketplace statistics */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold">Domain Marketplace</h3>
        <MarketOverview />
      </div>

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
