import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AnalyticsTimeRange } from '../types/analytics'
import { useVolumeSeries } from '../hooks/useDomaData'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

interface VolumeChartProps {
  timeRange: AnalyticsTimeRange
}

export function VolumeChart({ timeRange }: VolumeChartProps) {
  const { data: volumeData, isLoading } = useVolumeSeries(timeRange)

  if (isLoading || !volumeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Volume</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={volumeData} role="img" aria-label="Market volume over time">
              <CartesianGrid strokeDasharray="4 10" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="dateLabel"
                stroke="hsl(var(--border))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                stroke="hsl(var(--border))"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value: number) => `${value.toLocaleString()}`}
              />
              <Tooltip
                wrapperStyle={{ outline: 'none' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  boxShadow: '0 12px 32px -16px rgba(15, 23, 42, 0.25)',
                }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" height={36} />
              <Line
                type="monotone"
                dataKey="revenueUsd"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                name="Revenue (USD)"
                dot={false}
                aria-label="Revenue over time"
              />
              <Line
                type="monotone"
                dataKey="transactionCount"
                stroke="hsl(var(--accent-foreground))"
                strokeWidth={2}
                name="Transactions"
                dot={false}
                strokeDasharray="6 6"
                aria-label="Transactions over time"
              />
              <Line
                type="monotone"
                dataKey="walletCount"
                stroke="hsl(var(--secondary-foreground))"
                strokeWidth={2}
                name="Active Wallets"
                dot={false}
                strokeDasharray="4 4"
                aria-label="Active wallets over time"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
