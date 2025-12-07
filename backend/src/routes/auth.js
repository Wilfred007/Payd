import { Router } from 'express';
import bcrypt from 'bcryptjs';
import Employer from '../models/Employer.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { companyName, email, password } = req.body;
    if (!companyName || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const existing = await Employer.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email in use' });
    const passwordHash = await bcrypt.hash(password, 10);
    const employer = await Employer.create({ companyName, email, passwordHash });
    const token = signToken({ employerId: employer._id, email: employer.email });
    res.json({ token, employer: { id: employer._id, companyName, email } });
  } catch (e) {
    res.status(500).json({ error: 'Signup failed', details: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const employer = await Employer.findOne({ email });
    if (!employer) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, employer.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const token = signToken({ employerId: employer._id, email: employer.email });
    res.json({ token, employer: { id: employer._id, companyName: employer.companyName, email } });
  } catch (e) {
    res.status(500).json({ error: 'Login failed', details: e.message });
  }
});

export default router;
