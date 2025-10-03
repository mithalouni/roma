import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useRecentTransactions } from '../hooks/useDomaData'
import { formatCurrency, formatAddress, formatDateTime } from '../lib/utils'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { cn } from '../lib/utils'

export function RecentTransactions() {
  const { data: transactions, isLoading } = useRecentTransactions()

  if (isLoading || !transactions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest domain transactions on Doma</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest confirmed sales on the Doma marketplace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  'bg-green-100 dark:bg-green-900/20'
                )}>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{tx.domainName}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                      Sold
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>Seller {formatAddress(tx.seller)}</span>
                    <span>→</span>
                    <span>Buyer {formatAddress(tx.buyer)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDateTime(tx.timestamp)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(tx.priceUsd)}</p>
                  <p className="text-xs text-muted-foreground">{tx.currencySymbol}</p>
                </div>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
