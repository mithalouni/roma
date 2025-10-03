import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckSquare, Loader2 } from 'lucide-react'
import type { GeminiDomainRecommendation } from '../services/geminiService'

interface GeminiRecommendationProps {
  domainName: string
  aiScore: number
  transactionCount: number
  averagePrice: number
  priceChange: number
  activeOffers: number
  isFractionalized: boolean
  onRecommendationReceived?: (recommendation: GeminiDomainRecommendation) => void
}

export function GeminiRecommendation({
  domainName,
  aiScore,
  transactionCount,
  averagePrice,
  priceChange,
  activeOffers,
  isFractionalized,
  onRecommendationReceived,
}: GeminiRecommendationProps) {
  const [recommendation, setRecommendation] = useState<GeminiDomainRecommendation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendation = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const { getGeminiDomainRecommendation } = await import('../services/geminiService')

        const result = await getGeminiDomainRecommendation(
          domainName,
          aiScore,
          transactionCount,
          averagePrice,
          priceChange,
          activeOffers,
          isFractionalized
        )

        if (result) {
          setRecommendation(result)
          onRecommendationReceived?.(result)
        } else {
          setError('Unable to generate recommendation at this time')
        }
      } catch (err) {
        console.error('Error fetching Gemini recommendation:', err)
        setError('Failed to connect to AI analysis service')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendation()
  }, [domainName, aiScore, transactionCount, averagePrice, priceChange, activeOffers, isFractionalized, onRecommendationReceived])

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <h3 className="font-semibold text-lg">AI-Powered Analysis</h3>
        </div>
        <div className="flex items-center justify-center py-8 flex-1">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Analyzing domain with Google Gemini AI...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <h3 className="font-semibold">AI Analysis Unavailable</h3>
        </div>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  if (!recommendation) {
    return null
  }

  return (
    <div className="rounded-lg border bg-white p-6 space-y-5 h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">AI-Powered Analysis</h3>
      </div>

      {/* Recommendation */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Recommendation</h4>
            <p className="text-base leading-relaxed">{recommendation.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Reasoning */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground">AI Reasoning</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">{recommendation.reasoning}</p>
      </div>

      {/* Market Outlook */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground">Market Outlook</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">{recommendation.marketOutlook}</p>
      </div>

      {/* Two Column Layout for Risks and Opportunities */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Risk Factors */}
        {recommendation.riskFactors && recommendation.riskFactors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <h4 className="font-semibold text-sm">Risk Factors</h4>
            </div>
            <ul className="space-y-1.5">
              {recommendation.riskFactors.map((risk, idx) => (
                <li key={idx} className="text-sm text-muted-foreground pl-4">
                  • {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunities */}
        {recommendation.opportunities && recommendation.opportunities.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-sm">Opportunities</h4>
            </div>
            <ul className="space-y-1.5">
              {recommendation.opportunities.map((opp, idx) => (
                <li key={idx} className="text-sm text-muted-foreground pl-4">
                  • {opp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suggested Actions */}
      {recommendation.suggestedActions && recommendation.suggestedActions.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-green-600" />
            <h4 className="font-semibold text-sm">Suggested Actions</h4>
          </div>
          <ul className="space-y-1.5">
            {recommendation.suggestedActions.map((action, idx) => (
              <li key={idx} className="text-sm text-muted-foreground pl-4">
                • {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
