import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useTopAccounts } from '../hooks/useDomaData'
import { formatCurrency, formatAddress } from '../lib/utils'

export function TopAccounts() {
  const { data, isLoading } = useTopAccounts()

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Leaders</CardTitle>
          <CardDescription>Top buyers and sellers by volume</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((column) => (
              <div key={column} className="space-y-3">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Leaders</CardTitle>
        <CardDescription>Highest volume traders in the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Buyers</h3>
            <div className="space-y-3">
              {data.buyers.map((buyer, index) => (
                <div key={buyer.address} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      <span className="font-medium">{formatAddress(buyer.address)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {buyer.tradeCount} {buyer.tradeCount === 1 ? 'trade' : 'trades'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(buyer.totalVolume)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Sellers</h3>
            <div className="space-y-3">
              {data.sellers.map((seller, index) => (
                <div key={seller.address} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      <span className="font-medium">{formatAddress(seller.address)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {seller.tradeCount} {seller.tradeCount === 1 ? 'trade' : 'trades'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(seller.totalVolume)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
