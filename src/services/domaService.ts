// Doma API Configuration
const DOMA_API_URL = import.meta.env.VITE_DOMA_API_URL || 'https://api-testnet.doma.xyz'
const SUBGRAPH_URL = import.meta.env.VITE_DOMA_SUBGRAPH_URL || 'https://api-testnet.doma.xyz/graphql'

// GraphQL query helper
const querySubgraph = async (query: string, variables?: Record<string, any>) => {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Subgraph HTTP error:', response.status, errorText)
      throw new Error(`Subgraph query failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Log the full response for debugging
    console.log('Subgraph response:', data)
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
    }
    
    return data.data
  } catch (error) {
    console.error('Subgraph query error:', error)
    throw error
  }
}

// Types for our analytics data
export interface DomainListing {
  id: string
  domainName: string
  price: string
  seller: string
  timestamp: number
  status: 'active' | 'sold' | 'cancelled'
}

export interface DomainOffer {
  id: string
  domainName: string
  price: string
  buyer: string
  timestamp: number
  status: 'pending' | 'accepted' | 'rejected'
}

export interface MarketStats {
  totalVolume: number
  totalTransactions: number
  activeDomains: number
  averagePrice: number
  volumeChange24h: number
}

export interface TrendingDomain {
  domainName: string
  transactionCount: number
  totalVolume: number
  averagePrice: number
  priceChange24h: number
}

export interface KeywordTrend {
  keyword: string
  count: number
  totalVolume: number
  trend: 'up' | 'down' | 'stable'
  changePercent: number
}

// Mock data for development - will be replaced with real API calls
export const getMockMarketStats = (): MarketStats => ({
  totalVolume: 1250000,
  totalTransactions: 3456,
  activeDomains: 12890,
  averagePrice: 361.63,
  volumeChange24h: 12.5,
})

export const getMockTrendingDomains = (): TrendingDomain[] => [
  {
    domainName: 'crypto.eth',
    transactionCount: 45,
    totalVolume: 125000,
    averagePrice: 2777.78,
    priceChange24h: 15.2,
  },
  {
    domainName: 'defi.eth',
    transactionCount: 38,
    totalVolume: 98000,
    averagePrice: 2578.95,
    priceChange24h: -5.3,
  },
  {
    domainName: 'nft.eth',
    transactionCount: 32,
    totalVolume: 87000,
    averagePrice: 2718.75,
    priceChange24h: 8.7,
  },
  {
    domainName: 'web3.eth',
    transactionCount: 28,
    totalVolume: 76000,
    averagePrice: 2714.29,
    priceChange24h: 22.1,
  },
  {
    domainName: 'dao.eth',
    transactionCount: 25,
    totalVolume: 65000,
    averagePrice: 2600.00,
    priceChange24h: -2.8,
  },
]

export const getMockKeywordTrends = (): KeywordTrend[] => [
  {
    keyword: 'crypto',
    count: 234,
    totalVolume: 456000,
    trend: 'up',
    changePercent: 18.5,
  },
  {
    keyword: 'defi',
    count: 189,
    totalVolume: 378000,
    trend: 'up',
    changePercent: 12.3,
  },
  {
    keyword: 'nft',
    count: 156,
    totalVolume: 298000,
    trend: 'down',
    changePercent: -5.2,
  },
  {
    keyword: 'web3',
    count: 145,
    totalVolume: 287000,
    trend: 'up',
    changePercent: 25.7,
  },
  {
    keyword: 'dao',
    count: 123,
    totalVolume: 245000,
    trend: 'stable',
    changePercent: 1.2,
  },
]

export const getMockRecentTransactions = (): DomainListing[] => [
  {
    id: '1',
    domainName: 'crypto.eth',
    price: '2500',
    seller: '0x1234...5678',
    timestamp: Date.now() / 1000 - 3600,
    status: 'sold',
  },
  {
    id: '2',
    domainName: 'defi.eth',
    price: '1800',
    seller: '0x2345...6789',
    timestamp: Date.now() / 1000 - 7200,
    status: 'sold',
  },
  {
    id: '3',
    domainName: 'nft.eth',
    price: '3200',
    seller: '0x3456...7890',
    timestamp: Date.now() / 1000 - 10800,
    status: 'active',
  },
  {
    id: '4',
    domainName: 'web3.eth',
    price: '2100',
    seller: '0x4567...8901',
    timestamp: Date.now() / 1000 - 14400,
    status: 'sold',
  },
  {
    id: '5',
    domainName: 'dao.eth',
    price: '1500',
    seller: '0x5678...9012',
    timestamp: Date.now() / 1000 - 18000,
    status: 'active',
  },
]

// Chart data for volume over time
export const getMockVolumeData = () => {
  const days = 30
  const data = []
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.floor(Math.random() * 50000) + 20000,
      transactions: Math.floor(Math.random() * 150) + 50,
    })
  }
  return data
}

// ============ REAL DATA FUNCTIONS ============

// Fetch real listings from GraphQL
export const getRealListings = async () => {
  try {
    const query = `
      query GetListings {
        listings(sortBy: CREATED_AT, sortOrder: DESC) {
          items {
            id
            name {
              name
            }
            price
            seller
            createdAt
            status
          }
          totalCount
        }
      }
    `
    
    const result = await querySubgraph(query)
    
    if (result?.listings?.items && result.listings.items.length > 0) {
      const listings: DomainListing[] = result.listings.items.slice(0, 5).map((listing: any) => ({
        id: listing.id,
        domainName: listing.name?.name || 'Unknown Domain',
        price: listing.price || '0',
        seller: listing.seller || '0x0',
        timestamp: Math.floor(new Date(listing.createdAt).getTime() / 1000),
        status: listing.status === 'ACTIVE' ? 'active' : 'sold',
      }))
      
      console.log('Real listings fetched:', listings)
      return listings
    }
    
    return getMockRecentTransactions()
  } catch (error) {
    console.error('Error fetching real listings:', error)
    return getMockRecentTransactions()
  }
}

// Fetch market stats from Subgraph
export const getRealMarketStats = async (): Promise<MarketStats> => {
  try {
    const query = `
      query GetMarketStats {
        statistics {
          totalDomains
        }
      }
    `
    
    const result = await querySubgraph(query)
    
    if (result?.statistics) {
      const stats = result.statistics
      const totalDomains = parseInt(stats.totalDomains || '0')
      
      console.log('Real market stats fetched:', { totalDomains })
      
      return {
        totalVolume: 0, // Will calculate from listings
        totalTransactions: 0,
        activeDomains: totalDomains,
        averagePrice: 0,
        volumeChange24h: 0,
      }
    }
    
    return getMockMarketStats()
  } catch (error) {
    console.error('Error fetching market stats:', error)
    return getMockMarketStats()
  }
}

// Fetch trending domains from listings (names query requires API key)
export const getRealTrendingDomains = async (): Promise<TrendingDomain[]> => {
  try {
    const query = `
      query GetTrendingDomains {
        listings(sortBy: CREATED_AT, sortOrder: DESC) {
          items {
            name {
              name
            }
            price
          }
          totalCount
        }
      }
    `
    
    const result = await querySubgraph(query)
    
    if (result?.listings?.items && result.listings.items.length > 0) {
      const domains: TrendingDomain[] = result.listings.items.slice(0, 5).map((listing: any) => ({
        domainName: listing.name?.name || 'Unknown',
        transactionCount: 1,
        totalVolume: parseFloat(listing.price || '0'),
        averagePrice: parseFloat(listing.price || '0'),
        priceChange24h: 0,
      }))
      
      console.log('Real trending domains fetched:', domains)
      return domains.length > 0 ? domains : getMockTrendingDomains()
    }
    
    return getMockTrendingDomains()
  } catch (error) {
    console.error('Error fetching trending domains:', error)
    return getMockTrendingDomains()
  }
}

// Use real data or fallback to mock
export const getMarketStats = getRealMarketStats
export const getTrendingDomains = getRealTrendingDomains  
export const getRecentTransactions = getRealListings
