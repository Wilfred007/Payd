import React from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[#17233b]">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">Payroll cUSD</div>
          <ConnectButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <Dashboard />
      </main>

      <footer className="border-t border-[#17233b] mt-10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-400">Built for Celo Alfajores • cUSD payroll</div>
      </footer>
    </div>
  )
}
