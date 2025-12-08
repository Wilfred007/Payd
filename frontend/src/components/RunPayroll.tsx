import React, { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import abi from '../abi/Payroll.json'
import { CONTRACT_ADDRESS } from '../config'

export default function RunPayroll() {
  const [limit, setLimit] = useState(200)
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: waiting } = useWaitForTransactionReceipt({ hash: txHash })

  const onRun = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: 'runPayroll',
      args: [BigInt(limit)],
    })
  }

  return (
    <div className="card">
      <div className="section-title">Run Payroll</div>
      <div className="space-y-3">
        <div>
          <div className="label">Max employees to process</div>
          <input className="input" type="number" value={limit} onChange={e => setLimit(Number(e.target.value))} />
        </div>
        <button className="btn btn-primary" onClick={onRun} disabled={isPending || waiting}>
          {isPending || waiting ? 'Running…' : 'Run now'}
        </button>
        {txHash && <div className="text-xs text-gray-400 break-all">Tx: {txHash}</div>}
        {error && <div className="text-xs text-red-400">{error.message}</div>}
      </div>
    </div>
  )
}
