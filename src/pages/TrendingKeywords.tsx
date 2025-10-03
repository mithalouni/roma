import { useEffect, useState } from 'react'
import { TrendingUp, Sparkles, Target, AlertCircle, ChevronRight, RefreshCw, Flame, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { getTrendingKeywordsAndRecommendations, type TrendingAnalysis } from '../services/trendingService'
import { Link } from 'react-router-dom'

export function TrendingKeywords() {
  const [data, setData] = useState<TrendingAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTrendingData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getTrendingKeywordsAndRecommendations()
      setData(result)
    } catch (err) {
      console.error('Error loading trending data:', err)
      setError('Failed to load trending analysis. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTrendingData()
  }, [])

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Finance: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Politics: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      Culture: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      Science: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      Entertainment: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      Sports: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'hot') return <Flame className="w-4 h-4 text-red-500" />
    if (trend === 'rising') return <ArrowUpRight className="w-4 h-4 text-green-500" />
    return <TrendingUp className="w-4 h-4 text-blue-500" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Trending Domain Opportunities
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              AI-powered analysis of global trends and events to discover high-potential domain investments on Doma Protocol
            </p>
          </div>
          <button
            onClick={loadTrendingData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {isLoading && !data && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Analyzing global trends and generating recommendations...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Display */}
        {data && (
          <>
            {/* Market Insights */}
            <Card className="border-l-4 border-l-purple-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg">{data.marketInsights}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(data.timestamp).toLocaleString()}
                </p>
              </CardContent>
            </Card>

            {/* Trending Keywords */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500" />
                  Trending Keywords Right Now
                </CardTitle>
                <CardDescription>
                  Global trends and events driving domain investment opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.keywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTrendIcon(keyword.trend)}
                          <h3 className="font-semibold text-lg">{keyword.keyword}</h3>
                        </div>
                        <span className={`text-sm font-bold ${getScoreColor(keyword.relevance)}`}>
                          {keyword.relevance}
                        </span>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor(keyword.category)}`}>
                        {keyword.category}
                      </span>
                      <p className="text-sm text-muted-foreground">{keyword.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Domain Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Recommended Domain Investments
                </CardTitle>
                <CardDescription>
                  AI-scored domain names based on trending keywords and market analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="rounded-lg border bg-card p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Link
                            to={`/domain/${rec.domainName}`}
                            className="text-2xl font-bold text-primary hover:underline flex items-center gap-2"
                          >
                            {rec.domainName}
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">Related to:</span>
                            <span className="font-medium">{rec.keyword}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-3xl font-bold ${getScoreColor(rec.score)}`}>
                            {rec.score}
                          </div>
                          <div className="text-xs text-muted-foreground">AI Score</div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-semibold mb-1">💡 Reasoning</h4>
                          <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold mb-1">🎯 Market Fit</h4>
                          <p className="text-sm text-muted-foreground">{rec.marketFit}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3">
                          <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                            💰 Potential Value
                          </h4>
                          <p className="text-sm font-bold text-green-600 dark:text-green-400">
                            {rec.potentialValue}
                          </p>
                        </div>
                        <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3">
                          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
                            ✨ Opportunities
                          </h4>
                          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                            {rec.opportunities.slice(0, 2).map((opp, i) => (
                              <li key={i}>• {opp}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-md bg-orange-50 dark:bg-orange-900/20 p-3">
                          <h4 className="text-sm font-semibold text-orange-700 dark:text-orange-400 mb-2">
                            ⚠️ Risks
                          </h4>
                          <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1">
                            {rec.risks.slice(0, 2).map((risk, i) => (
                              <li key={i}>• {risk}</li>
                            ))}
                          </ul>
                        </div>
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
