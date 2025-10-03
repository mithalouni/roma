// Gemini AI Service for Domain Analysis

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
    finishReason?: string
  }>
}

export interface GeminiDomainRecommendation {
  recommendation: string
  reasoning: string
  marketOutlook: string
  riskFactors: string[]
  opportunities: string[]
  suggestedActions: string[]
}

export interface GeminiTrendAnalysis {
  summary: string
  emergingTrends: string[]
  marketSentiment: 'bullish' | 'bearish' | 'neutral'
  insights: string[]
  predictions: string[]
}

const callGeminiAPI = async (prompt: string): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API error:', response.status, errorText)
    throw new Error(`Gemini API failed: ${response.statusText}`)
  }

  const data: GeminiResponse = await response.json()

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No response from Gemini API')
  }

  const candidate = data.candidates[0]

  // Check if response was truncated
  if (candidate.finishReason === 'MAX_TOKENS') {
    console.warn('Gemini response was truncated due to token limit')
  }

  return candidate.content.parts[0].text
}

export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const response = await callGeminiAPI('Say "OK" if you can hear me.')
    console.log('✅ Gemini API test successful:', response)
    return true
  } catch (error) {
    console.error('❌ Gemini API test failed:', error)
    return false
  }
}

export const getGeminiDomainRecommendation = async (
  domainName: string,
  aiScore: number,
  transactionCount: number,
  averagePrice: number,
  priceChange: number,
  activeOffers: number,
  isFractionalized: boolean
): Promise<GeminiDomainRecommendation | null> => {
  try {
    const prompt = `Analyze ${domainName} for blockchain domain investment.

Data: Score=${aiScore}/100, Txns=${transactionCount}, AvgPrice=$${averagePrice.toFixed(0)}, Change=${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(0)}%, Offers=${activeOffers}, Fractionalized=${isFractionalized ? 'Y' : 'N'}

Return ONLY valid JSON (no markdown):
{
  "recommendation": "brief buy/hold/avoid rec",
  "reasoning": "why in 1-2 sentences",
  "marketOutlook": "1 sentence outlook",
  "riskFactors": ["2 risks"],
  "opportunities": ["2 opportunities"],
  "suggestedActions": ["2 actions"]
}

Be concise.`

    const responseText = await callGeminiAPI(prompt)

    // Clean up response - remove markdown code blocks if present
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleanedText)
    return parsed as GeminiDomainRecommendation
  } catch (error) {
    console.error('Error getting Gemini domain recommendation:', error)
    return null
  }
}

export const getGeminiTrendAnalysis = async (
  trendingDomains: Array<{ domainName: string; volume: number; transactions: number }>,
  keywords: Array<{ keyword: string; count: number; trend: string }>,
  marketStats: { totalVolume: number; totalTransactions: number; volumeChange: number }
): Promise<GeminiTrendAnalysis | null> => {
  try {
    const topDomains = trendingDomains.slice(0, 5).map(d => `${d.domainName} ($${d.volume.toFixed(0)} vol, ${d.transactions} txns)`).join(', ')
    const topKeywords = keywords.slice(0, 5).map(k => `${k.keyword} (${k.trend})`).join(', ')

    const prompt = `You are analyzing the domain marketplace on Doma Protocol.

Market Overview:
- Total Volume: $${marketStats.totalVolume.toLocaleString()}
- Total Transactions: ${marketStats.totalTransactions.toLocaleString()}
- Volume Change: ${marketStats.volumeChange >= 0 ? '+' : ''}${marketStats.volumeChange.toFixed(1)}%

Top Trending Domains: ${topDomains}
Top Keywords: ${topKeywords}

Provide a market analysis in the following JSON format (no markdown, just valid JSON):
{
  "summary": "A 2-3 sentence market summary",
  "emergingTrends": ["trend1", "trend2", "trend3"],
  "marketSentiment": "bullish" or "bearish" or "neutral",
  "insights": ["insight1", "insight2", "insight3"],
  "predictions": ["prediction1", "prediction2"]
}

Be concise and focus on actionable insights for domain investors.`

    const responseText = await callGeminiAPI(prompt)

    // Clean up response
    const cleanedText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleanedText)
    return parsed as GeminiTrendAnalysis
  } catch (error) {
    console.error('Error getting Gemini trend analysis:', error)
    return null
  }
}

export interface DomainContext {
  domainName: string
  aiScore: number
  transactionCount: number
  averagePrice: number
  priceChange: number
  activeOffers: number
  isFractionalized: boolean
  recentActivity: string
  valueAnalysis: string
}

export const chatWithGemini = async (
  userMessage: string,
  domainContext: DomainContext,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> => {
  try {
    // Build context prompt
    const contextPrompt = `You are an AI Domain Investment Advisor analyzing "${domainContext.domainName}" on the Doma Protocol blockchain marketplace.

DOMAIN CONTEXT:
- Domain: ${domainContext.domainName}
- AI Score: ${domainContext.aiScore}/100
- Transactions: ${domainContext.transactionCount}
- Average Price: $${domainContext.averagePrice.toFixed(2)}
- Price Change: ${domainContext.priceChange >= 0 ? '+' : ''}${domainContext.priceChange.toFixed(1)}%
- Active Offers: ${domainContext.activeOffers}
- Fractionalized: ${domainContext.isFractionalized ? 'Yes' : 'No'}
- Recent Activity: ${domainContext.recentActivity}
- Value Analysis: ${domainContext.valueAnalysis}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

USER QUESTION: ${userMessage}

Provide a helpful, conversational response. Be concise but informative. Focus on investment insights, market analysis, and actionable advice. Use the domain context to give specific recommendations.`

    const responseText = await callGeminiAPI(contextPrompt)
    return responseText.trim()
  } catch (error) {
    console.error('Error chatting with Gemini:', error)
    throw error
  }
}

export interface PortfolioContext {
  totalDomains: number
  totalValue: number
  averageValue: number
  domains: Array<{
    domainName: string
    estimatedValueUsd: number
    highestOfferUsd: number
    activeListings: number
  }>
  topPerformer: string
  lowestValue: number
  highestValue: number
  tldDistribution: Record<string, number>
  totalOffers: number
}

export const chatWithGeminiStreamForDomain = async (
  userMessage: string,
  domainContext: DomainContext,
  conversationHistory: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void
): Promise<void> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  try {
    // Build context prompt
    const contextPrompt = `You are an AI Domain Investment Advisor analyzing "${domainContext.domainName}" on the Doma Protocol blockchain marketplace.

DOMAIN CONTEXT:
- Domain: ${domainContext.domainName}
- AI Score: ${domainContext.aiScore}/100
- Transactions: ${domainContext.transactionCount}
- Average Price: $${domainContext.averagePrice.toFixed(2)}
- Price Change: ${domainContext.priceChange >= 0 ? '+' : ''}${domainContext.priceChange.toFixed(1)}%
- Active Offers: ${domainContext.activeOffers}
- Fractionalized: ${domainContext.isFractionalized ? 'Yes' : 'No'}
- Recent Activity: ${domainContext.recentActivity}
- Value Analysis: ${domainContext.valueAnalysis}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

USER QUESTION: ${userMessage}

Provide a helpful, conversational response using markdown formatting (bold, italic, lists). Be concise but informative. Focus on investment insights, market analysis, and actionable advice. Use the domain context to give specific recommendations.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: contextPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: 'text/plain',
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API failed: ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('No response body from Gemini API')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const json = JSON.parse(data)
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              onChunk(text)
            }
          } catch (e) {
            // Skip invalid JSON
            continue
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming with Gemini:', error)
    throw error
  }
}

// Backward compatibility alias
export const chatWithGeminiStream = chatWithGeminiStreamForDomain

export const chatWithGeminiStreamForPortfolio = async (
  userMessage: string,
  portfolioContext: PortfolioContext,
  conversationHistory: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void
): Promise<void> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  try {
    // Build TLD distribution summary
    const tldSummary = Object.entries(portfolioContext.tldDistribution)
      .map(([tld, count]) => `${tld}: ${count}`)
      .join(', ')

    // Build domain list summary
    const domainListSummary = portfolioContext.domains
      .map(d => `${d.domainName} ($${d.estimatedValueUsd.toFixed(2)}, ${d.activeListings} listings, best offer: $${d.highestOfferUsd.toFixed(2)})`)
      .join('\n')

    // Calculate diversification metrics
    const uniqueTlds = Object.keys(portfolioContext.tldDistribution).length
    const diversificationScore = (uniqueTlds / portfolioContext.totalDomains * 100).toFixed(1)

    // Build context prompt
    const contextPrompt = `You are an AI Portfolio Advisor for domain investments on the Doma Protocol blockchain marketplace.

PORTFOLIO OVERVIEW:
- Total Domains: ${portfolioContext.totalDomains}
- Total Portfolio Value: $${portfolioContext.totalValue.toFixed(2)}
- Average Domain Value: $${portfolioContext.averageValue.toFixed(2)}
- Value Range: $${portfolioContext.lowestValue.toFixed(2)} - $${portfolioContext.highestValue.toFixed(2)}
- Top Performer: ${portfolioContext.topPerformer}
- Total Offers Received: $${portfolioContext.totalOffers.toFixed(2)}

TLD DISTRIBUTION:
${tldSummary}
- Diversification Score: ${diversificationScore}% (${uniqueTlds} different TLDs)

PORTFOLIO HOLDINGS:
${domainListSummary}

CONVERSATION HISTORY:
${conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

USER QUESTION: ${userMessage}

Provide a helpful, conversational response using markdown formatting (bold, italic, lists). Be concise but informative. Focus on portfolio optimization, diversification strategies, market insights, and actionable investment advice. Analyze the portfolio composition and provide specific recommendations based on the user's holdings.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: contextPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: 'text/plain',
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      throw new Error(`Gemini API failed: ${response.statusText}`)
    }

    if (!response.body) {
      throw new Error('No response body from Gemini API')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue

          try {
            const json = JSON.parse(data)
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text
            if (text) {
              onChunk(text)
            }
          } catch (e) {
            // Skip invalid JSON
            continue
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming portfolio chat with Gemini:', error)
    throw error
  }
}
