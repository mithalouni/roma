import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Users, LoaderCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { useDashboardStats, useMarketActivity } from '../hooks/useDomaData'
import { formatCurrency } from '../lib/utils'
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { ANALYTICS_TIME_RANGES, type AnalyticsTimeRange } from '../types/analytics'

const timeRangeLabels: Record<AnalyticsTimeRange, string> = {
  '1h': 'Past Hour',
  '24h': 'Past 24 Hours',
  '7d': 'Past Week',
  '30d': 'Past Month',
  '1y': 'Past Year',
}

const rangeDurationsMs: Record<AnalyticsTimeRange, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000,
}

const isShortRange = (range: AnalyticsTimeRange) => range === '1h' || range === '24h'

const percentChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }
  return ((current - previous) / previous) * 100
}

export function MarketAnalytics() {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d')
  const [isFilteringData, setIsFilteringData] = useState(false)
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardStats(timeRange)
  const { data: activityData, isLoading: isActivityLoading } = useMarketActivity(timeRange)

  const handleTimeRangeChange = (range: AnalyticsTimeRange) => {
    setIsFilteringData(true)
    setTimeRange(range)
    // Simulate processing delay for better UX
    setTimeout(() => setIsFilteringData(false), 300)
  }

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!dashboardData || !activityData) return null

    const now = Date.now()
    const rangeDuration = rangeDurationsMs[timeRange]
    const cutoff = now - rangeDuration

    const filteredTransactions = activityData.recentTransactions.filter(
      (tx) => tx.timestamp * 1000 >= cutoff
    )
    const transactions = filteredTransactions.length > 0
      ? filteredTransactions
      : activityData.recentTransactions.slice(0, 25)

    const sortedSeries = [...dashboardData.series].sort(
      (a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime()
    )

    let filteredSeries = sortedSeries.filter((point) => {
      const pointTime = new Date(point.isoDate).getTime()
      if (isShortRange(timeRange)) {
        return now - pointTime <= 24 * 60 * 60 * 1000
      }
      return pointTime >= cutoff
    })

    if (filteredSeries.length === 0 && sortedSeries.length > 0) {
      filteredSeries = [sortedSeries[sortedSeries.length - 1]]
    }

    return {
      transactions,
      series: filteredSeries,
      domains: activityData.trendingDomains,
      topBuyers: activityData.topBuyers,
      topSellers: activityData.topSellers,
    }
  }, [dashboardData, activityData, timeRange])

  // Calculate market metrics
  const marketMetrics = useMemo(() => {
    if (!filteredData) return null

    const { transactions, series, domains, topBuyers, topSellers } = filteredData

    const sortedSeries = [...series].sort(
      (a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime()
    )

    const revenueFromSeries = sortedSeries.reduce((sum, point) => sum + point.revenueUsd, 0)
    const transactionCountFromSeries = sortedSeries.reduce((sum, point) => sum + point.transactionCount, 0)
    const revenueFromTransactions = transactions.reduce((sum, tx) => sum + tx.priceUsd, 0)

    const useTransactionSummary = isShortRange(timeRange)

    const volume = useTransactionSummary || revenueFromSeries === 0 ? revenueFromTransactions : revenueFromSeries
    const transactionCount = useTransactionSummary || transactionCountFromSeries === 0
      ? transactions.length
      : transactionCountFromSeries
    const averageValue = transactionCount > 0 ? volume / transactionCount : 0

    const uniqueDomainCount = new Set(transactions.map((tx) => tx.domainName.toLowerCase())).size
    const activeDomains = uniqueDomainCount > 0 ? uniqueDomainCount : domains.length

    const uniqueWallets = new Set<string>()
    transactions.forEach((tx) => {
      if (tx.buyer) uniqueWallets.add(tx.buyer)
      if (tx.seller) uniqueWallets.add(tx.seller)
    })

    const latestPoint = sortedSeries[sortedSeries.length - 1]
    const previousPoint = sortedSeries.length > 1 ? sortedSeries[sortedSeries.length - 2] : undefined

    const activeWallets = latestPoint && latestPoint.walletCount > 0
      ? latestPoint.walletCount
      : uniqueWallets.size

    const revenueChange = latestPoint && previousPoint
      ? percentChange(latestPoint.revenueUsd, previousPoint.revenueUsd)
      : null
    const transactionChange = latestPoint && previousPoint
      ? percentChange(latestPoint.transactionCount, previousPoint.transactionCount)
      : null
    const walletChange = latestPoint && previousPoint
      ? percentChange(latestPoint.walletCount, previousPoint.walletCount)
      : null

    const priceRanges = [
      { range: '$0-$100', min: 0, max: 100, count: 0 },
      { range: '$100-$500', min: 100, max: 500, count: 0 },
      { range: '$500-$1K', min: 500, max: 1000, count: 0 },
      { range: '$1K-$5K', min: 1000, max: 5000, count: 0 },
      { range: '$5K+', min: 5000, max: Infinity, count: 0 },
    ]

    domains.forEach((domain) => {
      const avgPrice = domain.averagePrice ?? (domain.transactionCount > 0 ? domain.totalVolume / domain.transactionCount : 0)
      const range = priceRanges.find((r) => avgPrice >= r.min && avgPrice < r.max)
      if (range) {
        range.count += domain.transactionCount
      }
    })

    transactions.forEach((tx) => {
      const range = priceRanges.find((r) => tx.priceUsd >= r.min && tx.priceUsd < r.max)
      if (range) range.count += 1
    })

    const daysToShow = isShortRange(timeRange) ? 0 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 60
    let avgValueByDay = sortedSeries
      .slice(daysToShow > 0 ? -daysToShow : undefined)
      .map((point) => ({
        date: point.dateLabel,
        avgValue: point.transactionCount > 0 ? point.revenueUsd / point.transactionCount : 0,
        count: point.transactionCount,
      }))

    if (avgValueByDay.length === 0 && transactions.length > 0) {
      const bucketSizeMs = timeRange === '1h' ? 15 * 60 * 1000 : 60 * 60 * 1000
      const bucketMap = new Map<number, { total: number; count: number }>()

      transactions.forEach((tx) => {
        const bucketTimestamp = Math.floor((tx.timestamp * 1000) / bucketSizeMs) * bucketSizeMs
        const bucket = bucketMap.get(bucketTimestamp) ?? { total: 0, count: 0 }
        bucket.total += tx.priceUsd
        bucket.count += 1
        bucketMap.set(bucketTimestamp, bucket)
      })

      avgValueByDay = Array.from(bucketMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([timestamp, bucket]) => ({
          date: new Date(timestamp).toLocaleTimeString('en-US', bucketSizeMs >= 60 * 60 * 1000 ? { hour: 'numeric' } : { hour: 'numeric', minute: '2-digit' }),
          avgValue: bucket.count > 0 ? bucket.total / bucket.count : 0,
          count: bucket.count,
        }))
        .slice(-12)
    }

    const lengthDistribution: Record<string, number> = {}
    domains.forEach((domain) => {
      const length = domain.domainName.replace('.eth', '').length
      const bucket = length <= 3 ? '1-3' : length <= 6 ? '4-6' : length <= 10 ? '7-10' : '11+'
      lengthDistribution[bucket] = (lengthDistribution[bucket] || 0) + 1
    })

    const lengthData = Object.entries(lengthDistribution).map(([length, count]) => ({
      length,
      count,
    }))

    const buyersForUi = (topBuyers ?? []).map((buyer) => ({
      address: buyer.address,
      volume: buyer.totalVolume,
    }))

    const sellersForUi = (topSellers ?? []).map((seller) => ({
      address: seller.address,
      volume: seller.totalVolume,
    }))

    return {
      priceRanges: priceRanges.filter((r) => r.count > 0),
      avgValueByDay,
      lengthData,
      topBuyers: buyersForUi,
      topSellers: sellersForUi,
      summary: {
        volume,
        transactionCount,
        averageValue,
        activeDomains,
        activeWallets,
        revenueChange,
        transactionChange,
        walletChange,
      },
    }
  }, [filteredData, timeRange])

  const renderChange = (change: number | null) => {
    if (change === null || Number.isNaN(change)) {
      return <span className="text-muted-foreground">No comparison</span>
    }
    const isPositive = change >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    return (
      <>
        <Icon className={`w-3 h-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
        <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
          {isPositive ? '+' : ''}
          {change.toFixed(1)}%
        </span>
        <span>vs previous period</span>
      </>
    )
  }

  const isLoading = isDashboardLoading || isActivityLoading || isFilteringData

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (isLoading && !dashboardData && !activityData) {
    return (
      <TooltipProvider delayDuration={200}>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" aria-hidden />
            <p className="text-lg font-medium text-muted-foreground">Loading market analytics...</p>
          </div>
        </main>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                Domain Marketplace Analytics
              </h1>
              <p className="text-muted-foreground mt-2">
                Deep dive into domain trading trends, pricing patterns, and marketplace activity
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              {ANALYTICS_TIME_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  disabled={isFilteringData}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 ${
                    timeRange === range
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background'
                  }`}
                >
                  {timeRangeLabels[range]}
                </button>
              ))}
            </div>
          </div>

        {dashboardData && activityData && marketMetrics && (
          <>
            {/* All-Time Marketplace Summary */}
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  Domain Marketplace - All-Time Stats
                </CardTitle>
                <CardDescription>Total activity on the Doma domain marketplace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(dashboardData.stats.totalVolume)}</div>
                    <div className="text-sm text-muted-foreground">Total Trading Volume</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{dashboardData.stats.totalTransactions.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Domain Transactions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{dashboardData.stats.activeDomains.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Active Domains</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Filtered Period Metrics ({timeRangeLabels[timeRange]})</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>{timeRangeLabels[timeRange]} Volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(marketMetrics.summary.volume)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    {renderChange(marketMetrics.summary.revenueChange)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Transactions {timeRangeLabels[timeRange]}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketMetrics.summary.transactionCount.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    {renderChange(marketMetrics.summary.transactionChange)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Avg Transaction Value</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(marketMetrics.summary.averageValue)}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <DollarSign className="w-3 h-3" />
                    <span>
                      Based on {marketMetrics.summary.transactionCount.toLocaleString()} trades
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Traders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{marketMetrics.summary.activeWallets.toLocaleString()}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    {renderChange(marketMetrics.summary.walletChange)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Covering {marketMetrics.summary.activeDomains.toLocaleString()} domains
                  </div>
                </CardContent>
              </Card>
            </div>
            </div>

            {/* Price Distribution */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Price Distribution
                  </CardTitle>
                  <CardDescription>Transactions by price range ({timeRangeLabels[timeRange]})</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={marketMetrics.priceRanges}
                        dataKey="count"
                        nameKey="range"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {marketMetrics.priceRanges.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Domain Length Distribution
                  </CardTitle>
                  <CardDescription>Popular domain name lengths</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={marketMetrics.lengthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="length" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Average Transaction Value Trend */}
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Average Transaction Value Trend
                  </CardTitle>
                  <CardDescription>Rolling averages for {timeRangeLabels[timeRange]}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={marketMetrics.avgValueByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="avgValue" stroke="#10b981" strokeWidth={2} name="Avg Value" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Traders */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Top Buyers
                  </CardTitle>
                  <CardDescription>Highest volume buyers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketMetrics.topBuyers.length > 0 ? (
                      marketMetrics.topBuyers.map((buyer, index) => (
                        <div key={buyer.address} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-mono text-sm">{buyer.address.slice(0, 10)}...{buyer.address.slice(-8)}</span>
                          </div>
                          <span className="font-semibold text-green-600">{formatCurrency(buyer.volume)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No buyer activity in this range</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Top Sellers
                  </CardTitle>
                  <CardDescription>Highest volume sellers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketMetrics.topSellers.length > 0 ? (
                      marketMetrics.topSellers.map((seller, index) => (
                        <div key={seller.address} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-mono text-sm">{seller.address.slice(0, 10)}...{seller.address.slice(-8)}</span>
                          </div>
                          <span className="font-semibold text-blue-600">{formatCurrency(seller.volume)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No seller activity in this range</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        </div>
      </main>
    </TooltipProvider>
  )
}
