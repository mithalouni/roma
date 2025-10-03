import { useParams, Link } from 'react-router-dom'
import { useMemo } from 'react'
import { ArrowLeft, ExternalLink, Clock, User, Shield, Coins, TrendingUp, Package, History, ArrowDownLeft, ArrowUpRight, Tag, Zap, BarChart3, Target, Heart, LoaderCircle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useDomainSearch, useDomainTransactionHistory } from '../hooks/useDomaData'
import { useIsFavorited, useAddFavorite, useRemoveFavorite } from '../hooks/useFavorites'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { formatAddress, formatCurrency, formatDateTime } from '../lib/utils'
import { calculateDomainValueScore } from '../services/domaService'
import { DomainPriceChart } from '../components/DomainPriceChart'
import { DomainValueAnalysis } from '../components/DomainValueAnalysis'
import { GeminiRecommendation } from '../components/GeminiRecommendation'
import { GeminiChatbot } from '../components/GeminiChatbot'
import { TooltipProvider } from '@radix-ui/react-tooltip'

const formatIsoDateTime = (iso?: string | null) => {
  if (!iso) return '—'
  const timestamp = Math.floor(new Date(iso).getTime() / 1000)
  if (Number.isNaN(timestamp)) return '—'
  return formatDateTime(timestamp)
}

const formatNativeAmount = (value: number, symbol: string) => {
  if (!value) return '0'
  return `${value.toLocaleString(undefined, {
    minimumFractionDigits: value < 1 ? 2 : 0,
    maximumFractionDigits: 4,
  })} ${symbol}`
}

export function DomainDetails() {
  const { domainName } = useParams<{ domainName: string }>()
  const normalizedDomain = domainName?.toLowerCase() || ''
  const { address, isConnected } = useAccount()
  const { data, isFetching, isError, error } = useDomainSearch(normalizedDomain, Boolean(normalizedDomain))
  const { data: transactionHistory, isFetching: isFetchingHistory } = useDomainTransactionHistory(normalizedDomain, Boolean(normalizedDomain))

  // Favorites functionality
  const { data: isFavorited } = useIsFavorited(address, normalizedDomain)
  const addFavorite = useAddFavorite()
  const removeFavorite = useRemoveFavorite()

  const handleToggleFavorite = () => {
    if (!address || !normalizedDomain) return

    if (isFavorited) {
      removeFavorite.mutate({ walletAddress: address, domainName: normalizedDomain })
    } else {
      addFavorite.mutate({ walletAddress: address, domainName: normalizedDomain })
    }
  }

  // Calculate value score
  const valueScore = useMemo(() => {
    if (!data || !transactionHistory) return null
    return calculateDomainValueScore(
      data.domainName,
      transactionHistory,
      data.activeOffersCount,
      data.isFractionalized
    )
  }, [data, transactionHistory])

  if (!domainName) {
    return (
      <TooltipProvider delayDuration={200}>
        <main className="min-h-screen bg-gray-50 py-8">
          <div className="container w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto">
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center">
              <p className="text-destructive">No domain specified</p>
              <Link to="/" className="mt-4 inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </TooltipProvider>
    )
  }

  if (isFetching) {
    return (
      <TooltipProvider delayDuration={200}>
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" aria-hidden />
            <p className="text-lg font-medium text-muted-foreground">Loading domain data...</p>
          </div>
        </main>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={200}>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="container w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto space-y-8">
          {/* Back Button */}
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{normalizedDomain}</h1>
              <p className="text-muted-foreground">
                Complete on-chain data for this domain from the Doma Protocol
              </p>
            </div>
            {isConnected && address && (
              <button
                onClick={handleToggleFavorite}
                disabled={addFavorite.isPending || removeFavorite.isPending}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                  isFavorited
                    ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                    : 'bg-background border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`}
                />
                <span className="text-sm font-medium">
                  {isFavorited ? 'Favorited' : 'Add to Favorites'}
                </span>
              </button>
            )}
          </div>

          {isError && (
            <Card>
              <CardContent className="py-6">
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-destructive">
                  {(error as Error)?.message || 'Failed to load domain data. Please try again.'}
                </div>
              </CardContent>
            </Card>
          )}

          {!data && !isError && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Domain Not Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    No on-chain record found for <span className="font-semibold">{normalizedDomain}</span> on Doma testnet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {data && (
          <>
            {/* AI Advisor Chatbot */}
            {valueScore && transactionHistory && (
              <GeminiChatbot
                domainContext={{
                  domainName: data.domainName,
                  aiScore: valueScore.overallScore,
                  transactionCount: transactionHistory.filter(tx => tx.type === 'PURCHASED').length,
                  averagePrice:
                    transactionHistory
                      .filter(tx => tx.type === 'PURCHASED' && tx.priceUsd > 0)
                      .reduce((sum, tx) => sum + tx.priceUsd, 0) /
                    Math.max(transactionHistory.filter(tx => tx.type === 'PURCHASED' && tx.priceUsd > 0).length, 1),
                  priceChange: (() => {
                    const purchases = transactionHistory.filter(tx => tx.type === 'PURCHASED' && tx.priceUsd > 0)
                    if (purchases.length < 2) return 0
                    const latest = purchases[0].priceUsd
                    const oldest = purchases[purchases.length - 1].priceUsd
                    return oldest > 0 ? ((latest - oldest) / oldest) * 100 : 0
                  })(),
                  activeOffers: data.activeOffersCount,
                  isFractionalized: data.isFractionalized,
                  recentActivity: transactionHistory.slice(0, 3).map(tx =>
                    `${tx.type} ${tx.priceUsd > 0 ? `for $${tx.priceUsd.toFixed(2)}` : ''}`
                  ).join(', '),
                  valueAnalysis: `${valueScore.recommendation.replace('_', ' ').toUpperCase()} - ${valueScore.analysis.insights[0] || 'N/A'}`
                }}
              />
            )}

            {/* AI Analysis - Side by Side */}
            {valueScore && transactionHistory && transactionHistory.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* AI Value Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5 text-primary" />
                      AI Value Analysis
                    </CardTitle>
                    <CardDescription>
                      AI-driven scoring based on domain characteristics, market activity, and price trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DomainValueAnalysis valueScore={valueScore} />
                  </CardContent>
                </Card>

                {/* Gemini AI Recommendation */}
                <div>
                  <GeminiRecommendation
                    domainName={data.domainName}
                    aiScore={valueScore.overallScore}
                    transactionCount={transactionHistory.filter(tx => tx.type === 'PURCHASED').length}
                    averagePrice={
                      transactionHistory
                        .filter(tx => tx.type === 'PURCHASED' && tx.priceUsd > 0)
                        .reduce((sum, tx) => sum + tx.priceUsd, 0) /
                      Math.max(transactionHistory.filter(tx => tx.type === 'PURCHASED' && tx.priceUsd > 0).length, 1)
                    }
                    priceChange={(() => {
                      const purchases = transactionHistory.filter(tx => tx.type === 'PURCHASED' && tx.priceUsd > 0)
                      if (purchases.length < 2) return 0
                      const latest = purchases[0].priceUsd
                      const oldest = purchases[purchases.length - 1].priceUsd
                      return oldest > 0 ? ((latest - oldest) / oldest) * 100 : 0
                    })()}
                    activeOffers={data.activeOffersCount}
                    isFractionalized={data.isFractionalized}
                  />
                </div>
              </div>
            )}

            {/* Price History Chart */}
            {transactionHistory && transactionHistory.filter(tx => tx.type === 'PURCHASED' && tx.priceUsd > 0).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Price History
                  </CardTitle>
                  <CardDescription>
                    Historical sale prices for this domain over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DomainPriceChart transactions={transactionHistory} />
                </CardContent>
              </Card>
            )}

            {/* Domain Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Domain Overview
                </CardTitle>
                <CardDescription>Core information about this tokenized domain</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Domain Name</dt>
                    <dd className="text-lg font-semibold">{data.domainName}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Registrar</dt>
                    <dd className="font-medium">{data.registrarName}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Claimed By</dt>
                    <dd className="font-mono text-sm">{formatAddress(data.claimedBy)}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Tokenized At
                    </dt>
                    <dd className="font-medium">{formatIsoDateTime(data.tokenizedAt)}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Expires At
                    </dt>
                    <dd className="font-medium">{formatIsoDateTime(data.expiresAt)}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Active Offers</dt>
                    <dd className="text-lg font-semibold text-primary">{data.activeOffersCount}</dd>
                  </div>
                  <div className="space-y-1">
                    <dt className="text-sm text-muted-foreground">Fractionalized</dt>
                    <dd className="font-medium">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        data.isFractionalized
                          ? 'bg-[#163C6D] text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        {data.isFractionalized ? 'Yes' : 'No'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Highest Offer */}
            {data.highestOffer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                    Highest Offer
                  </CardTitle>
                  <CardDescription>The best offer currently available for this domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Offer Amount</div>
                      <div className="text-3xl font-bold text-green-600">{formatCurrency(data.highestOffer.priceUsd)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatNativeAmount(data.highestOffer.priceNative, data.highestOffer.currencySymbol)}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <User className="mr-1 h-3 w-3" />
                          Offerer
                        </span>
                        <span className="font-mono text-sm">{formatAddress(data.highestOffer.offerer)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Created
                        </span>
                        <span className="text-sm">{formatIsoDateTime(data.highestOffer.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Expires
                        </span>
                        <span className="text-sm">{formatIsoDateTime(data.highestOffer.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tokens & Listings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Coins className="mr-2 h-5 w-5" />
                  Tokens & Listings
                </CardTitle>
                <CardDescription>
                  All tokenized instances of this domain across different chains
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.tokens.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
                    <Coins className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No token records found for this domain.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {data.tokens.map((token, tokenIndex) => (
                      <div key={token.tokenId} className="rounded-lg border bg-card p-5 space-y-4">
                        {/* Token Header */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-muted-foreground">Token #{tokenIndex + 1}</span>
                              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {token.type}
                              </span>
                            </div>
                            <p className="font-mono text-xs text-muted-foreground break-all">
                              {token.tokenId}
                            </p>
                          </div>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Owner:</span>
                              <span className="font-mono">{formatAddress(token.owner)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Chain:</span>
                              <span className="font-medium">{token.chainId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Minted:</span>
                              <span>{formatIsoDateTime(token.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Listings */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-muted-foreground">
                            Active Listings ({token.listings.length})
                          </h4>
                          {token.listings.length === 0 ? (
                            <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-sm text-muted-foreground">
                              No active listings for this token
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {token.listings.map((listing) => (
                                <div key={listing.id} className="rounded-md border bg-background p-4">
                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                      <div className="text-sm text-muted-foreground">Price</div>
                                      <div className="text-2xl font-bold">
                                        {listing.priceUsd > 0
                                          ? formatCurrency(listing.priceUsd)
                                          : formatNativeAmount(listing.priceNative, listing.currencySymbol)}
                                      </div>
                                      {listing.priceUsd > 0 && (
                                        <div className="text-xs text-muted-foreground">
                                          {formatNativeAmount(listing.priceNative, listing.currencySymbol)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Listing ID</span>
                                        <span className="font-mono text-xs">{listing.id.slice(0, 8)}...</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Seller</span>
                                        <span className="font-mono text-xs">{formatAddress(listing.seller)}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Orderbook</span>
                                        <span className="font-medium">{listing.orderbook}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Created</span>
                                        <span>{formatIsoDateTime(listing.createdAt)}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Expires</span>
                                        <span>{formatIsoDateTime(listing.expiresAt)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  Complete transaction history for this domain on the Doma Protocol
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetchingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <span className="ml-3 text-sm text-muted-foreground">Loading transaction history...</span>
                  </div>
                ) : !transactionHistory || transactionHistory.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
                    <History className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">No transaction history found for this domain.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactionHistory.map((tx) => (
                      <div key={tx.id} className="rounded-lg border bg-card p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 rounded-full p-2 ${
                              tx.type === 'PURCHASED' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : tx.type === 'LISTED'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : tx.type === 'MINTED'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {tx.type === 'PURCHASED' && <ArrowDownLeft className="h-4 w-4" />}
                              {tx.type === 'LISTED' && <Tag className="h-4 w-4" />}
                              {tx.type === 'MINTED' && <Zap className="h-4 w-4" />}
                              {tx.type === 'TRANSFERRED' && <ArrowUpRight className="h-4 w-4" />}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{tx.type}</span>
                                {(tx.type === 'PURCHASED' || tx.type === 'LISTED') && tx.priceUsd > 0 && (
                                  <span className="text-sm font-medium text-green-600">
                                    {formatCurrency(tx.priceUsd)}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground space-y-0.5">
                                {tx.buyer && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>Buyer: {formatAddress(tx.buyer)}</span>
                                  </div>
                                )}
                                {tx.seller && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>Seller: {formatAddress(tx.seller)}</span>
                                  </div>
                                )}
                                {tx.from && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>From: {formatAddress(tx.from)}</span>
                                  </div>
                                )}
                                {tx.to && !tx.buyer && (
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>To: {formatAddress(tx.to)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground sm:justify-end">
                              <Clock className="h-3 w-3" />
                              <span>{formatDateTime(tx.timestamp)}</span>
                            </div>
                            {tx.priceNative > 0 && tx.currencySymbol && (
                              <div className="text-xs text-muted-foreground">
                                {formatNativeAmount(tx.priceNative, tx.currencySymbol)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
          )}
        </div>
      </main>
    </TooltipProvider>
  )
}
