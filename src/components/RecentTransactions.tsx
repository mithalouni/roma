import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useRecentTransactions } from '../hooks/useDomaData'
import { formatCurrency, formatAddress, formatDateTime } from '../lib/utils'
import { ExternalLink, CheckCircle2, Clock } from 'lucide-react'
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
        <CardDescription>Latest domain sales and listings on the Doma marketplace</CardDescription>
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
                  tx.status === 'sold' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                )}>
                  {tx.status === 'sold' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{tx.domainName}</p>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      tx.status === 'sold' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    )}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <span>{formatAddress(tx.seller)}</span>
                    <span>•</span>
                    <span>{formatDateTime(tx.timestamp)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(parseFloat(tx.price))}</p>
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
