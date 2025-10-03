import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface FavoriteDomain {
  id: string
  wallet_address: string
  domain_name: string
  created_at: string
}

/**
 * Hook to get all favorites for a wallet
 */
export function useFavorites(walletAddress: string | undefined, enabled = true) {
  return useQuery<FavoriteDomain[]>({
    queryKey: ['favorites', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return []

      const { data, error } = await supabase
        .from('domain_favorites')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching favorites:', error)
        return []
      }

      return data || []
    },
    enabled: enabled && !!walletAddress,
    staleTime: 30000,
  })
}

/**
 * Hook to check if a domain is favorited
 */
export function useIsFavorited(walletAddress: string | undefined, domainName: string) {
  return useQuery<boolean>({
    queryKey: ['isFavorited', walletAddress, domainName],
    queryFn: async () => {
      if (!walletAddress || !domainName) return false

      const { data, error } = await supabase
        .from('domain_favorites')
        .select('id')
        .eq('wallet_address', walletAddress.toLowerCase())
        .eq('domain_name', domainName.toLowerCase())
        .maybeSingle()

      if (error) {
        console.error('Error checking favorite status:', error)
        return false
      }

      return !!data
    },
    enabled: !!walletAddress && !!domainName,
    staleTime: 10000,
  })
}

/**
 * Hook to add a favorite
 */
export function useAddFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ walletAddress, domainName }: { walletAddress: string; domainName: string }) => {
      const { error } = await supabase
        .from('domain_favorites')
        .insert({
          wallet_address: walletAddress.toLowerCase(),
          domain_name: domainName.toLowerCase(),
        })

      if (error && !error.message.includes('duplicate')) {
        throw error
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate favorites queries
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.walletAddress] })
      queryClient.invalidateQueries({ queryKey: ['isFavorited', variables.walletAddress, variables.domainName] })
    },
  })
}

/**
 * Hook to remove a favorite
 */
export function useRemoveFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ walletAddress, domainName }: { walletAddress: string; domainName: string }) => {
      const { error } = await supabase
        .from('domain_favorites')
        .delete()
        .eq('wallet_address', walletAddress.toLowerCase())
        .eq('domain_name', domainName.toLowerCase())

      if (error) {
        throw error
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate favorites queries
      queryClient.invalidateQueries({ queryKey: ['favorites', variables.walletAddress] })
      queryClient.invalidateQueries({ queryKey: ['isFavorited', variables.walletAddress, variables.domainName] })
    },
  })
}
