import { useEffect, useState } from 'react'
import { TrendingUp, Target, AlertCircle, ChevronRight, RefreshCw, Flame, ArrowUpRight, LoaderCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { getTrendingKeywordsAndRecommendations, type TrendingAnalysis } from '../services/trendingService'
import { Link } from 'react-router-dom'
import { TooltipProvider } from '@radix-ui/react-tooltip'

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

  const getCategoryColor = () => {
    return 'bg-[#163C6D] text-white'
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'hot') return <Flame className="w-4 h-4 text-red-500" />
    if (trend === 'rising') return <ArrowUpRight className="w-4 h-4 text-green-500" />
    return <TrendingUp className="w-4 h-4 text-blue-500" />
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 dark:text-green-500'
    if (score >= 60) return 'text-blue-700 dark:text-blue-500'
    if (score >= 40) return 'text-yellow-700 dark:text-yellow-500'
    return 'text-gray-700 dark:text-gray-500'
  }

  if (isLoading && !data) {
    return (
      <TooltipProvider delayDuration={200}>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" aria-hidden />
            <p className="text-lg font-medium text-muted-foreground">Analyzing global trends and generating recommendations...</p>
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
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
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
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor()}`}>
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
                            <h4 className="text-sm font-semibold mb-1">Reasoning</h4>
                            <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Market Fit</h4>
                            <p className="text-sm text-muted-foreground">{rec.marketFit}</p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-700 text-black dark:text-black">
                            <h4 className="text-sm font-semibold text-black mb-2">
                              Potential Value
                            </h4>
                            <p className="text-sm font-bold text-black">
                              {rec.potentialValue}
                            </p>
                          </div>
                          <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 border border-blue-200 dark:border-blue-700 text-black dark:text-black">
                            <h4 className="text-sm font-semibold text-black mb-2">
                              Opportunities
                            </h4>
                            <ul className="text-sm text-black space-y-1">
                              {rec.opportunities.slice(0, 2).map((opp, i) => (
                                <li key={i} className="text-black dark:text-black">• {opp}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-md bg-orange-50 dark:bg-orange-900/20 p-3 border border-orange-200 dark:border-orange-700 text-black dark:text-black">
                            <h4 className="text-sm font-semibold text-black mb-2">
                              Risks
                            </h4>
                            <ul className="text-sm text-black space-y-1">
                              {rec.risks.slice(0, 2).map((risk, i) => (
                                <li key={i} className="text-black dark:text-black">• {risk}</li>
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
        </div>
      </main>
    </TooltipProvider>
  )
}
