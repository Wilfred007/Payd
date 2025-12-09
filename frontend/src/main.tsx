import React from 'react'
import ReactDOM from 'react-dom/client'
import { getDefaultConfig, RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider, http, fallback } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { celoAlfajores } from 'viem/chains'
// import App from './App'
import './index.css'
import App from './App'

const projectId = import.meta.env.VITE_WC_PROJECT_ID

const config = getDefaultConfig({
  appName: 'Payroll cUSD',
  projectId,
  chains: [celoAlfajores],
  transports: {
    [celoAlfajores.id]: fallback([
      http('https://alfajores-forno.celo-testnet.org'),
      http('https://rpc.ankr.com/celo_alfajores'),
      http('https://celo-alfajores.blockpi.network/v1/rpc/public'),
    ]),
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
