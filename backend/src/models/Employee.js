import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true, index: true },
  name: { type: String, required: true },
  wallet: { type: String, required: true },
  salary: { type: String, required: true }, // store as string to avoid JS float
  interval: { type: String, enum: ['monthly', 'weekly', 'bi-weekly'], required: true },
  nextPayday: { type: Date, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export default mongoose.model('Employee', EmployeeSchema);
