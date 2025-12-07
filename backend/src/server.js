import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './setup/db.js';
import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import payrollRoutes from './routes/payroll.js';
import walletRoutes from './routes/wallet.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/employees', employeeRoutes);
app.use('/payroll', payrollRoutes);
app.use('/wallet', walletRoutes);

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`API listening on :${PORT}`));
}).catch((err) => {
  console.error('Failed to connect DB', err);
  process.exit(1);
});
