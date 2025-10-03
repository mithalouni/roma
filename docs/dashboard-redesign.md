# Dashboard Redesign Overview

## Component Map

- `PageContainer`
  - Hero grid
    - `HeroSummary` (inline in `Home.tsx`)
    - `DomainSearch`
    - `DashboardFilters`
  - `Section` "KPI Overview"
    - `NetworkOverview`
      - `KPIGrid`
        - `StatCard` ×4 (Transactions, Addresses, Blocks, Avg Block Time)
  - `Section` "Marketplace Overview"
    - `MarketOverview`
      - `StatCard` ×6 (revenue, transactions, wallets, lifetime metrics)
  - `Section` "Market Performance"
    - `VolumeChart`
    - `KeywordTrends`
  - `Section` "Discovery"
    - `TrendingDomains`
      - `Sparkline`
      - `TrendPill`
    - `TopAccounts`
      - `MarketLeadersCard`
        - Radix `Tabs`
  - `Section` "Recent Activity"
    - `RecentTransactions`
      - `TransactionsTable`

## Responsive Wireframes

### Mobile (<640px)

```
| PageContainer |
  - Hero (title, description, search)
  - Filters stack below hero
  - KPIGrid (2-up -> 1 column)
  - Marketplace cards stack
  - Volume chart full width
  - Keyword trends below
  - Trending domains list
  - Market leaders tabs
  - Transactions table scrolls horizontally (overflow)
```

### Tablet (≥640px & <1024px)

```
| PageContainer |
  - Hero + search span full width
  - Filters align beneath hero content
  - KPIGrid 2 columns × 2 rows
  - Marketplace stats 2 columns × 3 rows
  - Charts row uses 6-column grid (3/3 split via width)
  - Discovery row stacks cards with equal width
  - Transactions table fills width with sticky header
```

### Desktop (≥1024px)

```
| PageContainer (max 1440px) |
  - Grid columns: hero area (span 2.25fr) + filters sidebar (1fr, sticky)
  - KPIGrid uses 4 columns across 12-col layout
  - Marketplace Summary uses 3-col grid
  - Charts row: Volume chart spans 7 cols, Keyword trends spans 5 cols
  - Discovery row: Trending domains + Market leaders each span 6 cols
  - Transactions table spans full 12 cols with horizontal padding controlled by container
```

## Interaction & State Notes

- Filters powered by Radix `Select` and `ToggleGroup`; time range is wired into all data hooks, chain and currency state stored for future API integration.
- `StatCard` exposes tooltip definitions, keyboard-triggered click, and `TrendPill` for color-blind-friendly deltas.
- `TransactionsTable` provides accessible table semantics and maintains responsiveness via horizontal scrolling on narrow viewports.
