import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import Employer from '../models/Employer.js';
import Employee from '../models/Employee.js';
import PayrollLog from '../models/PayrollLog.js';
import { getPayrollContract, getTokenBalance } from '../setup/web3.js';

const router = Router();
router.use(authRequired);

router.post('/run', async (req, res) => {
  try {
    const employer = await Employer.findById(req.user.employerId);
    if (!employer || !employer.contractAddress) return res.status(400).json({ error: 'Contract not set for employer' });

    const limit = Number(req.body.limit || 200);
    const contract = await getPayrollContract(employer.contractAddress);
    const tx = await contract.runPayroll(limit);
    const receipt = await tx.wait();

    // Parse events and log
    const now = new Date();
    const ifaceEvents = receipt.logs
      .map(l => {
        try { return contract.interface.parseLog(l); } catch { return null; }
      })
      .filter(Boolean);

    const payments = [];
    for (const ev of ifaceEvents) {
      if (ev.name === 'PayrollPaid') {
        const wallet = ev.args.wallet;
        const amount = ev.args.amount.toString();
        const txHash = receipt.hash;
        const emp = await Employee.findOne({ employerId: employer._id, wallet });
        if (emp) {
          await PayrollLog.create({ employeeId: emp._id, amount, txHash, status: 'success', paidAt: now });
          payments.push({ employeeId: emp._id, wallet, amount, txHash });
        }
      }
    }

    res.json({ txHash: receipt.hash, payments });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Payroll run failed', details: e.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const employerId = req.user.employerId;
    const employees = await Employee.find({ employerId });
    const ids = employees.map(e => e._id);
    const logs = await PayrollLog.find({ employeeId: { $in: ids } }).sort({ paidAt: -1 }).limit(200);
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'History failed', details: e.message });
  }
});

export default router;
