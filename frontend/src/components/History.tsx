import React, { useEffect, useState } from 'react'
import { usePublicClient } from 'wagmi'
import { parseAbiItem, formatUnits } from 'viem'
import { CONTRACT_ADDRESS } from '../config'

const eventItem = parseAbiItem('event PayrollPaid(address indexed wallet, uint256 amount, uint256 timestamp, bytes32 txRef)')

export default function History() {
  const client = usePublicClient()
  const [fromBlock, setFromBlock] = useState<number>(0)
  const [toBlock, setToBlock] = useState<number>(0)
  const [rows, setRows] = useState<Array<{ wallet: string, amount: string, timestamp: number, txHash: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function initBlocks() {
      const latest = Number(await client!.getBlockNumber())
      if (!mounted) return
      setToBlock(latest)
      setFromBlock(Math.max(0, latest - 200_000)) // ~safe default window
    }
    if (client) initBlocks()
    return () => { mounted = false }
  }, [client])

  const load = async () => {
    if (!client) return
    setLoading(true)
    try {
      const logs = await client.getLogs({
        address: CONTRACT_ADDRESS as `0x${string}`,
        events: [eventItem],
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      })
      const parsed = logs.map((l) => ({
        wallet: (l.args as any).wallet as string,
        amount: formatUnits((l.args as any).amount as bigint, 18),
        timestamp: Number((l.args as any).timestamp),
        txHash: l.transactionHash,
      })).reverse()
      setRows(parsed)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (fromBlock && toBlock) { load() } }, [fromBlock, toBlock])

  return (
    <div className="card">
      <div className="section-title">Payroll History</div>
      <div className="grid md:grid-cols-3 gap-3 mb-3">
        <div>
          <div className="label">From block</div>
          <input className="input" type="number" value={fromBlock} onChange={e => setFromBlock(Number(e.target.value))} />
        </div>
        <div>
          <div className="label">To block</div>
          <input className="input" type="number" value={toBlock} onChange={e => setToBlock(Number(e.target.value))} />
        </div>
        <div className="flex items-end">
          <button className="btn btn-outline" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-300">
            <tr>
              <th className="text-left p-2">Wallet</th>
              <th className="text-left p-2">Amount (cUSD)</th>
              <th className="text-left p-2">Timestamp</th>
              <th className="text-left p-2">Tx</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t border-[#1b2741]">
                <td className="p-2 break-all">{r.wallet}</td>
                <td className="p-2">{r.amount}</td>
                <td className="p-2">{new Date(r.timestamp * 1000).toLocaleString()}</td>
                <td className="p-2 break-all">{r.txHash}</td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr><td className="p-2" colSpan={4}>No events in selected range.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
