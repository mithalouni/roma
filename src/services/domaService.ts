import type { AnalyticsTimeRange } from '../types/analytics'

// Doma API Configuration
const SUBGRAPH_URL = import.meta.env.VITE_DOMA_SUBGRAPH_URL || 'https://api-testnet.doma.xyz/graphql'
const DOMA_API_KEY = import.meta.env.VITE_DOMA_API_KEY
const EXPLORER_API_URL = 'https://explorer-testnet.doma.xyz/api/v2'

// GraphQL query helper
const querySubgraph = async (query: string, variables?: Record<string, any>) => {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(DOMA_API_KEY ? { 'Api-Key': DOMA_API_KEY } : {}),
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Subgraph HTTP error:', response.status, errorText)
      throw new Error(`Subgraph query failed: ${response.statusText}`)
    }

    const data = await response.json()

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

// ===== Types =====

export interface NetworkStats {
  totalBlocks: number
  totalTransactions: number
  totalAddresses: number
  transactionsToday: number
  averageBlockTime: number
  gasUsedToday: number
  networkUtilization: number
}

export interface MarketStats {
  totalVolume: number
  totalTransactions: number
  activeDomains: number
  averagePrice: number
  revenue24h: number
  revenueChange24h: number
  transactions24h: number
  transactionsChange24h: number
  activeWallets24h: number
  walletChange24h: number
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

export interface DomainTransaction {
  id: string
  domainName: string
  priceUsd: number
  currencySymbol: string
  buyer: string
  seller: string
  timestamp: number
}

export interface TopAccount {
  address: string
  tradeCount: number
  totalVolume: number
}

export interface VolumeTimeSeriesPoint {
  isoDate: string
  dateLabel: string
  revenueUsd: number
  transactionCount: number
  walletCount: number
}

export interface DashboardData {
  stats: MarketStats
  series: VolumeTimeSeriesPoint[]
}

export interface MarketActivityData {
  recentTransactions: DomainTransaction[]
  trendingDomains: TrendingDomain[]
  keywordTrends: KeywordTrend[]
  topBuyers: TopAccount[]
  topSellers: TopAccount[]
}

export interface ListingSummary {
  id: string
  seller: string
  priceUsd: number
  priceNative: number
  currencySymbol: string
  orderbook: string
  createdAt: string
  expiresAt: string
}

export interface TokenSummary {
  tokenId: string
  owner: string
  type: string
  chainId: string
  createdAt: string
  listings: ListingSummary[]
}

export interface HighestOfferSummary {
  priceUsd: number
  priceNative: number
  currencySymbol: string
  offerer: string
  createdAt: string
  expiresAt: string
}

export interface DomainSearchResult {
  domainName: string
  expiresAt: string
  tokenizedAt: string
  claimedBy: string
  registrarName: string
  activeOffersCount: number
  isFractionalized: boolean
  highestOffer: HighestOfferSummary | null
  tokens: TokenSummary[]
}

// ===== Helpers =====

const normalizeAddress = (address?: string | null) => {
  if (!address) return '0x0000...0000'
  const parts = address.split(':')
  const maybeAddress = parts[parts.length - 1]
  return maybeAddress.startsWith('0x') ? maybeAddress : address
}

const toBigInt = (value: string | number) => {
  if (typeof value === 'string') {
    return BigInt(value)
  }
  if (typeof value === 'number') {
    return BigInt(Math.trunc(value))
  }
  return 0n
}

const parseCurrencyAmount = (
  price: string | number | null | undefined,
  currency?: { decimals?: number | null; usdExchangeRate?: number | null }
) => {
  if (price === null || price === undefined) {
    return { native: 0, usd: 0 }
  }

  const decimals = currency?.decimals ?? 18
  const rate = Number(currency?.usdExchangeRate ?? 0)

  try {
    const bigIntValue = toBigInt(price)
    const native = Number(bigIntValue) / Math.pow(10, decimals)
    const usd = rate ? native * rate : native
    return {
      native: Number.isFinite(native) ? native : 0,
      usd: Number.isFinite(usd) ? usd : 0,
    }
  } catch (error) {
    console.warn('Failed to parse currency amount', error)
    return { native: 0, usd: 0 }
  }
}

const parseUsdFromPayment = (payment: any) => {
  if (!payment) return 0
  if (typeof payment.usdValue === 'number') return payment.usdValue

  try {
    const price = payment.price as string | number | undefined
    if (price === undefined) return 0

    const symbol = (payment.currencySymbol as string | undefined)?.toUpperCase()
    const decimals = symbol === 'USDC' || symbol === 'USDT' ? 6 : 18
    const { native, usd } = parseCurrencyAmount(price, {
      decimals,
      usdExchangeRate: payment.usdExchangeRate ?? undefined,
    })
    return usd || native
  } catch (error) {
    console.warn('Failed to parse payment info', error)
    return 0
  }
}

const formatDateLabel = (isoDate: string) => {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const calculatePercentChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }
  return ((current - previous) / previous) * 100
}

type StatisticsTimeRange =
  | 'LAST_1_HOUR'
  | 'LAST_7_HOURS'
  | 'LAST_1_DAY'
  | 'LAST_7_DAYS'
  | 'LAST_14_DAYS'
  | 'LAST_30_DAYS'
  | 'ALL'

const analyticsRangeToStatisticsRange: Record<AnalyticsTimeRange, StatisticsTimeRange> = {
  '1h': 'LAST_7_HOURS',
  '24h': 'LAST_1_DAY',
  '7d': 'LAST_7_DAYS',
  '30d': 'LAST_30_DAYS',
  '1y': 'ALL',
}

const analyticsRangeDurationsMs: Record<AnalyticsTimeRange, number> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000,
}

const analyticsRangeTakeLimit: Record<AnalyticsTimeRange, number> = {
  '1h': 100,
  '24h': 100,
  '7d': 100,
  '30d': 100,
  '1y': 100,
}

const extractKeywords = (domainName: string) => {
  const lower = domainName.toLowerCase()
  const withoutTld = lower.includes('.') ? lower.split('.')[0] : lower
  const rawTokens = withoutTld.split(/[-_\s]+/)
  return rawTokens
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && /^[a-z0-9]+$/.test(token))
}

// Fetch network statistics from explorer API
export const getNetworkStats = async (): Promise<NetworkStats> => {
  try {
    const response = await fetch(`${EXPLORER_API_URL}/stats`)
    if (!response.ok) {
      throw new Error(`Explorer API error: ${response.statusText}`)
    }
    const data = await response.json()

    return {
      totalBlocks: Number(data.total_blocks ?? 0),
      totalTransactions: Number(data.total_transactions ?? 0),
      totalAddresses: Number(data.total_addresses ?? 0),
      transactionsToday: Number(data.transactions_today ?? 0),
      averageBlockTime: Number(data.average_block_time ?? 0) / 1000, // Convert ms to seconds
      gasUsedToday: Number(data.gas_used_today ?? 0),
      networkUtilization: Number(data.network_utilization_percentage ?? 0),
    }
  } catch (error) {
    console.error('Error fetching network stats:', error)
    // Return mock data as fallback
    return {
      totalBlocks: 11513445,
      totalTransactions: 17212378,
      totalAddresses: 855770,
      transactionsToday: 482590,
      averageBlockTime: 2.0,
      gasUsedToday: 47716308270,
      networkUtilization: 3.56,
    }
  }
}

const getMockDashboardData = (): DashboardData => {
  const now = Date.now()
  const series: VolumeTimeSeriesPoint[] = Array.from({ length: 12 }).map((_, idx) => {
    const date = new Date(now - (11 - idx) * 24 * 60 * 60 * 1000)
    const revenue = 200000 + Math.random() * 50000
    const transactions = 500 + Math.random() * 150
    const wallets = 200 + Math.random() * 80

    return {
      isoDate: date.toISOString(),
      dateLabel: formatDateLabel(date.toISOString()),
      revenueUsd: revenue,
      transactionCount: Math.round(transactions),
      walletCount: Math.round(wallets),
    }
  })

  const latest = series[series.length - 1]
  const previous = series[series.length - 2]

  return {
    stats: {
      totalVolume: 1250000,
      totalTransactions: 34560,
      activeDomains: 12890,
      averagePrice: 361.63,
      revenue24h: latest.revenueUsd,
      revenueChange24h: calculatePercentChange(latest.revenueUsd, previous.revenueUsd),
      transactions24h: latest.transactionCount,
      transactionsChange24h: calculatePercentChange(latest.transactionCount, previous.transactionCount),
      activeWallets24h: latest.walletCount,
      walletChange24h: calculatePercentChange(latest.walletCount, previous.walletCount),
    },
    series,
  }
}

const getMockMarketActivity = (): MarketActivityData => {
  const now = Math.floor(Date.now() / 1000)
  const mockTransactions: DomainTransaction[] = Array.from({ length: 5 }).map((_, idx) => ({
    id: `${idx + 1}`,
    domainName: `example${idx + 1}.eth`,
    priceUsd: 1500 + idx * 320,
    currencySymbol: 'ETH',
    buyer: '0x1234...abcd',
    seller: '0xabcd...1234',
    timestamp: now - idx * 3600,
  }))

  return {
    recentTransactions: mockTransactions,
    trendingDomains: [
      {
        domainName: 'crypto.eth',
        transactionCount: 12,
        totalVolume: 86500,
        averagePrice: 7208.33,
        priceChange24h: 18.4,
      },
      {
        domainName: 'defi.eth',
        transactionCount: 9,
        totalVolume: 62340,
        averagePrice: 6926.67,
        priceChange24h: -6.2,
      },
    ],
    keywordTrends: [
      {
        keyword: 'ai',
        count: 42,
        totalVolume: 186000,
        trend: 'up',
        changePercent: 32.4,
      },
      {
        keyword: 'defi',
        count: 28,
        totalVolume: 142500,
        trend: 'stable',
        changePercent: 3.5,
      },
    ],
    topBuyers: [
      { address: '0x1234...abcd', tradeCount: 14, totalVolume: 256000 },
      { address: '0xabcd...1234', tradeCount: 9, totalVolume: 182000 },
    ],
    topSellers: [
      { address: '0x9876...fedc', tradeCount: 11, totalVolume: 221000 },
      { address: '0xfeed...cafe', tradeCount: 8, totalVolume: 144500 },
    ],
  }
}

// ===== Real data functions =====

export const getDashboardData = async (analyticsRange: AnalyticsTimeRange = '30d'): Promise<DashboardData> => {
  try {
    const query = `
      query GetDashboardData($timeRange: StatisticsTimeRange!) {
        statistics {
          totalDomains
          totalValueLockedFractionalized
        }
        chainStatistics {
          totalTransactions
          totalRevenueUsd
          totalActiveWallets
        }
        dailyRevenue(timeRange: $timeRange) {
          date
          revenueUsd
        }
        dailyTransactionCount(timeRange: $timeRange) {
          date
          transactionCount
        }
        dailyActiveWallets(timeRange: $timeRange) {
          date
          walletCount
        }
      }
    `

    const statisticsRange = analyticsRangeToStatisticsRange[analyticsRange] ?? 'LAST_30_DAYS'
    const data = await querySubgraph(query, { timeRange: statisticsRange })

    const statistics = data?.statistics
    const chainStatistics = data?.chainStatistics
    const dailyRevenue = data?.dailyRevenue ?? []
    const dailyTransactions = data?.dailyTransactionCount ?? []
    const dailyWallets = data?.dailyActiveWallets ?? []

    const seriesMap = new Map<string, VolumeTimeSeriesPoint>()

    const ensurePoint = (isoDate: string) => {
      if (!seriesMap.has(isoDate)) {
        seriesMap.set(isoDate, {
          isoDate,
          dateLabel: formatDateLabel(isoDate),
          revenueUsd: 0,
          transactionCount: 0,
          walletCount: 0,
        })
      }
      return seriesMap.get(isoDate)!
    }

    dailyRevenue.forEach((entry: any) => {
      const point = ensurePoint(entry.date)
      point.revenueUsd = Number(entry.revenueUsd ?? 0)
    })

    dailyTransactions.forEach((entry: any) => {
      const point = ensurePoint(entry.date)
      point.transactionCount = Number(entry.transactionCount ?? 0)
    })

    dailyWallets.forEach((entry: any) => {
      const point = ensurePoint(entry.date)
      point.walletCount = Number(entry.walletCount ?? 0)
    })

    const series = Array.from(seriesMap.values()).sort((a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime())

    if (series.length === 0) {
      return getMockDashboardData()
    }

    const latest = series[series.length - 1]
    const previous = series.length > 1 ? series[series.length - 2] : { revenueUsd: 0, transactionCount: 0, walletCount: 0 }

    const totalVolume = Number(chainStatistics?.totalRevenueUsd ?? statistics?.totalValueLockedFractionalized ?? 0)
    const totalTransactions = Number(chainStatistics?.totalTransactions ?? 0)
    const activeDomains = Number(statistics?.totalDomains ?? 0)
    const averagePrice = totalTransactions > 0 ? totalVolume / totalTransactions : 0

    return {
      stats: {
        totalVolume,
        totalTransactions,
        activeDomains,
        averagePrice,
        revenue24h: latest.revenueUsd,
        revenueChange24h: calculatePercentChange(latest.revenueUsd, previous.revenueUsd ?? 0),
        transactions24h: latest.transactionCount,
        transactionsChange24h: calculatePercentChange(latest.transactionCount, previous.transactionCount ?? 0),
        activeWallets24h: latest.walletCount,
        walletChange24h: calculatePercentChange(latest.walletCount, previous.walletCount ?? 0),
      },
      series,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return getMockDashboardData()
  }
}

export const getMarketActivity = async (analyticsRange: AnalyticsTimeRange = '30d'): Promise<MarketActivityData> => {
  try {
    const now = Date.now()
    const rangeDurationMs = analyticsRangeDurationsMs[analyticsRange] ?? analyticsRangeDurationsMs['30d']
    const fetchMultiplier = analyticsRange === '1h' ? 6 : analyticsRange === '24h' ? 3 : 2
    const fetchWindowMs = rangeDurationMs * fetchMultiplier
    const fromDate = new Date(now - fetchWindowMs).toISOString()
    const take = analyticsRangeTakeLimit[analyticsRange] ?? 800

    const query = `
      query GetMarketActivity($fromDate: DateTime!, $take: Int!) {
        tokenActivities(
          fromDate: $fromDate
          take: $take
          sortBy: CREATED_AT
          sortOrder: DESC
          types: [LISTED, PURCHASED]
        ) {
          items {
            __typename
            ... on TokenListedActivity {
              id
              name
              createdAt
              seller
              payment {
                price
                currencySymbol
                usdValue
              }
            }
            ... on TokenPurchasedActivity {
              id
              name
              createdAt
              buyer
              seller
              payment {
                price
                currencySymbol
                usdValue
              }
            }
          }
        }
      }
    `

    const data = await querySubgraph(query, { fromDate, take })
    const activities = data?.tokenActivities?.items ?? []

    if (activities.length === 0) {
      return getMockMarketActivity()
    }

    const purchases = activities
      .filter((item: any) => item.__typename === 'TokenPurchasedActivity')
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    if (purchases.length === 0) {
      return getMockMarketActivity()
    }

    const currentWindowStart = now - rangeDurationMs
    const previousWindowStart = now - rangeDurationMs * 2

    const recentTransactionsRaw = purchases.filter((purchase: any) => new Date(purchase.createdAt).getTime() >= currentWindowStart)
    const transactionSource = recentTransactionsRaw.length > 0 ? recentTransactionsRaw : purchases.slice(0, 50)

    const recentTransactions: DomainTransaction[] = transactionSource.slice(0, 50).map((tx: any) => ({
      id: tx.id,
      domainName: tx.name,
      priceUsd: parseUsdFromPayment(tx.payment),
      currencySymbol: tx.payment?.currencySymbol ?? 'USD',
      buyer: normalizeAddress(tx.buyer),
      seller: normalizeAddress(tx.seller),
      timestamp: Math.floor(new Date(tx.createdAt).getTime() / 1000),
    }))

    const domainStats = new Map<string, {
      currentVolume: number
      currentCount: number
      lastPrice?: number
      previousPrice?: number
    }>()

    const keywordCurrent = new Map<string, { count: number; volume: number }>()
    const keywordPrevious = new Map<string, { count: number; volume: number }>()

    const buyerStats = new Map<string, { volume: number; count: number }>()
    const sellerStats = new Map<string, { volume: number; count: number }>()

    purchases.forEach((purchase: any) => {
      const volumeUsd = parseUsdFromPayment(purchase.payment)
      const timestampMs = new Date(purchase.createdAt).getTime()
      const domainName = purchase.name ?? 'unknown'

      if (timestampMs < previousWindowStart) {
        return
      }

      const buyer = normalizeAddress(purchase.buyer)
      const seller = normalizeAddress(purchase.seller)

      const domainEntry = domainStats.get(domainName) ?? {
        currentVolume: 0,
        currentCount: 0,
        lastPrice: undefined,
        previousPrice: undefined,
      }

      if (timestampMs >= currentWindowStart) {
        const buyerEntry = buyerStats.get(buyer) ?? { volume: 0, count: 0 }
        buyerEntry.volume += volumeUsd
        buyerEntry.count += 1
        buyerStats.set(buyer, buyerEntry)

        const sellerEntry = sellerStats.get(seller) ?? { volume: 0, count: 0 }
        sellerEntry.volume += volumeUsd
        sellerEntry.count += 1
        sellerStats.set(seller, sellerEntry)

        domainEntry.currentVolume += volumeUsd
        domainEntry.currentCount += 1

        if (domainEntry.lastPrice === undefined) {
          domainEntry.lastPrice = volumeUsd
        } else if (domainEntry.previousPrice === undefined) {
          domainEntry.previousPrice = volumeUsd
        }
      }

      domainStats.set(domainName, domainEntry)

      const keywords = extractKeywords(domainName)
      if (timestampMs >= currentWindowStart) {
        keywords.forEach((keyword) => {
          const entry = keywordCurrent.get(keyword) ?? { count: 0, volume: 0 }
          entry.count += 1
          entry.volume += volumeUsd
          keywordCurrent.set(keyword, entry)
        })
      } else if (timestampMs >= previousWindowStart) {
        keywords.forEach((keyword) => {
          const entry = keywordPrevious.get(keyword) ?? { count: 0, volume: 0 }
          entry.count += 1
          entry.volume += volumeUsd
          keywordPrevious.set(keyword, entry)
        })
      }
    })

    const trendingDomains: TrendingDomain[] = Array.from(domainStats.entries())
      .filter(([, stats]) => stats.currentCount > 0)
      .map(([domainName, stats]) => {
        const averagePrice = stats.currentCount > 0 ? stats.currentVolume / stats.currentCount : 0
        const priceChange = stats.previousPrice
          ? calculatePercentChange(stats.lastPrice ?? 0, stats.previousPrice)
          : 0

        return {
          domainName,
          transactionCount: stats.currentCount,
          totalVolume: stats.currentVolume,
          averagePrice,
          priceChange24h: priceChange,
        }
      })
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5)

    const keywordTrends: KeywordTrend[] = Array.from(keywordCurrent.entries())
      .map(([keyword, stats]) => {
        const previous = keywordPrevious.get(keyword)
        const changePercent = calculatePercentChange(stats.count, previous?.count ?? 0)
        const trend: KeywordTrend['trend'] = changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable'

        return {
          keyword,
          count: stats.count,
          totalVolume: stats.volume,
          trend,
          changePercent,
        }
      })
      .sort((a, b) => b.count - a.count || b.totalVolume - a.totalVolume)
      .slice(0, 5)

    const topBuyers: TopAccount[] = Array.from(buyerStats.entries())
      .map(([address, stats]) => ({
        address,
        tradeCount: stats.count,
        totalVolume: stats.volume,
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5)

    const topSellers: TopAccount[] = Array.from(sellerStats.entries())
      .map(([address, stats]) => ({
        address,
        tradeCount: stats.count,
        totalVolume: stats.volume,
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, 5)

    const fallback = getMockMarketActivity()

    return {
      recentTransactions: recentTransactions.length > 0 ? recentTransactions : fallback.recentTransactions,
      trendingDomains: trendingDomains.length > 0 ? trendingDomains : fallback.trendingDomains,
      keywordTrends: keywordTrends.length > 0 ? keywordTrends : fallback.keywordTrends,
      topBuyers: topBuyers.length > 0 ? topBuyers : fallback.topBuyers,
      topSellers: topSellers.length > 0 ? topSellers : fallback.topSellers,
    }
  } catch (error) {
    console.error('Error fetching market activity:', error)
    return getMockMarketActivity()
  }
}

const fetchDomainDetails = async (domain: string): Promise<DomainSearchResult | null> => {
  const trimmed = domain.trim()
  if (!trimmed) return null

  const query = `
    query SearchDomain($name: String!) {
      name(name: $name) {
        name
        expiresAt
        tokenizedAt
        claimedBy
        registrar {
          name
        }
        activeOffersCount
        isFractionalized
        highestOffer {
          price
          offererAddress
          createdAt
          expiresAt
          currency {
            symbol
            decimals
            usdExchangeRate
          }
        }
        tokens {
          tokenId
          ownerAddress
          type
          createdAt
          chain {
            networkId
          }
          listings {
            id
            price
            offererAddress
            orderbook
            createdAt
            expiresAt
            currency {
              symbol
              decimals
              usdExchangeRate
            }
          }
        }
      }
    }
  `

  try {
    const result = await querySubgraph(query, { name: trimmed })
    const nameData = result?.name

    if (!nameData) {
      return null
    }

    const highestOfferData = nameData.highestOffer
    const highestOffer: HighestOfferSummary | null = highestOfferData
      ? (() => {
          const amounts = parseCurrencyAmount(highestOfferData.price, highestOfferData.currency)
          return {
            priceUsd: amounts.usd,
            priceNative: amounts.native,
            currencySymbol: highestOfferData.currency?.symbol ?? 'N/A',
            offerer: normalizeAddress(highestOfferData.offererAddress),
            createdAt: highestOfferData.createdAt,
            expiresAt: highestOfferData.expiresAt,
          }
        })()
      : null

    const tokens: TokenSummary[] = (nameData.tokens ?? []).map((token: any) => {
      const listings: ListingSummary[] = (token.listings ?? []).map((listing: any) => {
        const amounts = parseCurrencyAmount(listing.price, listing.currency)
        return {
          id: listing.id,
          seller: normalizeAddress(listing.offererAddress),
          priceUsd: amounts.usd,
          priceNative: amounts.native,
          currencySymbol: listing.currency?.symbol ?? 'N/A',
          orderbook: listing.orderbook ?? 'UNKNOWN',
          createdAt: listing.createdAt,
          expiresAt: listing.expiresAt,
        }
      })

      return {
        tokenId: token.tokenId,
        owner: normalizeAddress(token.ownerAddress),
        type: token.type,
        chainId: token.chain?.networkId ?? 'unknown',
        createdAt: token.createdAt,
        listings,
      }
    })

    return {
      domainName: nameData.name,
      expiresAt: nameData.expiresAt,
      tokenizedAt: nameData.tokenizedAt,
      claimedBy: normalizeAddress(nameData.claimedBy),
      registrarName: nameData.registrar?.name ?? 'Unknown Registrar',
      activeOffersCount: Number(nameData.activeOffersCount ?? 0),
      isFractionalized: Boolean(nameData.isFractionalized),
      highestOffer,
      tokens,
    }
  } catch (error) {
    const message = (error as Error)?.message ?? ''
    if (message.includes('Name not found') || message.includes('NOT_FOUND')) {
      return null
    }

    console.error('Error searching domain:', error)
    throw new Error('Failed to fetch domain details')
  }
}

export const searchDomain = fetchDomainDetails

export interface DomainTransactionHistory {
  id: string
  type: 'LISTED' | 'PURCHASED' | 'TRANSFERRED' | 'MINTED'
  domainName: string
  timestamp: number
  priceUsd: number
  priceNative: number
  currencySymbol: string
  buyer?: string
  seller?: string
  from?: string
  to?: string
  tokenId?: string
}

export interface DomainValueScore {
  overallScore: number // 0-100
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid'
  factors: {
    lengthScore: number // 0-100
    keywordScore: number // 0-100
    activityScore: number // 0-100
    priceScore: number // 0-100
    trendScore: number // 0-100
  }
  analysis: {
    strengths: string[]
    weaknesses: string[]
    insights: string[]
  }
}

export interface UserDomain {
  domainName: string
  tokenId: string
  owner: string
  chainId: string
  createdAt: string
  expiresAt: string
  activeListings: number
  highestOfferUsd: number
  estimatedValueUsd: number
  isFractionalized: boolean
}

export const calculateDomainValueScore = (
  domainName: string,
  transactionHistory: DomainTransactionHistory[],
  activeOffersCount: number,
  isFractionalized: boolean
): DomainValueScore => {
  const name = domainName.toLowerCase()
  const nameParts = name.split('.')
  const domainOnly = nameParts[0] || name
  const tld = nameParts[1] || ''

  // 1. Length Score (shorter = better, 1-3 chars = 100, 4-6 = 80, 7-10 = 60, etc.)
  const length = domainOnly.length
  let lengthScore = 100
  if (length <= 3) lengthScore = 100
  else if (length <= 6) lengthScore = 80
  else if (length <= 10) lengthScore = 60
  else if (length <= 15) lengthScore = 40
  else lengthScore = 20

  // 2. Keyword Score (check for premium keywords)
  const premiumKeywords = ['ai', 'web3', 'defi', 'nft', 'dao', 'crypto', 'meta', 'eth', 'btc', 'token', 'swap', 'dex']
  const trendingKeywords = ['agent', 'llm', 'yield', 'stake', 'farm', 'mint', 'game', 'social', 'pay']
  const commonWords = ['app', 'net', 'digital', 'tech', 'online', 'hub', 'finance', 'trade']

  let keywordScore = 30 // base
  const lowerDomain = domainOnly.toLowerCase()

  if (premiumKeywords.some(kw => lowerDomain.includes(kw))) keywordScore = 100
  else if (trendingKeywords.some(kw => lowerDomain.includes(kw))) keywordScore = 75
  else if (commonWords.some(kw => lowerDomain.includes(kw))) keywordScore = 50

  // Check for numeric only (lower value)
  if (/^\d+$/.test(domainOnly)) keywordScore = Math.max(keywordScore, 40)

  // 3. Activity Score (based on transaction count and recency)
  const purchases = transactionHistory.filter(tx => tx.type === 'PURCHASED')
  const recentPurchases = purchases.filter(tx => {
    const daysSince = (Date.now() / 1000 - tx.timestamp) / 86400
    return daysSince <= 30
  })

  let activityScore = 0
  if (purchases.length === 0) activityScore = 20
  else if (purchases.length <= 2) activityScore = 40
  else if (purchases.length <= 5) activityScore = 60
  else if (purchases.length <= 10) activityScore = 80
  else activityScore = 100

  // Boost for recent activity
  if (recentPurchases.length > 0) activityScore = Math.min(100, activityScore + 20)

  // Boost for active offers
  if (activeOffersCount > 0) activityScore = Math.min(100, activityScore + 15)

  // 4. Price Score (volatility and trend)
  let priceScore = 50 // neutral if no data
  if (purchases.length >= 2) {
    const prices = purchases.map(tx => tx.priceUsd).filter(p => p > 0)
    if (prices.length >= 2) {
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
      const latestPrice = prices[0]
      const oldestPrice = prices[prices.length - 1]

      // Price appreciation is good
      if (latestPrice > oldestPrice) {
        const appreciationPct = ((latestPrice - oldestPrice) / oldestPrice) * 100
        if (appreciationPct > 50) priceScore = 90
        else if (appreciationPct > 20) priceScore = 75
        else priceScore = 60
      } else {
        // Price depreciation
        const depreciationPct = ((oldestPrice - latestPrice) / oldestPrice) * 100
        if (depreciationPct > 50) priceScore = 20
        else if (depreciationPct > 20) priceScore = 40
        else priceScore = 55
      }

      // Stability bonus - low volatility is good
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
      const coefficientOfVariation = Math.sqrt(variance) / avgPrice
      if (coefficientOfVariation < 0.2) priceScore = Math.min(100, priceScore + 10)
    }
  }

  // 5. Trend Score (based on market activity)
  let trendScore = 50 // neutral
  const last30Days = transactionHistory.filter(tx => {
    const daysSince = (Date.now() / 1000 - tx.timestamp) / 86400
    return daysSince <= 30
  })
  const prev30Days = transactionHistory.filter(tx => {
    const daysSince = (Date.now() / 1000 - tx.timestamp) / 86400
    return daysSince > 30 && daysSince <= 60
  })

  if (last30Days.length > prev30Days.length) {
    const growth = ((last30Days.length - prev30Days.length) / Math.max(prev30Days.length, 1)) * 100
    if (growth > 100) trendScore = 95
    else if (growth > 50) trendScore = 80
    else if (growth > 20) trendScore = 70
    else trendScore = 60
  } else if (last30Days.length < prev30Days.length) {
    trendScore = 30
  }

  // Fractionalization bonus (indicates high value)
  if (isFractionalized) {
    lengthScore = Math.min(100, lengthScore + 10)
    activityScore = Math.min(100, activityScore + 10)
  }

  // Premium TLD bonus
  const premiumTlds = ['eth', 'com', 'io', 'xyz', 'crypto']
  if (premiumTlds.includes(tld)) {
    keywordScore = Math.min(100, keywordScore + 10)
  }

  // Calculate weighted overall score
  const overallScore = Math.round(
    lengthScore * 0.25 +
    keywordScore * 0.25 +
    activityScore * 0.20 +
    priceScore * 0.15 +
    trendScore * 0.15
  )

  // Determine recommendation
  let recommendation: DomainValueScore['recommendation']
  if (overallScore >= 80) recommendation = 'strong_buy'
  else if (overallScore >= 65) recommendation = 'buy'
  else if (overallScore >= 45) recommendation = 'hold'
  else recommendation = 'avoid'

  // Generate insights
  const strengths: string[] = []
  const weaknesses: string[] = []
  const insights: string[] = []

  if (lengthScore >= 80) strengths.push('Short, memorable domain name')
  else if (lengthScore < 40) weaknesses.push('Long domain name may reduce value')

  if (keywordScore >= 75) strengths.push('Contains premium or trending keywords')
  else if (keywordScore < 50) weaknesses.push('Generic keywords, limited market appeal')

  if (activityScore >= 70) strengths.push('High trading activity indicates strong demand')
  else if (activityScore < 40) weaknesses.push('Low trading activity, limited liquidity')

  if (priceScore >= 70) strengths.push('Strong price appreciation trend')
  else if (priceScore < 40) weaknesses.push('Price depreciation or high volatility')

  if (trendScore >= 70) strengths.push('Increasing market momentum')
  else if (trendScore < 40) weaknesses.push('Declining market interest')

  if (isFractionalized) insights.push('Fractionalized ownership suggests institutional interest')
  if (activeOffersCount > 3) insights.push(`${activeOffersCount} active offers indicate competitive bidding`)
  if (purchases.length > 5) insights.push(`${purchases.length} historical transactions show proven market demand`)

  const avgPurchasePrice = purchases.reduce((sum, tx) => sum + tx.priceUsd, 0) / Math.max(purchases.length, 1)
  if (avgPurchasePrice > 1000) insights.push('High average purchase price indicates premium asset')

  return {
    overallScore,
    recommendation,
    factors: {
      lengthScore,
      keywordScore,
      activityScore,
      priceScore,
      trendScore,
    },
    analysis: {
      strengths,
      weaknesses,
      insights,
    },
  }
}

export const getDomainTransactionHistory = async (domainName: string): Promise<DomainTransactionHistory[]> => {
  if (!domainName) return []

  const normalizedDomain = domainName.trim().toLowerCase()

  const query = `
    query GetDomainTransactionHistory($name: String!) {
      tokens(name: $name) {
        items {
          tokenId
          activities {
            __typename
            ... on TokenMintedActivity {
              id
              name
              createdAt
              owner
            }
            ... on TokenTransferredActivity {
              id
              name
              createdAt
              transferredFrom
              transferredTo
            }
            ... on TokenListedActivity {
              id
              name
              createdAt
              seller
              payment {
                price
                currencySymbol
                usdValue
              }
            }
            ... on TokenPurchasedActivity {
              id
              name
              createdAt
              buyer
              seller
              payment {
                price
                currencySymbol
                usdValue
              }
            }
          }
        }
      }
    }
  `

  try {
    const data = await querySubgraph(query, { name: normalizedDomain })
    const tokens = data?.tokens?.items ?? []

    const history: DomainTransactionHistory[] = []

    tokens.forEach((token: any) => {
      const tokenId = token.tokenId as string | undefined
      const activities: any[] = token.activities ?? []

      activities.forEach((activity: any) => {
        const createdAt = activity?.createdAt
        const timestamp = createdAt ? Math.floor(new Date(createdAt).getTime() / 1000) : 0
        if (!timestamp) {
          return
        }

        const symbol = (activity?.payment?.currencySymbol ?? '').toUpperCase()
        const decimals = symbol === 'USDC' || symbol === 'USDT' ? 6 : 18
        const amounts = parseCurrencyAmount(activity?.payment?.price, {
          decimals,
          usdExchangeRate: 1,
        })
        const priceUsd = typeof activity?.payment?.usdValue === 'number' ? activity.payment.usdValue : amounts.usd
        const currencySymbol = symbol || (priceUsd > 0 || amounts.native > 0 ? 'ETH' : '')

        switch (activity.__typename) {
          case 'TokenPurchasedActivity': {
            history.push({
              id: activity.id,
              type: 'PURCHASED',
              domainName: normalizedDomain,
              timestamp,
              priceUsd,
              priceNative: amounts.native,
              currencySymbol,
              buyer: normalizeAddress(activity.buyer),
              seller: normalizeAddress(activity.seller),
              tokenId,
            })
            break
          }
          case 'TokenListedActivity': {
            history.push({
              id: activity.id,
              type: 'LISTED',
              domainName: normalizedDomain,
              timestamp,
              priceUsd,
              priceNative: amounts.native,
              currencySymbol,
              seller: normalizeAddress(activity.seller),
              tokenId,
            })
            break
          }
          case 'TokenTransferredActivity': {
            history.push({
              id: activity.id,
              type: 'TRANSFERRED',
              domainName: normalizedDomain,
              timestamp,
              priceUsd: 0,
              priceNative: 0,
              currencySymbol: '',
              from: normalizeAddress(activity.transferredFrom),
              to: normalizeAddress(activity.transferredTo),
              tokenId,
            })
            break
          }
          case 'TokenMintedActivity': {
            history.push({
              id: activity.id,
              type: 'MINTED',
              domainName: normalizedDomain,
              timestamp,
              priceUsd: 0,
              priceNative: 0,
              currencySymbol: '',
              to: normalizeAddress(activity.owner),
              tokenId,
            })
            break
          }
          default:
            break
        }
      })
    })

    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Error fetching domain transaction history:', error)
    return []
  }
}

export const getUserDomains = async (walletAddress: string): Promise<UserDomain[]> => {
  if (!walletAddress) return []

  // Format address in CAIP-10 format (eip155:<chainId>:<address>)
  const caipAddress = `eip155:97476:${walletAddress.toLowerCase()}`

  const query = `
    query GetUserDomains($owners: [AddressCAIP10!]!) {
      names(ownedBy: $owners, claimStatus: ALL, take: 100) {
        items {
          name
          expiresAt
          tokenizedAt
          isFractionalized
          activeOffersCount
          highestOffer {
            price
            currency {
              symbol
              decimals
              usdExchangeRate
            }
          }
          tokens {
            tokenId
            ownerAddress
            createdAt
            type
            chain {
              networkId
            }
            listings {
              id
            }
          }
        }
      }
    }
  `

  try {
    const data = await querySubgraph(query, { owners: [caipAddress] })
    const nameItems = data?.names?.items ?? []

    const domains: UserDomain[] = nameItems
      .filter((item: any) => item.tokens && item.tokens.length > 0)
      .map((item: any) => {
        // Get the ownership token (type: OWNERSHIP)
        const token = item.tokens.find((t: any) => t.type === 'OWNERSHIP') || item.tokens[0]
        const highestOffer = item.highestOffer
        const highestOfferUsd = highestOffer
          ? parseCurrencyAmount(highestOffer.price, highestOffer.currency).usd
          : 0

        // Simple valuation: use highest offer or estimate based on domain quality
        const estimatedValue = highestOfferUsd > 0 ? highestOfferUsd : 100 // Default minimum value

        return {
          domainName: item.name,
          tokenId: token.tokenId,
          owner: normalizeAddress(token.ownerAddress),
          chainId: token.chain?.networkId ?? 'unknown',
          createdAt: token.createdAt,
          expiresAt: item.expiresAt ?? '',
          activeListings: (token.listings ?? []).length,
          highestOfferUsd,
          estimatedValueUsd: estimatedValue,
          isFractionalized: Boolean(item.isFractionalized),
        }
      })

    return domains
  } catch (error) {
    console.error('Error fetching user domains:', error)
    return []
  }
}
