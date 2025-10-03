// Trending Keywords and Domain Recommendations Service

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY

export interface TrendingKeyword {
  keyword: string
  category: string
  trend: 'rising' | 'hot' | 'stable'
  relevance: number // 0-100
  description: string
}

export interface DomainRecommendation {
  domainName: string
  keyword: string
  score: number // 0-100
  reasoning: string
  potentialValue: string
  marketFit: string
  risks: string[]
  opportunities: string[]
}

export interface TrendingAnalysis {
  keywords: TrendingKeyword[]
  recommendations: DomainRecommendation[]
  marketInsights: string
  timestamp: number
}

interface NewsArticle {
  title: string
  description: string
  url: string
  publishedAt: string
  source: {
    name: string
  }
}

// Fetch real trending news from NewsAPI.org
const fetchTrendingNews = async (): Promise<NewsArticle[]> => {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'your_newsapi_key_here') {
    console.warn('NewsAPI key not configured, using fallback data')
    return []
  }

  try {
    // Get top headlines from various categories
    const categories = ['technology', 'business', 'science', 'entertainment', 'sports']
    const allArticles: NewsArticle[] = []

    for (const category of categories) {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=10&apiKey=${NEWS_API_KEY}`
      )

      if (!response.ok) {
        console.error(`NewsAPI error for ${category}:`, response.status)
        continue
      }

      const data = await response.json()
      if (data.articles) {
        allArticles.push(...data.articles.map((article: any) => ({
          ...article,
          category: category.charAt(0).toUpperCase() + category.slice(1)
        })))
      }
    }

    return allArticles.slice(0, 50) // Get top 50 articles
  } catch (error) {
    console.error('Error fetching trending news:', error)
    return []
  }
}

// Extract keywords from news articles using Gemini
const extractKeywordsFromNews = async (articles: NewsArticle[]): Promise<TrendingKeyword[]> => {
  if (articles.length === 0) {
    // Fallback keywords
    return [
      {
        keyword: 'AI',
        category: 'Technology',
        trend: 'hot',
        relevance: 95,
        description: 'Artificial intelligence continues dominating tech discussions'
      },
      {
        keyword: 'Crypto',
        category: 'Finance',
        trend: 'rising',
        relevance: 85,
        description: 'Cryptocurrency markets showing renewed activity'
      },
      {
        keyword: 'Climate',
        category: 'Science',
        trend: 'stable',
        relevance: 80,
        description: 'Climate technology and sustainability trending globally'
      }
    ]
  }

  try {
    const newsContext = articles
      .slice(0, 30)
      .map(article => `${article.title} - ${article.description || ''}`)
      .join('\n')

    const prompt = `Analyze these REAL news headlines from today and extract the top 15 trending keywords/topics:

${newsContext}

Return ONLY valid JSON (no markdown):
{
  "keywords": [
    {
      "keyword": "keyword",
      "category": "Technology|Finance|Politics|Culture|Science|Entertainment|Sports",
      "trend": "rising|hot|stable",
      "relevance": 85,
      "description": "1 sentence why this is trending based on the news"
    }
  ]
}

Extract diverse keywords across all categories. Focus on specific, investable terms (not generic words).`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!response.ok) throw new Error('Gemini API failed')

    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return parsed.keywords
  } catch (error) {
    console.error('Error extracting keywords:', error)
    return []
  }
}

// Generate domain recommendations from keywords using Gemini
const generateDomainRecommendations = async (keywords: TrendingKeyword[]): Promise<DomainRecommendation[]> => {
  if (keywords.length === 0) {
    return [
      {
        domainName: 'aiagent.eth',
        keyword: 'AI',
        score: 92,
        reasoning: 'AI agents are the next frontier. Perfect brandable domain for AI services.',
        potentialValue: '$10,000 - $100,000',
        marketFit: 'AI startups, automation services, agent platforms',
        risks: ['Competitive market', 'Regulatory uncertainty'],
        opportunities: ['High demand sector', 'Multiple use cases']
      }
    ]
  }

  try {
    const keywordsList = keywords.map(k => `${k.keyword} (${k.category}, relevance: ${k.relevance})`).join('\n')

    const prompt = `Based on these REAL trending keywords from today's news, recommend 20 blockchain domain investments:

${keywordsList}

Return ONLY valid JSON (no markdown):
{
  "recommendations": [
    {
      "domainName": "example.eth",
      "keyword": "related keyword",
      "score": 85,
      "reasoning": "Why this domain is valuable (2 sentences)",
      "potentialValue": "$5,000 - $50,000",
      "marketFit": "Target audience and use case",
      "risks": ["risk1", "risk2"],
      "opportunities": ["opportunity1", "opportunity2"]
    }
  ],
  "marketInsights": "2-3 sentence summary of current market opportunities"
}

Guidelines:
- Keep domains short (4-15 chars)
- Make them memorable and brandable
- Mix exact keywords with creative variations
- Consider: [keyword].eth, [keyword]dao.eth, [keyword]ai.eth
- Score based on: keyword strength, timing, demand potential`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    })

    if (!response.ok) throw new Error('Gemini API failed')

    const data = await response.json()
    const text = data.candidates[0].content.parts[0].text
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return parsed.recommendations
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return []
  }
}

const getFallbackData = (): TrendingAnalysis => ({
  keywords: [
    {
      keyword: 'AI',
      category: 'Technology',
      trend: 'hot',
      relevance: 95,
      description: 'Artificial intelligence continues dominating tech and business discussions'
    },
    {
      keyword: 'Quantum',
      category: 'Technology',
      trend: 'rising',
      relevance: 88,
      description: 'Quantum computing breakthroughs gaining mainstream attention'
    },
    {
      keyword: 'DeFi',
      category: 'Finance',
      trend: 'stable',
      relevance: 82,
      description: 'Decentralized finance remains core blockchain use case'
    },
    {
      keyword: 'Climate',
      category: 'Science',
      trend: 'rising',
      relevance: 79,
      description: 'Climate tech and sustainability solutions trending globally'
    },
    {
      keyword: 'Web3',
      category: 'Technology',
      trend: 'hot',
      relevance: 85,
      description: 'Web3 infrastructure and applications gaining adoption'
    }
  ],
  recommendations: [
    {
      domainName: 'aiagent.eth',
      keyword: 'AI',
      score: 92,
      reasoning: 'AI agents are the next frontier in automation. Perfect brandable domain for AI services, agent platforms, and automation tools.',
      potentialValue: '$10,000 - $100,000',
      marketFit: 'AI startups, automation services, agent platforms, SaaS companies',
      risks: ['Highly competitive market', 'Regulatory uncertainty in AI'],
      opportunities: ['Explosive growth in AI sector', 'Multiple high-value use cases']
    },
    {
      domainName: 'quantumdao.eth',
      keyword: 'Quantum',
      score: 85,
      reasoning: 'Combines quantum computing with DAO governance. Unique positioning for research communities and quantum computing DAOs.',
      potentialValue: '$5,000 - $50,000',
      marketFit: 'Quantum research DAOs, tech communities, academic institutions',
      risks: ['Niche market', 'Technology still emerging'],
      opportunities: ['First mover advantage', 'Growing institutional interest']
    },
    {
      domainName: 'defibank.eth',
      keyword: 'DeFi',
      score: 88,
      reasoning: 'Banking meets DeFi. Strong keyword combination for financial services targeting crypto-native users.',
      potentialValue: '$8,000 - $80,000',
      marketFit: 'DeFi protocols, crypto banking, yield platforms',
      risks: ['Regulatory challenges', 'Market volatility'],
      opportunities: ['Traditional finance adoption of DeFi', 'High demand keyword']
    },
    {
      domainName: 'climateai.eth',
      keyword: 'Climate',
      score: 81,
      reasoning: 'AI-powered climate solutions combining two mega trends. Appeals to ESG investors and climate tech startups.',
      potentialValue: '$6,000 - $60,000',
      marketFit: 'Climate tech startups, ESG platforms, carbon credit markets',
      risks: ['Longer sales cycle', 'Requires specialized buyer'],
      opportunities: ['Growing ESG mandates', 'Climate tech funding boom']
    },
    {
      domainName: 'web3dev.eth',
      keyword: 'Web3',
      score: 87,
      reasoning: 'Developer-focused Web3 domain. Perfect for dev tools, communities, and educational platforms in the Web3 space.',
      potentialValue: '$7,000 - $70,000',
      marketFit: 'Developer tools, Web3 education, coding bootcamps, dev communities',
      risks: ['Competitive developer tooling space'],
      opportunities: ['Strong developer demand', 'Multiple monetization paths']
    },
    {
      domainName: 'nftmarket.eth',
      keyword: 'NFT',
      score: 79,
      reasoning: 'Direct, memorable domain for NFT marketplaces. Despite market corrections, NFT infrastructure continues to grow.',
      potentialValue: '$5,000 - $45,000',
      marketFit: 'NFT marketplaces, gaming platforms, digital collectibles',
      risks: ['Market saturation', 'NFT market volatility'],
      opportunities: ['Established keyword', 'Diverse use cases']
    },
    {
      domainName: 'metaverse.ai',
      keyword: 'Metaverse',
      score: 76,
      reasoning: 'AI-powered metaverse experiences. Combines two trending sectors with strong brand recognition.',
      potentialValue: '$5,000 - $40,000',
      marketFit: 'Metaverse platforms, VR/AR companies, gaming studios',
      risks: ['Metaverse hype cycle concerns', 'Technology still maturing'],
      opportunities: ['Major tech company investment', 'Long-term growth potential']
    },
    {
      domainName: 'zkproof.eth',
      keyword: 'ZK',
      score: 84,
      reasoning: 'Zero-knowledge proofs are critical for blockchain scalability and privacy. Technical but valuable domain.',
      potentialValue: '$6,000 - $55,000',
      marketFit: 'ZK rollup protocols, privacy platforms, blockchain infrastructure',
      risks: ['Technical domain limits buyer pool'],
      opportunities: ['ZK tech essential for blockchain scaling', 'Growing developer interest']
    }
  ],
  marketInsights: 'AI and Web3 domains continue to dominate investor interest. Emerging sectors like quantum computing and climate tech showing strong growth potential. Recommended focus: short, brandable domains combining trending keywords with established TLDs.',
  timestamp: Date.now(),
})

export const getTrendingKeywordsAndRecommendations = async (): Promise<TrendingAnalysis> => {
  try {
    // Step 1: Fetch real trending news from NewsAPI.org
    console.log('Fetching trending news from NewsAPI.org...')
    const articles = await fetchTrendingNews()

    // If NewsAPI fails, go straight to fallback
    if (articles.length === 0) {
      console.warn('NewsAPI returned no articles, using fallback data')
      return getFallbackData()
    }

    // Step 2: Extract keywords from news using Gemini
    console.log('Extracting keywords from news articles...')
    const keywords = await extractKeywordsFromNews(articles)

    // If Gemini fails for keywords, use fallback
    if (keywords.length === 0) {
      console.warn('Gemini keyword extraction failed, using fallback data')
      return getFallbackData()
    }

    // Step 3: Generate domain recommendations using Gemini
    console.log('Generating domain recommendations...')
    const recommendations = await generateDomainRecommendations(keywords)

    // If Gemini fails for recommendations, use fallback
    if (recommendations.length === 0) {
      console.warn('Gemini recommendation generation failed, using fallback data')
      return getFallbackData()
    }

    // Step 4: Generate market insights
    const marketInsights = keywords.length > 0
      ? `Current trends show strong interest in ${keywords[0].keyword}, ${keywords[1]?.keyword || 'technology'}, and ${keywords[2]?.keyword || 'innovation'}. Domain investors should focus on these emerging sectors for maximum ROI.`
      : 'Technology domains remain hottest sector. AI and emerging tech keywords showing strongest growth potential.'

    return {
      keywords,
      recommendations,
      marketInsights,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Error getting trending analysis:', error)
    return getFallbackData()
  }
}
