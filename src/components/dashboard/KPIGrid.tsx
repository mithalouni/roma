import { cn } from '../../lib/utils'

interface KPIGridProps extends React.HTMLAttributes<HTMLDivElement> {}

export function KPIGrid({ className, ...props }: KPIGridProps) {
  return (
    <div
      className={cn(
        'grid gap-6 sm:grid-cols-2 xl:grid-cols-4 [&>*]:min-h-[10rem]',
        className
      )}
      {...props}
    />
  )
}
