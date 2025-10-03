interface SparklineProps {
  change: number
  compact?: boolean
}

export function Sparkline({ change, compact = false }: SparklineProps) {
  const steps = 8
  const slope = Math.max(-1, Math.min(1, change / 50))
  const amplitude = compact ? 4 : 6
  const baseline = compact ? 8 : 12
  const width = compact ? 32 : 48
  const height = compact ? 16 : 24

  const points = Array.from({ length: steps }, (_, index) => {
    const t = index / (steps - 1)
    const x = t * width
    const y = baseline - slope * amplitude * (t * 2 - 1)
    return `${x},${Math.max(2, Math.min(height - 2, y))}`
  }).join(' ')

  const markerY = change >= 0 ? (compact ? 4 : 6) : (compact ? 12 : 18)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="presentation"
      className={compact ? 'h-8 w-12 overflow-visible' : 'h-12 w-16 overflow-visible'}
    >
      <polyline
        points={points}
        fill="none"
        stroke={change >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
        strokeWidth={compact ? 1.5 : 2}
        strokeLinecap="round"
      />
      <circle
        cx={width}
        cy={markerY}
        r={compact ? 2 : 3}
        fill={change >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
      />
    </svg>
  )
}
