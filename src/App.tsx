import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Home } from './pages/Home'
import { DomainDetails } from './pages/DomainDetails'
import { TrendingKeywords } from './pages/TrendingKeywords'
import { MarketAnalytics } from './pages/MarketAnalytics'
import { TopPerformers } from './pages/TopPerformers'
import { PortfolioTracker } from './pages/PortfolioTracker'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<TrendingKeywords />} />
          <Route path="/analytics" element={<MarketAnalytics />} />
          <Route path="/performers" element={<TopPerformers />} />
          <Route path="/portfolio" element={<PortfolioTracker />} />
          <Route path="/domain/:domainName" element={<DomainDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
