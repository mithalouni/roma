import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { useVolumeSeries } from '../hooks/useDomaData'

export function VolumeChart() {
  const { data: volumeData, isLoading } = useVolumeSeries()

  if (isLoading || !volumeData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Volume Over Time</CardTitle>
          <CardDescription>Daily transaction volume and count</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume Over Time</CardTitle>
        <CardDescription>Daily transaction volume and count for the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={volumeData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="dateLabel" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="left"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenueUsd"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Revenue (USD)"
              dot={false}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="transactionCount" 
              stroke="hsl(var(--accent-foreground))" 
              strokeWidth={2}
              name="Transactions"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="walletCount"
              stroke="hsl(var(--secondary-foreground))"
              strokeWidth={2}
              name="Active Wallets"
              strokeDasharray="4 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
