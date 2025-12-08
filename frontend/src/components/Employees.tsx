import React, { useEffect, useMemo, useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import abi from '../abi/Payroll.json'
import { CONTRACT_ADDRESS } from '../config'
import { formatUnits, parseUnits } from 'viem'
import dayjs from 'dayjs'

type Interval = 0 | 1 | 2 // Weekly, BiWeekly, Monthly

function intervalLabel(v: Interval) {
  return v === 0 ? 'Weekly' : v === 1 ? 'Bi-Weekly' : 'Monthly'
}

export default function Employees() {
  const { address } = useAccount()
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(50)

  const { data: list, refetch: refetchList } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi,
    functionName: 'getEmployees',
    args: [BigInt(offset), BigInt(limit)],
  })

  const employeeAddresses = (list as string[] | undefined) || []

  const [details, setDetails] = useState<Record<string, any>>({})
  const publicClient = usePublicClient()

  useEffect(() => {
    let cancelled = false
    async function loadDetails() {
      if (!employeeAddresses.length) { setDetails({}); return }
      const calls = employeeAddresses.map((addr) => ({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi,
        functionName: 'getEmployee' as const,
        args: [addr as `0x${string}`],
      }))
      try {
        const res = await publicClient!.multicall({ contracts: calls as any })
        if (cancelled) return
        const map: Record<string, any> = {}
        res.forEach((r: any, i: number) => {
          if (r.status === 'success') {
            const [wallet, salary, interval, nextPayday, active] = r.result as [string, bigint, number, bigint, boolean]
            map[employeeAddresses[i]] = { wallet, salary, interval, nextPayday, active }
          }
        })
        setDetails(map)
      } catch (e) { /* ignore */ }
    }
    loadDetails()
    return () => { cancelled = true }
  }, [employeeAddresses.join(','), publicClient])

  // Add employee form
  const [newEmp, setNewEmp] = useState<{ wallet: string, salary: string, interval: Interval, firstPayday: string }>({ wallet: '', salary: '', interval: 2, firstPayday: '' })
  const { writeContract, data: txHash, isPending, error } = useWriteContract()
  const { isLoading: waiting, isSuccess: success } = useWaitForTransactionReceipt({ hash: txHash })

  useEffect(() => { if (success) { refetchList(); } }, [success])

  const onAdd = () => {
    if (!newEmp.wallet || !newEmp.salary || !newEmp.firstPayday) return
    const salaryWei = parseUnits(newEmp.salary as `${number}`, 18)
    const ts = Math.floor(new Date(newEmp.firstPayday).getTime() / 1000)
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: 'addEmployee',
      args: [newEmp.wallet as `0x${string}`, salaryWei, newEmp.interval, BigInt(ts)],
    })
  }

  // Update helpers
  const [edit, setEdit] = useState<{ wallet: string, salary: string, interval: Interval } | null>(null)
  const [updateWallet, setUpdateWallet] = useState<{ oldWallet: string, newWallet: string } | null>(null)
  const [setNext, setSetNext] = useState<{ wallet: string, next: string } | null>(null)

  const onUpdate = () => {
    if (!edit) return
    const salaryWei = parseUnits(edit.salary as `${number}`, 18)
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: 'updateEmployee',
      args: [edit.wallet as `0x${string}`, salaryWei, edit.interval],
    })
  }

  const onUpdateWallet = () => {
    if (!updateWallet) return
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: 'updateEmployeeWallet',
      args: [updateWallet.oldWallet as `0x${string}`, updateWallet.newWallet as `0x${string}`],
    })
  }

  const onSetNext = () => {
    if (!setNext) return
    const ts = Math.floor(new Date(setNext.next).getTime() / 1000)
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: 'setNextPayday',
      args: [setNext.wallet as `0x${string}`, BigInt(ts)],
    })
  }

  const onRemove = (wallet: string) => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi,
      functionName: 'removeEmployee',
      args: [wallet as `0x${string}`],
    })
  }

  return (
    <div className="card">
      <div className="section-title">Employees</div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="label">Wallet</div>
          <input className="input" value={newEmp.wallet} onChange={e => setNewEmp({ ...newEmp, wallet: e.target.value })} placeholder="0x..." />
        </div>
        <div>
          <div className="label">Salary (cUSD)</div>
          <input className="input" value={newEmp.salary} onChange={e => setNewEmp({ ...newEmp, salary: e.target.value })} placeholder="1000" />
        </div>
        <div>
          <div className="label">Interval</div>
          <select className="input" value={newEmp.interval} onChange={e => setNewEmp({ ...newEmp, interval: Number(e.target.value) as Interval })}>
            <option value={0}>Weekly</option>
            <option value={1}>Bi-Weekly</option>
            <option value={2}>Monthly</option>
          </select>
        </div>
        <div>
          <div className="label">First payday (UTC)</div>
          <input className="input" type="datetime-local" onChange={e => setNewEmp({ ...newEmp, firstPayday: e.target.value })} />
        </div>
      </div>
      <div className="mt-3">
        <button className="btn btn-primary" onClick={onAdd} disabled={isPending || waiting}>{isPending || waiting ? 'Submitting…' : 'Add Employee'}</button>
        {error && <span className="ml-3 text-sm text-red-400">{error.message}</span>}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-300">
            <tr>
              <th className="text-left p-2">Wallet</th>
              <th className="text-left p-2">Salary</th>
              <th className="text-left p-2">Interval</th>
              <th className="text-left p-2">Next Payday</th>
              <th className="text-left p-2">Active</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employeeAddresses.map((w) => {
              const d = details[w]
              if (!d) return (
                <tr key={w}><td className="p-2" colSpan={6}>Loading…</td></tr>
              )
              return (
                <tr key={w} className="border-t border-[#1b2741]">
                  <td className="p-2 break-all">{d.wallet}</td>
                  <td className="p-2">{formatUnits(d.salary as bigint, 18)} cUSD</td>
                  <td className="p-2">{intervalLabel(d.interval as Interval)}</td>
                  <td className="p-2">{dayjs.unix(Number(d.nextPayday)).format('YYYY-MM-DD HH:mm')}</td>
                  <td className="p-2">{d.active ? 'Yes' : 'No'}</td>
                  <td className="p-2 space-x-2">
                    <button className="btn btn-outline" onClick={() => setEdit({ wallet: d.wallet, salary: formatUnits(d.salary as bigint, 18), interval: d.interval })}>Edit</button>
                    <button className="btn btn-outline" onClick={() => setUpdateWallet({ oldWallet: d.wallet, newWallet: '' })}>Update Wallet</button>
                    <button className="btn btn-outline" onClick={() => setSetNext({ wallet: d.wallet, next: '' })}>Set Next Payday</button>
                    <button className="btn btn-outline" onClick={() => onRemove(d.wallet)}>Remove</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="mt-4 card">
          <div className="section-title">Update Employee</div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="label">Wallet</div>
              <input className="input" value={edit.wallet} disabled />
            </div>
            <div>
              <div className="label">Salary (cUSD)</div>
              <input className="input" value={edit.salary} onChange={e => setEdit({ ...edit, salary: e.target.value as any })} />
            </div>
            <div>
              <div className="label">Interval</div>
              <select className="input" value={edit.interval} onChange={e => setEdit({ ...edit, interval: Number(e.target.value) as Interval })}>
                <option value={0}>Weekly</option>
                <option value={1}>Bi-Weekly</option>
                <option value={2}>Monthly</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={onUpdate} disabled={isPending || waiting}>{isPending || waiting ? 'Updating…' : 'Save Changes'}</button>
            <button className="btn btn-outline ml-2" onClick={() => setEdit(null)}>Cancel</button>
          </div>
        </div>
      )}

      {updateWallet && (
        <div className="mt-4 card">
          <div className="section-title">Update Wallet</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="label">Old Wallet</div>
              <input className="input" value={updateWallet.oldWallet} disabled />
            </div>
            <div>
              <div className="label">New Wallet</div>
              <input className="input" value={updateWallet.newWallet} onChange={e => setUpdateWallet({ ...updateWallet, newWallet: e.target.value }) as any} placeholder="0x..." />
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={onUpdateWallet} disabled={isPending || waiting}>{isPending || waiting ? 'Updating…' : 'Update Wallet'}</button>
            <button className="btn btn-outline ml-2" onClick={() => setUpdateWallet(null)}>Cancel</button>
          </div>
        </div>
      )}

      {setNext && (
        <div className="mt-4 card">
          <div className="section-title">Set Next Payday</div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="label">Wallet</div>
              <input className="input" value={setNext.wallet} disabled />
            </div>
            <div>
              <div className="label">Next Payday (UTC)</div>
              <input className="input" type="datetime-local" onChange={e => setSetNext({ ...setNext, next: e.target.value }) as any} />
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={onSetNext} disabled={isPending || waiting}>{isPending || waiting ? 'Submitting…' : 'Set Next Payday'}</button>
            <button className="btn btn-outline ml-2" onClick={() => setSetNext(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
