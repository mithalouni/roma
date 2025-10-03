import { useQuery } from '@tanstack/react-query'
import { getDashboardData, getMarketActivity, searchDomain, getDomainTransactionHistory, getUserDomains } from '../services/domaService'
import type { AnalyticsTimeRange } from '../types/analytics'

export const useDashboardStats = (timeRange: AnalyticsTimeRange = '30d') => {
  return useQuery({
    queryKey: ['dashboard', timeRange],
    queryFn: () => getDashboardData(timeRange),
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

export const useMarketStats = (timeRange: AnalyticsTimeRange = '30d') => {
  return useQuery({
    queryKey: ['dashboard', timeRange],
    queryFn: () => getDashboardData(timeRange),
    select: (data) => data.stats,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

export const useVolumeSeries = (timeRange: AnalyticsTimeRange = '30d') => {
  return useQuery({
    queryKey: ['dashboard', timeRange],
    queryFn: () => getDashboardData(timeRange),
    select: (data) => data.series,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

export const useMarketActivity = (timeRange: AnalyticsTimeRange = '30d') => {
  return useQuery({
    queryKey: ['marketActivity', timeRange],
    queryFn: () => getMarketActivity(timeRange),
    refetchInterval: 45000,
    staleTime: 20000,
  })
}

export const useTrendingDomains = (timeRange: AnalyticsTimeRange = '30d') => {
  return useQuery({
    queryKey: ['marketActivity', timeRange],
    queryFn: () => getMarketActivity(timeRange),
    select: (data) => data.trendingDomains,
    refetchInterval: 45000,
    staleTime: 20000,
  })
}

export const useKeywordTrends = (timeRange: AnalyticsTimeRange = '30d') => {
  return useQuery({
    queryKey: ['marketActivity', timeRange],
    queryFn: () => getMarketActivity(timeRange),
    select: (data) => data.keywordTrends,
    refetchInterval: 60000,
    staleTime: 20000,
  })
}

export const useRecentTransactions = (timeRange: AnalyticsTimeRange = '30d') => {
  return useQuery({
    queryKey: ['marketActivity', timeRange],
    queryFn: () => getMarketActivity(timeRange),
    select: (data) => data.recentTransactions,
    refetchInterval: 30000,
    staleTime: 15000,
  })
}

export const useTopAccounts = (timeRange: AnalyticsTimeRange = '30d') => {
  return useQuery({
    queryKey: ['marketActivity', timeRange],
    queryFn: () => getMarketActivity(timeRange),
    select: (data) => ({ buyers: data.topBuyers, sellers: data.topSellers }),
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

export const useDomainSearch = (domainName: string, enabled: boolean) => {
  const normalized = domainName.trim().toLowerCase()

  return useQuery({
    queryKey: ['domainSearch', normalized],
    queryFn: () => searchDomain(normalized),
    enabled: enabled && normalized.length > 0,
    retry: false,
    staleTime: 30000,
  })
}

export const useDomainTransactionHistory = (domainName: string, enabled: boolean) => {
  const normalized = domainName.trim().toLowerCase()

  return useQuery({
    queryKey: ['domainTransactionHistory', normalized],
    queryFn: () => getDomainTransactionHistory(normalized),
    enabled: enabled && normalized.length > 0,
    retry: false,
    staleTime: 30000,
  })
}

export const useUserDomains = (walletAddress: string | undefined, enabled = true) => {
  const normalized = walletAddress?.trim().toLowerCase() ?? ''

  return useQuery({
    queryKey: ['userDomains', normalized],
    queryFn: () => getUserDomains(normalized),
    enabled: enabled && normalized.length > 0,
    retry: 1,
    staleTime: 30000,
    refetchInterval: 60000, // Refresh every minute
  })
}
