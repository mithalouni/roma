import { Heart, ExternalLink, Trash2 } from 'lucide-react'
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites'
import { useDomainSearch } from '../hooks/useDomaData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../lib/utils'

interface FavoriteDomainsProps {
  walletAddress: string
}

export function FavoritesDomains({ walletAddress }: FavoriteDomainsProps) {
  const { data: favorites, isLoading } = useFavorites(walletAddress, !!walletAddress)
  const removeFavorite = useRemoveFavorite()

  const handleRemoveFavorite = (domainName: string) => {
    removeFavorite.mutate({ walletAddress, domainName })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="ml-3 text-muted-foreground">Loading favorites...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!favorites || favorites.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Heart className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
            <p className="text-muted-foreground max-w-md">
              You haven't favorited any domains. Browse domains and click the heart icon to save them here.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-current" />
          My Favorite Domains ({favorites.length})
        </CardTitle>
        <CardDescription>Domains you've saved for easy access</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => (
            <FavoriteDomainCard
              key={favorite.id}
              domainName={favorite.domain_name}
              onRemove={() => handleRemoveFavorite(favorite.domain_name)}
              isRemoving={removeFavorite.isPending}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface FavoriteDomainCardProps {
  domainName: string
  onRemove: () => void
  isRemoving: boolean
}

function FavoriteDomainCard({ domainName, onRemove, isRemoving }: FavoriteDomainCardProps) {
  const { data: domainData, isLoading } = useDomainSearch(domainName, true)

  return (
    <div className="rounded-lg border p-4 hover:border-primary/50 transition-colors relative group">
      <button
        onClick={onRemove}
        disabled={isRemoving}
        className="absolute top-2 right-2 p-2 rounded-lg bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
        title="Remove from favorites"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <Link to={`/domain/${domainName}`} className="block">
        <div className="space-y-3">
          <div>
            <h3 className="font-bold text-lg hover:text-primary transition-colors truncate">
              {domainName}
            </h3>
            {domainData && (
              <p className="text-sm text-muted-foreground">
                {domainData.registrarName}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : domainData ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-[#E6EEFF] p-3">
                <div className="text-xs font-semibold text-black mb-1">Active Offers</div>
                <div className="font-bold text-black">
                  {domainData.activeOffersCount}
                </div>
              </div>
              <div className="rounded-md bg-[#E6F7EB] p-3">
                <div className="text-xs font-semibold text-black mb-1">Highest Offer</div>
                <div className="font-bold text-black">
                  {domainData.highestOffer ? formatCurrency(domainData.highestOffer.priceUsd) : '—'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Domain data unavailable
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-primary pt-2 border-t">
            <span>View Details</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </Link>
    </div>
  )
}
