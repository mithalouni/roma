import { useQuery } from '@tanstack/react-query'
import { getDashboardData, getMarketActivity, searchDomain, getDomainTransactionHistory } from '../services/domaService'

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

export const useMarketStats = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    select: (data) => data.stats,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

export const useVolumeSeries = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    select: (data) => data.series,
    refetchInterval: 60000,
    staleTime: 30000,
  })
}

export const useMarketActivity = () => {
  return useQuery({
    queryKey: ['marketActivity'],
    queryFn: getMarketActivity,
    refetchInterval: 45000,
    staleTime: 20000,
  })
}

export const useTrendingDomains = () => {
  return useQuery({
    queryKey: ['marketActivity'],
    queryFn: getMarketActivity,
    select: (data) => data.trendingDomains,
    refetchInterval: 45000,
    staleTime: 20000,
  })
}

export const useKeywordTrends = () => {
  return useQuery({
    queryKey: ['marketActivity'],
    queryFn: getMarketActivity,
    select: (data) => data.keywordTrends,
    refetchInterval: 60000,
    staleTime: 20000,
  })
}

export const useRecentTransactions = () => {
  return useQuery({
    queryKey: ['marketActivity'],
    queryFn: getMarketActivity,
    select: (data) => data.recentTransactions,
    refetchInterval: 30000,
    staleTime: 15000,
  })
}

export const useTopAccounts = () => {
  return useQuery({
    queryKey: ['marketActivity'],
    queryFn: getMarketActivity,
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
