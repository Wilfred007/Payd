import React from 'react'
import BalanceCard from './BalanceCard'
import DepositForm from './DepositForm'
import RunPayroll from './RunPayroll'
import Employees from './Employees'
import History from './History'
// import BalanceCard from './BalanceCard'
// import DepositForm from './DepositForm'
// import RunPayroll from './RunPayroll'
// import Employees from './Employees'
// import History from './History'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid-cards">
        <BalanceCard />
        <DepositForm />
        <RunPayroll />
      </div>
      <Employees />
      <History />
    </div>
  )
}
