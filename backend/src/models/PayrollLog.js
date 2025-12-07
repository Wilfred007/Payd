import mongoose from 'mongoose';

const PayrollLogSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  amount: { type: String, required: true },
  txHash: { type: String, required: false },
  status: { type: String, enum: ['success', 'failed'], required: true },
  paidAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('PayrollLog', PayrollLogSchema);
