import React from 'react'
import ReactDOM from 'react-dom/client'
import { getDefaultConfig, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { celoAlfajores } from 'viem/chains'
// import App from './App'
import './index.css'
import App from './App'

const config = getDefaultConfig({
  appName: 'Payroll cUSD',
  projectId: 'WALLETCONNECT_PROJECT_ID_PLACEHOLDER',
  chains: [celoAlfajores],
  transports: {
    [celoAlfajores.id]: http('https://celo-sepolia.g.alchemy.com/v2/GC8MPc6eOMfT1cJmmQawV'),
  },
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ accentColor: '#22c55e' })}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
