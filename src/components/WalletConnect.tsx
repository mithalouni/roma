import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Wallet, LogOut, ChevronDown, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/portfolio')}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          <User className="w-4 h-4" />
          Portfolio
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#0540AD] hover:bg-white/90 transition-colors"
          >
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">{formatAddress(address)}</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-white shadow-lg z-50">
              <button
                onClick={() => {
                  disconnect()
                  setShowDropdown(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 transition-colors rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-[#0540AD] hover:bg-white/90 transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-medium">Connect Wallet</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-lg z-50">
          <div className="p-2">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector })
                  setShowDropdown(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 transition-colors rounded-lg"
              >
                <Wallet className="w-4 h-4" />
                <span>{connector.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
