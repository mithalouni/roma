import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {}

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <div
      className={cn('container w-full max-w-[1440px] px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  )
}
