import { Search, TrendingUp, LineChart, Trophy } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { WalletConnect } from './WalletConnect'

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = searchValue.trim()
    if (trimmed) {
      navigate(`/domain/${encodeURIComponent(trimmed.toLowerCase())}`)
      setSearchValue('')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#163C6D]">
      <div className="container w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 mx-auto">
        {/* First Row: Logo, Search, Wallet */}
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Doma Analytics" className="h-16 w-auto" />
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search domains..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-white/40"
              />
            </div>
          </form>

          <WalletConnect />
        </div>

        {/* Second Row: Navigation */}
        <div>
          <nav className="flex items-center gap-1 h-12">
            <Link
              to="/trending"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === '/trending'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Trending
            </Link>
            <Link
              to="/analytics"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === '/analytics'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <LineChart className="h-4 w-4" />
              Analytics
            </Link>
            <Link
              to="/performers"
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === '/performers'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Top Performers
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
