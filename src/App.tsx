import { Header } from './components/Header'
import { MarketOverview } from './components/MarketOverview'
import { VolumeChart } from './components/VolumeChart'
import { TrendingDomains } from './components/TrendingDomains'
import { KeywordTrends } from './components/KeywordTrends'
import { RecentTransactions } from './components/RecentTransactions'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Market Overview</h2>
          <p className="text-muted-foreground">
            Real-time analytics and insights for the Doma domain marketplace
          </p>
        </div>

        <MarketOverview />

        <div className="grid gap-6 lg:grid-cols-2">
          <VolumeChart />
          <div className="space-y-6">
            <TrendingDomains />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <KeywordTrends />
          <RecentTransactions />
        </div>
      </main>
    </div>
  )
}

export default App
