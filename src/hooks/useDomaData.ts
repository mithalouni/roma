import { useQuery } from '@tanstack/react-query'
import {
  getMarketStats,
  getTrendingDomains,
  getMockKeywordTrends,
  getRecentTransactions,
  getMockVolumeData,
} from '../services/domaService'

// Hook for market statistics - NOW USING REAL DATA
export const useMarketStats = () => {
  return useQuery({
    queryKey: ['marketStats'],
    queryFn: getMarketStats,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  })
}

// Hook for trending domains - NOW USING REAL DATA
export const useTrendingDomains = () => {
  return useQuery({
    queryKey: ['trendingDomains'],
    queryFn: getTrendingDomains,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  })
}

// Hook for keyword trends - STILL USING MOCK (needs custom logic)
export const useKeywordTrends = () => {
  return useQuery({
    queryKey: ['keywordTrends'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return getMockKeywordTrends()
    },
    refetchInterval: 60000,
  })
}

// Hook for recent transactions - NOW USING REAL DATA
export const useRecentTransactions = () => {
  return useQuery({
    queryKey: ['recentTransactions'],
    queryFn: getRecentTransactions,
    refetchInterval: 15000, // Refetch every 15 seconds
    staleTime: 5000,
  })
}

// Hook for volume chart data
export const useVolumeData = () => {
  return useQuery({
    queryKey: ['volumeData'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return getMockVolumeData()
    },
    staleTime: 300000, // Data is fresh for 5 minutes
  })
}
