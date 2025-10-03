interface SparklineProps {
  change: number
}

export function Sparkline({ change }: SparklineProps) {
  const steps = 8
  const slope = Math.max(-1, Math.min(1, change / 50))
  const amplitude = 6
  const baseline = 12

  const points = Array.from({ length: steps }, (_, index) => {
    const t = index / (steps - 1)
    const x = t * 48
    const y = baseline - slope * amplitude * (t * 2 - 1)
    return `${x},${Math.max(2, Math.min(22, y))}`
  }).join(' ')

  const markerY = change >= 0 ? 6 : 18

  return (
    <svg viewBox="0 0 48 24" role="presentation" className="h-12 w-16 overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={change >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <circle
        cx={48}
        cy={markerY}
        r={3}
        fill={change >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
      />
    </svg>
  )
}
