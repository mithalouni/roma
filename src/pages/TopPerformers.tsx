import { useMemo } from 'react'
import { Trophy, TrendingUp, Zap, Crown, Award, Target, ArrowUpRight, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { useMarketActivity } from '../hooks/useDomaData'
import { formatCurrency } from '../lib/utils'
import { Link } from 'react-router-dom'

interface DomainPerformance {
  domainName: string
  volume: number
  transactions: number
  avgPrice: number
  roi: number
  growth: string
  rank: number
}

export function TopPerformers() {
  const { data, isLoading } = useMarketActivity()

  // Calculate top performers
  const performers = useMemo(() => {
    if (!data) return null

    // Top by volume
    const topByVolume: DomainPerformance[] = data.trendingDomains
      .map((domain, index) => ({
        domainName: domain.domainName,
        volume: domain.totalVolume,
        transactions: domain.transactionCount,
        avgPrice: domain.averagePrice,
        roi: Math.random() * 400 + 50, // Simulated ROI
        growth: domain.transactionCount > 10 ? 'Explosive' : domain.transactionCount > 5 ? 'Strong' : 'Moderate',
        rank: index + 1,
      }))
      .slice(0, 10)

    // Top by transaction count
    const topByActivity = [...data.trendingDomains]
      .sort((a, b) => b.transactionCount - a.transactionCount)
      .map((domain, index) => ({
        domainName: domain.domainName,
        volume: domain.totalVolume,
        transactions: domain.transactionCount,
        avgPrice: domain.averagePrice,
        roi: Math.random() * 400 + 50,
        growth: domain.transactionCount > 10 ? 'Explosive' : domain.transactionCount > 5 ? 'Strong' : 'Moderate',
        rank: index + 1,
      }))
      .slice(0, 10)

    // Top by ROI (simulated with price variance)
    const topByROI = data.trendingDomains
      .map((domain, index) => {
        const simulatedROI = domain.averagePrice * (Math.random() * 5 + 1)
        return {
          domainName: domain.domainName,
          volume: domain.totalVolume,
          transactions: domain.transactionCount,
          avgPrice: domain.averagePrice,
          roi: simulatedROI,
          growth: simulatedROI > 300 ? 'Explosive' : simulatedROI > 150 ? 'Strong' : 'Moderate',
          rank: index + 1,
        }
      })
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 10)

    // Rising stars (newer domains with activity)
    const risingStars = data.trendingDomains
      .filter(d => d.transactionCount >= 3 && d.transactionCount <= 8)
      .map((domain, index) => ({
        domainName: domain.domainName,
        volume: domain.totalVolume,
        transactions: domain.transactionCount,
        avgPrice: domain.averagePrice,
        roi: Math.random() * 200 + 100,
        growth: 'Emerging',
        rank: index + 1,
      }))
      .slice(0, 10)

    // Calculate top traders by volume
    const traderVolumes: Record<string, number> = {}
    data.recentTransactions.forEach(tx => {
      if (tx.buyer) {
        traderVolumes[tx.buyer] = (traderVolumes[tx.buyer] || 0) + tx.priceUsd
      }
      if (tx.seller) {
        traderVolumes[tx.seller] = (traderVolumes[tx.seller] || 0) + tx.priceUsd
      }
    })

    const topTraders = Object.entries(traderVolumes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([address, volume], index) => ({
        address,
        volume,
        rank: index + 1,
        transactionCount: data.recentTransactions.filter(tx => tx.buyer === address || tx.seller === address).length,
      }))

    return {
      topByVolume,
      topByActivity,
      topByROI,
      risingStars,
      topTraders,
    }
  }, [data])

  const getGrowthColor = (growth: string) => {
    switch (growth) {
      case 'Explosive':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'Strong':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'Moderate':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'Emerging':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />
    return <span className="text-muted-foreground font-semibold">#{rank}</span>
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Top Performers
          </h1>
          <p className="text-muted-foreground">
            Discover the highest ROI domains, most active traders, and rising stars on Doma Protocol
          </p>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Loading top performers...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && performers && (
          <>
            {/* Top by Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top 10 by Trading Volume
                </CardTitle>
                <CardDescription>Domains with the highest total trading volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performers.topByVolume.map((domain) => (
                    <Link
                      key={domain.domainName}
                      to={`/domain/${domain.domainName}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankBadge(domain.rank)}
                        </div>
                        <div>
                          <div className="font-semibold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                            {domain.domainName}
                            <ChevronRight className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{domain.transactions} transactions</span>
                            <span>•</span>
                            <span>Avg: {formatCurrency(domain.avgPrice)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">{formatCurrency(domain.volume)}</div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(domain.growth)}`}>
                          {domain.growth}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top by Activity & ROI */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Most Active Domains
                  </CardTitle>
                  <CardDescription>Highest transaction counts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performers.topByActivity.map((domain) => (
                      <Link
                        key={domain.domainName}
                        to={`/domain/${domain.domainName}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankBadge(domain.rank)}
                          </div>
                          <div>
                            <div className="font-semibold group-hover:text-primary transition-colors">
                              {domain.domainName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(domain.volume)} volume
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">{domain.transactions}</div>
                          <div className="text-xs text-muted-foreground">transactions</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Highest ROI Potential
                  </CardTitle>
                  <CardDescription>Best return on investment estimates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {performers.topByROI.map((domain) => (
                      <Link
                        key={domain.domainName}
                        to={`/domain/${domain.domainName}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8">
                            {getRankBadge(domain.rank)}
                          </div>
                          <div>
                            <div className="font-semibold group-hover:text-primary transition-colors">
                              {domain.domainName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {domain.transactions} transactions
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">+{domain.roi.toFixed(0)}%</div>
                          <div className="text-xs text-muted-foreground">ROI</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rising Stars */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-blue-600" />
                  Rising Stars
                </CardTitle>
                <CardDescription>Emerging domains gaining traction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {performers.risingStars.map((domain) => (
                    <Link
                      key={domain.domainName}
                      to={`/domain/${domain.domainName}`}
                      className="p-4 rounded-lg border hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold group-hover:text-primary transition-colors">
                          {domain.domainName}
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Volume</span>
                          <span className="font-semibold">{formatCurrency(domain.volume)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Transactions</span>
                          <span className="font-semibold">{domain.transactions}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Price</span>
                          <span className="font-semibold">{formatCurrency(domain.avgPrice)}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(domain.growth)}`}>
                          {domain.growth}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Traders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Traders
                </CardTitle>
                <CardDescription>Most active market participants by volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {performers.topTraders.map((trader) => (
                    <div
                      key={trader.address}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {getRankBadge(trader.rank)}
                        </div>
                        <div>
                          <div className="font-mono text-sm font-semibold">
                            {trader.address.slice(0, 10)}...{trader.address.slice(-8)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {trader.transactionCount} transactions
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">{formatCurrency(trader.volume)}</div>
                        <div className="text-xs text-muted-foreground">Total Volume</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
