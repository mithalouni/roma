import { useMemo, useState } from 'react'
import { Wallet, TrendingUp, DollarSign, BarChart3, AlertCircle, Target, Sparkles, ExternalLink, Lightbulb, LineChart, Heart, Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { useUserDomains, useDomainTransactionHistory, useTrendingDomains, useMarketActivity } from '../hooks/useDomaData'
import { formatCurrency } from '../lib/utils'
import { Link } from 'react-router-dom'
import { calculateDomainValueScore } from '../services/domaService'
import { useAccount } from 'wagmi'
import type { UserDomain } from '../services/domaService'
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts'
import { PortfolioAIAdvisor } from '../components/PortfolioAIAdvisor'
import { FavoritesDomains } from '../components/FavoritesDomains'
import { AlertsTab } from '../components/AlertsTab'

export function PortfolioTracker() {
  const { address, isConnected } = useAccount()
  const { data: domains, isLoading, isError } = useUserDomains(address, isConnected)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'recommendations' | 'favorites' | 'alerts'>('portfolio')

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container py-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Wallet className="w-8 h-8 text-purple-600" />
              Portfolio Tracker
            </h1>
            <p className="text-muted-foreground">
              View your owned domains with AI-powered valuations and analytics
            </p>
          </div>

          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Wallet className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground max-w-md">
                  Connect your wallet to view your domain portfolio and get AI-powered valuations.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <Wallet className="w-8 h-8 text-purple-600" />
            Portfolio Tracker
          </h1>
          <p className="text-muted-foreground">
            View your owned domains with AI-powered valuations and analytics
          </p>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
                <h3 className="text-lg font-semibold mb-2">Loading Your Portfolio</h3>
                <p className="text-muted-foreground">Fetching your domains from the blockchain...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-16 h-16 text-destructive/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error Loading Portfolio</h3>
                <p className="text-muted-foreground max-w-md">
                  Unable to fetch your domains. Please try again later.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && domains && (
          <>
            {/* Tabs */}
            <div className="flex gap-2 border-b">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'portfolio'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  My Portfolio
                </div>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'favorites'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Favorites
                </div>
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'recommendations'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Recommendations
                </div>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'alerts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Alerts
                </div>
              </button>
            </div>

            {activeTab === 'portfolio' ? (
              domains.length > 0 ? (
                <>
                  <PortfolioSummary domains={domains} />
                  <PortfolioValueChart domains={domains} />

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Your Domains ({domains.length})
                      </CardTitle>
                      <CardDescription>Click on any domain to view detailed analytics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {domains.map((domain) => (
                          <PortfolioDomainCard key={domain.tokenId} domain={domain} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Portfolio AI Advisor */}
                  <PortfolioAIAdvisor
                    portfolioContext={{
                      totalDomains: domains.length,
                      totalValue: domains.reduce((sum, d) => sum + d.estimatedValueUsd, 0),
                      averageValue: domains.reduce((sum, d) => sum + d.estimatedValueUsd, 0) / domains.length,
                      domains: domains,
                      topPerformer: domains.reduce((max, d) => d.estimatedValueUsd > max.estimatedValueUsd ? d : max, domains[0]).domainName,
                      lowestValue: Math.min(...domains.map(d => d.estimatedValueUsd)),
                      highestValue: Math.max(...domains.map(d => d.estimatedValueUsd)),
                      tldDistribution: domains.reduce((acc, d) => {
                        const tld = d.domainName.split('.').pop() || 'unknown'
                        acc[tld] = (acc[tld] || 0) + 1
                        return acc
                      }, {} as Record<string, number>),
                      totalOffers: domains.reduce((sum, d) => sum + d.highestOfferUsd, 0),
                    }}
                  />
                </>
              ) : (
                <Card>
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Wallet className="w-16 h-16 text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Domains Found</h3>
                      <p className="text-muted-foreground max-w-md mb-4">
                        You don't own any tokenized domains yet. Visit the Doma marketplace to acquire domains.
                      </p>
                      <a
                        href="https://app.doma.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Visit Doma Marketplace
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : activeTab === 'favorites' ? (
              <FavoritesDomains walletAddress={address || ''} />
            ) : activeTab === 'alerts' ? (
              <AlertsTab walletAddress={address || ''} />
            ) : (
              <DomainRecommendations userDomains={domains} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

function PortfolioSummary({ domains }: { domains: UserDomain[] }) {
  const totalValue = domains.reduce((sum, d) => sum + d.estimatedValueUsd, 0)
  const totalOffers = domains.reduce((sum, d) => sum + d.highestOfferUsd, 0)
  const activeListings = domains.filter(d => d.activeListings > 0).length

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Domains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{domains.length}</div>
          <div className="text-xs text-muted-foreground mt-1">In your wallet</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Portfolio Value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
          <div className="text-xs text-muted-foreground mt-1">Estimated total</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalOffers)}</div>
          <div className="text-xs text-muted-foreground mt-1">Highest offers combined</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active Listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeListings}</div>
          <div className="text-xs text-muted-foreground mt-1">Currently listed</div>
        </CardContent>
      </Card>
    </div>
  )
}

function PortfolioDomainCard({ domain }: { domain: UserDomain }) {
  const { data: transactionHistory } = useDomainTransactionHistory(domain.domainName, true)

  const valueScore = useMemo(() => {
    return calculateDomainValueScore(
      domain.domainName,
      transactionHistory || [],
      domain.activeListings,
      domain.isFractionalized
    )
  }, [domain, transactionHistory])

  const daysSinceAcquired = Math.floor((Date.now() - new Date(domain.createdAt).getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="rounded-lg border p-6 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <Link to={`/domain/${domain.domainName}`} className="flex-1">
          <h3 className="text-xl font-bold hover:text-primary transition-colors flex items-center gap-2">
            {domain.domainName}
            {domain.isFractionalized && <Sparkles className="w-4 h-4 text-yellow-500" />}
          </h3>
          <p className="text-sm text-muted-foreground">
            Owned for {daysSinceAcquired} days • Token ID: {domain.tokenId.slice(0, 8)}...
          </p>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
            <DollarSign className="w-4 h-4" />
            Estimated Value
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(domain.estimatedValueUsd)}
          </div>
          {domain.highestOfferUsd > 0 && (
            <div className="text-sm mt-1 text-blue-600 dark:text-blue-400">
              Best offer: {formatCurrency(domain.highestOfferUsd)}
            </div>
          )}
        </div>

        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
            <Target className="w-4 h-4" />
            AI Score
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {valueScore.overallScore}/100
          </div>
          <div className="text-sm mt-1 text-green-600 dark:text-green-400 capitalize">
            {valueScore.recommendation.replace('_', ' ')}
          </div>
        </div>

        <div className="rounded-md bg-purple-50 dark:bg-purple-900/20 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
            <BarChart3 className="w-4 h-4" />
            Market Activity
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {domain.activeListings}
          </div>
          <div className="text-sm mt-1 text-purple-600 dark:text-purple-400">
            Active listings
          </div>
        </div>
      </div>

      {valueScore.analysis.strengths.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-semibold mb-2">Key Strengths:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {valueScore.analysis.strengths.slice(0, 2).map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function PortfolioValueChart({ domains }: { domains: UserDomain[] }) {
  const chartData = useMemo(() => {
    // Create historical data points based on domain creation dates
    const now = Date.now()

    // Generate daily data points
    const dataPoints: { date: string; value: number; domains: string[] }[] = []

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dateTime = date.getTime()

      // Calculate total value of domains that existed at this date
      let totalValue = 0
      const activeDomains: string[] = []

      domains.forEach((domain) => {
        const createdAt = new Date(domain.createdAt).getTime()
        if (createdAt <= dateTime) {
          totalValue += domain.estimatedValueUsd
          activeDomains.push(domain.domainName)
        }
      })

      dataPoints.push({
        date: dateStr,
        value: totalValue,
        domains: activeDomains,
      })
    }

    return dataPoints
  }, [domains])

  const totalValue = domains.reduce((sum, d) => sum + d.estimatedValueUsd, 0)
  const currentValue = chartData[chartData.length - 1]?.value || 0
  const previousValue = chartData[chartData.length - 8]?.value || 0
  const changePercent = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="w-5 h-5 text-primary" />
          Portfolio Value Over Time
        </CardTitle>
        <CardDescription>Track your portfolio value growth over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalValue)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">7-Day Change</p>
            <p className={`text-2xl font-bold ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Domains</p>
            <p className="text-2xl font-bold">{domains.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function DomainRecommendations({ userDomains }: { userDomains: UserDomain[] }) {
  const { data: trendingDomains } = useTrendingDomains('30d')
  const { data: marketActivity } = useMarketActivity('30d')

  const recommendations = useMemo(() => {
    if (!trendingDomains || !marketActivity) return []

    // Analyze user's portfolio to find patterns
    const userKeywords = new Set<string>()
    const userTlds = new Set<string>()

    userDomains.forEach((domain) => {
      const parts = domain.domainName.split('.')
      const tld = parts[parts.length - 1]
      userTlds.add(tld)

      // Extract keywords from domain name
      const domainPart = parts[0]
      const keywords = domainPart.split(/[-_]/).filter(k => k.length >= 3)
      keywords.forEach(k => userKeywords.add(k.toLowerCase()))
    })

    // Find trending keywords that complement user's portfolio
    const recommendedKeywords = marketActivity.keywordTrends
      .filter(trend => !userKeywords.has(trend.keyword) && trend.trend === 'up')
      .slice(0, 5)

    // Create recommendations
    const recs = recommendedKeywords.map((kw) => {
      const relatedTrending = trendingDomains.find(d =>
        d.domainName.toLowerCase().includes(kw.keyword)
      )

      return {
        keyword: kw.keyword,
        reason: kw.changePercent > 50
          ? 'High growth keyword with strong momentum'
          : 'Rising trend in the market',
        suggestedTld: Array.from(userTlds)[0] || 'ai',
        estimatedValue: relatedTrending?.averagePrice || kw.totalVolume / kw.count,
        confidence: kw.changePercent > 50 ? 'high' : kw.changePercent > 20 ? 'medium' : 'low',
        marketVolume: kw.totalVolume,
      }
    })

    // Add complementary TLD recommendations
    const newTlds = ['eth', 'io', 'xyz', 'com'].filter(tld => !userTlds.has(tld))
    if (newTlds.length > 0 && userKeywords.size > 0) {
      const topKeyword = Array.from(userKeywords)[0]
      recs.push({
        keyword: topKeyword,
        reason: `Expand your portfolio with ${newTlds[0]} TLD`,
        suggestedTld: newTlds[0],
        estimatedValue: userDomains[0]?.estimatedValueUsd * 1.2 || 150,
        confidence: 'medium',
        marketVolume: 0,
      })
    }

    return recs.slice(0, 6)
  }, [userDomains, trendingDomains, marketActivity])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            AI-Powered Domain Recommendations
          </CardTitle>
          <CardDescription>
            Based on your portfolio analysis and market trends, here are domains we recommend
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Loading recommendations based on market data...</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg">
                        {rec.keyword}.{rec.suggestedTld}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        rec.confidence === 'high'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : rec.confidence === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {rec.confidence}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Value</p>
                      <p className="font-semibold">{formatCurrency(rec.estimatedValue)}</p>
                    </div>
                    {rec.marketVolume > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">Market Volume</p>
                        <p className="font-semibold">{formatCurrency(rec.marketVolume)}</p>
                      </div>
                    )}
                  </div>

                  <a
                    href={`https://testnet.d3.app/search?q=${rec.keyword}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    Search on D3
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio Diversification Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Diversify across TLDs</p>
                <p className="text-muted-foreground">
                  Consider acquiring domains with different extensions (.ai, .io, .eth) to reduce risk
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Focus on trending keywords</p>
                <p className="text-muted-foreground">
                  Domains with keywords showing 20%+ growth have higher appreciation potential
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Short domains retain value</p>
                <p className="text-muted-foreground">
                  3-6 character domains typically maintain better long-term value
                </p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
