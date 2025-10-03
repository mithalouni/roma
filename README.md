# Doma Analytics Dashboard

A comprehensive analytics tool for the Doma Protocol domain marketplace, providing deep insights into domain transactions, market trends, and keyword analytics on the blockchain.

## 🚀 Features

- **Market Overview**: Real-time statistics on transaction volume, active domains, and average prices
- **Volume Charts**: Interactive charts showing transaction volume and count over time
- **Trending Domains**: Top domains by transaction volume with price change indicators
- **Keyword Trends**: Popular keywords in domain names with trend analysis
- **Recent Transactions**: Live feed of the latest domain sales and listings
- **Responsive Design**: Modern UI built with TailwindCSS and shadcn/ui components

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS + Custom Design System
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Fetching**: TanStack React Query
- **Blockchain Integration**: Doma Protocol SDK
- **State Management**: React Query for server state

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 🔧 Configuration

Edit `.env` file to configure the application:

```env
VITE_DOMA_API_URL=https://api.doma.xyz
VITE_DOMA_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/doma-protocol/doma
VITE_CHAIN_ID=11155111
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

## 📊 Current Status

**Phase 1: Foundation & Setup** ✅ Complete
- React + TypeScript project with Vite
- TailwindCSS configuration
- Environment setup

**Phase 2: Core Data Integration** ✅ Complete
- React Query setup for data fetching
- Mock data service (ready for real API integration)
- Data fetching hooks with caching

**Phase 3: Analytics Features** ✅ Complete (MVP)
- Market overview dashboard
- Volume charts
- Trending domains
- Keyword trends
- Recent transactions feed

**Next Steps**:
- Connect to real Doma API/Subgraph
- Implement AI-based domain scoring
- Add wallet connection
- Deploy to production

## 🎯 Doma Protocol Integration

This project integrates with the Doma Protocol to provide:
- Domain tokenization analytics
- Marketplace transaction data
- Domain ownership token insights
- Synthetic token tracking
- Cross-chain domain metrics

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Header.tsx      # App header
│   ├── MarketOverview.tsx
│   ├── VolumeChart.tsx
│   ├── TrendingDomains.tsx
│   ├── KeywordTrends.tsx
│   └── RecentTransactions.tsx
├── hooks/              # Custom React hooks
│   └── useDomaData.ts  # Data fetching hooks
├── services/           # API services
│   └── domaService.ts  # Doma protocol integration
├── lib/                # Utilities
│   └── utils.ts        # Helper functions
└── App.tsx             # Main app component
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 License

Built for the Doma Protocol Hackathon
