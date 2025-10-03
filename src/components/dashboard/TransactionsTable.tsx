import { ExternalLink, Layers, LoaderCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { DomainTransaction } from '../../services/domaService'
import { formatAddress, formatCurrency, formatDateTime } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card'

interface TransactionsTableProps {
  transactions?: DomainTransaction[]
  isLoading?: boolean
}

export function TransactionsTable({ transactions, isLoading }: TransactionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const totalPages = Math.ceil((transactions?.length || 0) / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = transactions?.slice(startIndex, endIndex)
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[640px] border-t text-sm" aria-label="Recent domain transactions">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Domain</th>
                <th scope="col" className="px-6 py-3 font-medium">Buyer</th>
                <th scope="col" className="px-6 py-3 font-medium">Seller</th>
                <th scope="col" className="px-6 py-3 font-medium">Value</th>
                <th scope="col" className="px-6 py-3 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center gap-3 text-muted-foreground">
                      <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
                      Loading recent transactions…
                    </div>
                  </td>
                </tr>
              )}
              {!isLoading && (!transactions || transactions.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No transactions in this time range. Adjust filters to widen the search.
                  </td>
                </tr>
              )}
              {!isLoading &&
                paginatedTransactions?.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="group cursor-pointer bg-background transition hover:bg-muted/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Layers className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="space-y-1">
                          <span className="block font-medium text-base text-foreground">
                            {transaction.domainName}
                          </span>
                          <span className="text-xs text-muted-foreground">{transaction.currencySymbol}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-tabular text-muted-foreground">
                      {formatAddress(transaction.buyer)}
                    </td>
                    <td className="px-6 py-4 font-tabular text-muted-foreground">
                      {formatAddress(transaction.seller)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(transaction.priceUsd)}
                        </span>
                        <ExternalLink
                          aria-hidden
                          className="h-4 w-4 text-muted-foreground transition group-hover:text-primary"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-muted-foreground">
                      {formatDateTime(transaction.timestamp)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!isLoading && transactions && transactions.length > itemsPerPage && (
          <div className="flex items-center justify-between border-t px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of {transactions.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'bg-white border hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
