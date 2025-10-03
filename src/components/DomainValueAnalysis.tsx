import type { DomainValueScore } from '../services/domaService'
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Info, Target } from 'lucide-react'

interface DomainValueAnalysisProps {
  valueScore: DomainValueScore
}

export function DomainValueAnalysis({ valueScore }: DomainValueAnalysisProps) {
  const { overallScore, recommendation, factors, analysis } = valueScore

  const getRecommendationConfig = (rec: DomainValueScore['recommendation']) => {
    switch (rec) {
      case 'strong_buy':
        return {
          label: 'Strong Buy',
          color: 'text-green-700 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          icon: <TrendingUp className="h-5 w-5" />,
          description: 'Excellent investment opportunity with strong fundamentals',
        }
      case 'buy':
        return {
          label: 'Buy',
          color: 'text-blue-700 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          icon: <TrendingUp className="h-5 w-5" />,
          description: 'Good investment potential, consider acquiring',
        }
      case 'hold':
        return {
          label: 'Hold',
          color: 'text-yellow-700 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          icon: <Minus className="h-5 w-5" />,
          description: 'Moderate potential, wait for better entry point',
        }
      case 'avoid':
        return {
          label: 'Avoid',
          color: 'text-red-700 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          icon: <TrendingDown className="h-5 w-5" />,
          description: 'Limited investment potential at current valuation',
        }
    }
  }

  const recConfig = getRecommendationConfig(recommendation)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Overall Score & Recommendation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">AI Value Score</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
        </div>

        <div className={`rounded-lg p-4 ${recConfig.bgColor}`}>
          <div className={`flex items-center gap-2 ${recConfig.color}`}>
            {recConfig.icon}
            <span className="text-xl font-bold">{recConfig.label}</span>
          </div>
          <p className={`mt-1 text-sm ${recConfig.color}`}>{recConfig.description}</p>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Score Breakdown</h4>
        <div className="space-y-3">
          {Object.entries(factors).map(([key, score]) => {
            const labels: Record<string, string> = {
              lengthScore: 'Domain Length',
              keywordScore: 'Keyword Quality',
              activityScore: 'Market Activity',
              priceScore: 'Price Trend',
              trendScore: 'Market Momentum',
            }

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{labels[key]}</span>
                  <span className={`font-semibold ${getScoreColor(score)}`}>{score}/100</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full ${getScoreBgColor(score)} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <h4 className="text-sm font-semibold">Strengths</h4>
          </div>
          <ul className="space-y-1.5 pl-6">
            {analysis.strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                • {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {analysis.weaknesses.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <h4 className="text-sm font-semibold">Weaknesses</h4>
          </div>
          <ul className="space-y-1.5 pl-6">
            {analysis.weaknesses.map((weakness, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                • {weakness}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Insights */}
      {analysis.insights.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <h4 className="text-sm font-semibold">Market Insights</h4>
          </div>
          <ul className="space-y-1.5 pl-6">
            {analysis.insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                • {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-md border border-yellow-500/20 bg-yellow-500/10 p-3">
        <p className="text-xs text-muted-foreground">
          <strong>Disclaimer:</strong> This AI-generated score is for informational purposes only and should not be considered financial advice.
          Always conduct your own research before making investment decisions.
        </p>
      </div>
    </div>
  )
}
