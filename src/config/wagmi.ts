import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'

// Doma Testnet Chain Configuration
export const domaTestnet = {
  id: 97476,
  name: 'Doma Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Doma',
    symbol: 'DOMA',
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.doma.xyz'] },
    public: { http: ['https://rpc-testnet.doma.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://explorer-testnet.doma.xyz' },
  },
  testnet: true,
} as const

// Get projectId from environment variable
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'f7e9e3a5c9d7b4a6e8f2c1d3a5b7e9c1'

// Create wagmi config
export const config = createConfig({
  chains: [domaTestnet, mainnet, sepolia],
  connectors: [
    walletConnect({
      projectId,
      showQrModal: true,
    }),
    injected(),
  ],
  transports: {
    [domaTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
