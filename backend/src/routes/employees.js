import { Router } from 'express';
import Employee from '../models/Employee.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.use(authRequired);

router.post('/', async (req, res) => {
  try {
    const employerId = req.user.employerId;
    const { name, wallet, salary, interval, nextPayday } = req.body;
    const emp = await Employee.create({ employerId, name, wallet, salary, interval, nextPayday });
    res.json(emp);
  } catch (e) {
    res.status(500).json({ error: 'Create failed', details: e.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const employerId = req.user.employerId;
    const list = await Employee.find({ employerId }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: 'List failed', details: e.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const employerId = req.user.employerId;
    const emp = await Employee.findOneAndUpdate({ _id: req.params.id, employerId }, req.body, { new: true });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    res.json(emp);
  } catch (e) {
    res.status(500).json({ error: 'Update failed', details: e.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const employerId = req.user.employerId;
    const emp = await Employee.findOneAndDelete({ _id: req.params.id, employerId });
    if (!emp) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Delete failed', details: e.message });
  }
});

export default router;
