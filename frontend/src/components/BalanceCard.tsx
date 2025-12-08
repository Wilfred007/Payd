import React from 'react'
import { useAccount, useReadContract } from 'wagmi'
import abi from '../abi/Payroll.json'
import { CONTRACT_ADDRESS } from '../config'
import { formatUnits } from 'viem'

export default function BalanceCard() {
  const { address } = useAccount()
  const { data, refetch, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: 'tokenBalance',
  })

  const bal = data ? formatUnits(data as bigint, 18) : '0'

  return (
    <div className="card">
      <div className="section-title">Contract Balance</div>
      <div className="text-3xl font-bold">{isLoading ? '…' : `${bal} cUSD`}</div>
      <div className="text-gray-400 text-sm mt-2 break-all">Contract: {CONTRACT_ADDRESS}</div>
      <button className="btn btn-outline mt-4" onClick={() => refetch()}>Refresh</button>
    </div>
  )
}
