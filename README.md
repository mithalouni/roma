# 🏰 Doma Analytics

<div align="center">
  <img src="public/doma-logo.svg" alt="Doma Analytics Logo" width="200"/>

  **AI-Driven Domain Analytics & Rarity Scoring for Doma Protocol**

  Real-time blockchain analytics, trending domains, and intelligent scoring to unlock trading opportunities.
</div>

---

## 📊 What It Does

Doma Analytics is a comprehensive analytics dashboard for the Doma Protocol domain marketplace that provides:

- **Live Market Insights** - Track transactions, volume, and active domains in real-time
- **AI Domain Scoring** - Intelligent rarity and value scoring using on-chain data and market trends
- **Trending Analysis** - Discover hot keywords, trending domains, and market patterns
- **Portfolio Tracking** - Monitor your domain investments and track performance
- **Smart Alerts** - Get notified about price changes and market opportunities

Built on Doma Protocol's blockchain infrastructure with real-time data from the Doma Subgraph.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/loyoai/roma.git
cd roma/doma-analytics

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys (see Configuration below)

# Start development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173)

---

## ⚙️ Configuration

Create a `.env` file with the following:

```env
# Doma Protocol (Required - Testnet URLs)
VITE_DOMA_SUBGRAPH_URL=https://api-testnet.doma.xyz/graphql
VITE_DOMA_API_URL=https://api-testnet.doma.xyz
VITE_CHAIN_ID=97476

# Gemini AI (Optional - for AI scoring)
VITE_GEMINI_API_KEY=your_gemini_api_key

# NewsAPI (Optional - for trending news)
VITE_NEWS_API_KEY=your_newsapi_key

# Supabase (Optional - for alerts)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🛠️ Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🏗️ Tech Stack

- **React 19** + TypeScript + Vite
- **TailwindCSS v4** for styling
- **TanStack React Query** for data management
- **Recharts** for visualizations
- **Doma Protocol SDK** + GraphQL Subgraph

---

## 📝 License

MIT

---

Built for the Doma Hackathon 🚀
