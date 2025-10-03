import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { DomainTransactionHistory } from '../services/domaService'
import { formatCurrency } from '../lib/utils'

interface DomainPriceChartProps {
  transactions: DomainTransactionHistory[]
}

export function DomainPriceChart({ transactions }: DomainPriceChartProps) {
  // Filter only purchases with prices
  const purchases = transactions
    .filter(tx => tx.type === 'PURCHASED' && tx.priceUsd > 0)
    .sort((a, b) => a.timestamp - b.timestamp) // chronological order

  if (purchases.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
        No price history available
      </div>
    )
  }

  // Prepare chart data
  const chartData = purchases.map(tx => ({
    timestamp: tx.timestamp,
    date: new Date(tx.timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    price: tx.priceUsd,
    formattedPrice: formatCurrency(tx.priceUsd),
  }))

  // Calculate stats
  const prices = purchases.map(tx => tx.priceUsd)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const latestPrice = prices[prices.length - 1]
  const firstPrice = prices[0]
  const priceChange = firstPrice > 0 ? ((latestPrice - firstPrice) / firstPrice) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Latest Price</p>
          <p className="text-lg font-semibold">{formatCurrency(latestPrice)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Average Price</p>
          <p className="text-lg font-semibold">{formatCurrency(avgPrice)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Price Range</p>
          <p className="text-sm font-medium">
            {formatCurrency(minPrice)} - {formatCurrency(maxPrice)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Total Change</p>
          <p className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [formatCurrency(value), 'Price']}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Sale Price"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Count */}
      <p className="text-center text-xs text-muted-foreground">
        Based on {purchases.length} sale{purchases.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
