import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import Employer from '../models/Employer.js';
import { getTokenBalance } from '../setup/web3.js';

const router = Router();
router.use(authRequired);

router.get('/balance', async (req, res) => {
  try {
    const employer = await Employer.findById(req.user.employerId);
    if (!employer || !employer.contractAddress) return res.status(400).json({ error: 'Contract not set for employer' });
    const bal = await getTokenBalance(employer.contractAddress);
    res.json({ balance: bal });
  } catch (e) {
    res.status(500).json({ error: 'Balance failed', details: e.message });
  }
});

export default router;
