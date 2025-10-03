import type { AnalyticsTimeRange } from '../types/analytics'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { useKeywordTrends } from '../hooks/useDomaData'
import { formatCurrency } from '../lib/utils'

interface KeywordTrendsProps {
  timeRange: AnalyticsTimeRange
}

export function KeywordTrends({ timeRange }: KeywordTrendsProps) {
  const { data: keywords, isLoading } = useKeywordTrends(timeRange)

  if (isLoading || !keywords) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending Keywords</CardTitle>
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

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader>
        <CardTitle>Trending Keywords</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-x-auto">
          <table className="w-full border-t text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Keyword</th>
                <th scope="col" className="px-6 py-3 font-medium text-right">Volume (7d)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {keywords.map((keyword) => (
                <tr key={keyword.keyword} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-foreground font-medium uppercase">{keyword.keyword}</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground text-right whitespace-nowrap">
                    {formatCurrency(keyword.totalVolume)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
