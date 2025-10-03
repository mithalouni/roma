import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useKeywordTrends } from '../hooks/useDomaData'
import { formatCurrency } from '../lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '../lib/utils'

export function KeywordTrends() {
  const { data: keywords, isLoading } = useKeywordTrends()

  if (isLoading || !keywords) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keyword Trends</CardTitle>
          <CardDescription>Popular keywords in domain names</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Trends</CardTitle>
        <CardDescription>Top motifs in sales over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {keywords.map((keyword) => (
            <div
              key={keyword.keyword}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  {getTrendIcon(keyword.trend)}
                </div>
                <div>
                  <p className="font-semibold capitalize">{keyword.keyword}</p>
                  <p className="text-sm text-muted-foreground">
                    {keyword.count} domains
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(keyword.totalVolume)}</p>
                <p className={cn('text-sm', getTrendColor(keyword.trend))}>
                  {keyword.changePercent > 0 && '+'}
                  {keyword.changePercent.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
