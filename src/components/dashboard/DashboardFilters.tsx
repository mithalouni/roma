import * as Select from '@radix-ui/react-select'
import * as ToggleGroup from '@radix-ui/react-toggle-group'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Calendar, ChevronDown, Coins, Globe } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ANALYTICS_TIME_RANGES, type AnalyticsTimeRange } from '../../types/analytics'

interface DashboardFiltersProps {
  timeRange: AnalyticsTimeRange
  onTimeRangeChange: (value: AnalyticsTimeRange) => void
  chain: string
  onChainChange: (chain: string) => void
  currency: 'usd' | 'native'
  onCurrencyChange: (currency: 'usd' | 'native') => void
}

const CHAINS = [
  { label: 'All Chains', value: 'all' },
  { label: 'Doma Mainnet', value: 'mainnet' },
  { label: 'Doma Testnet', value: 'testnet' },
]

export function DashboardFilters({
  timeRange,
  onTimeRangeChange,
  chain,
  onChainChange,
  currency,
  onCurrencyChange,
}: DashboardFiltersProps) {
  return (
    <aside className="space-y-6 rounded-2xl border bg-card/80 p-6 shadow-card lg:sticky lg:top-24">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Filters
        </h3>
        <p className="text-sm text-muted-foreground">
          Refine the analytics view by time range, chain, and reporting currency.
        </p>
      </div>

      <div className="space-y-5">
        <FilterField label="Time range" icon={Calendar}>
          <Select.Root value={timeRange} onValueChange={(value: AnalyticsTimeRange) => onTimeRangeChange(value)}>
            <Select.Trigger
              aria-label="Select analytics time range"
              className="flex w-full items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="h-4 w-4" aria-hidden />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-50 overflow-hidden rounded-xl border bg-popover shadow-lg">
                <Select.Viewport className="p-1">
                  {ANALYTICS_TIME_RANGES.map((range) => (
                    <Select.Item
                      key={range}
                      value={range}
                      className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none data-[state=checked]:bg-primary/10 data-[state=checked]:font-semibold"
                    >
                      <Select.ItemText>{range.toUpperCase()}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </FilterField>

        <FilterField label="Chain" icon={Globe}>
          <Select.Root value={chain} onValueChange={onChainChange}>
            <Select.Trigger
              aria-label="Select chain"
              className="flex w-full items-center justify-between rounded-xl border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="h-4 w-4" aria-hidden />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-50 overflow-hidden rounded-xl border bg-popover shadow-lg">
                <Select.Viewport className="p-1">
                  {CHAINS.map((option) => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className="flex cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground outline-none data-[state=checked]:bg-primary/10 data-[state=checked]:font-semibold"
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </FilterField>

        <FilterField label="Currency" icon={Coins}>
          <ToggleGroup.Root
            type="single"
            value={currency}
            onValueChange={(value) => value && onCurrencyChange(value as 'usd' | 'native')}
            className="grid grid-cols-2 gap-2"
            aria-label="Currency toggle"
          >
            <ToggleGroup.Item
              value="usd"
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-semibold transition',
                'data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary'
              )}
            >
              USD
            </ToggleGroup.Item>
            <ToggleGroup.Item
              value="native"
              className={cn(
                'rounded-xl border px-4 py-3 text-sm font-semibold transition',
                'data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary'
              )}
            >
              DOMA
            </ToggleGroup.Item>
          </ToggleGroup.Root>
        </FilterField>
      </div>
    </aside>
  )
}

interface FilterFieldProps {
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  children: ReactNode
}

function FilterField({ label, icon: Icon, children }: FilterFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
        <span>{label}</span>
      </div>
      {children}
    </div>
  )
}
