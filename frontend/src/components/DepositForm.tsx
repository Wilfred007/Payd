import React, { useState } from 'react'
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits, parseUnits } from 'viem'
import { STABLE_TOKEN_ADDRESS, CONTRACT_ADDRESS } from '../config'
import payrollAbi from '../abi/Payroll.json'
import { ERC20_ABI } from '../lib/erc20'

export default function DepositForm() {
  const { address } = useAccount()
  const [amount, setAmount] = useState('') // in cUSD

  const { data: allowance } = useReadContract({
    address: STABLE_TOKEN_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address || '0x0000000000000000000000000000000000000000', CONTRACT_ADDRESS],
    query: { enabled: !!address },
  })

  const amountWei = amount ? parseUnits(amount as `${number}`, 18) : 0n
  const hasAllowance = allowance ? (allowance as bigint) >= amountWei : false

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: waiting } = useWaitForTransactionReceipt({ hash: txHash })

  const onApprove = async () => {
    if (!amountWei || amountWei <= 0n) return
    writeContract({
      address: STABLE_TOKEN_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACT_ADDRESS, amountWei],
    })
  }

  const onDeposit = async () => {
    if (!amountWei || amountWei <= 0n) return
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: payrollAbi,
      functionName: 'deposit',
      args: [amountWei],
    })
  }

  return (
    <div className="card">
      <div className="section-title">Deposit cUSD</div>
      <div className="space-y-3">
        <div>
          <div className="label">Amount (cUSD)</div>
          <input className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100.0" />
        </div>
        {!hasAllowance ? (
          <button className="btn btn-primary" onClick={onApprove} disabled={isPending || waiting}>
            {isPending || waiting ? 'Approving…' : 'Approve cUSD'}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onDeposit} disabled={isPending || waiting}>
            {isPending || waiting ? 'Depositing…' : 'Deposit'}
          </button>
        )}
        {txHash && (
          <div className="text-xs text-gray-400 break-all">Tx: {txHash}</div>
        )}
      </div>
    </div>
  )
}
